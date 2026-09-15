import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import InventoryTable from "./inventory-table";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { filter, q } = await searchParams;

  // ⭐ Query 1: variants (no joins)
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select(
      "id, sku, color_name, color_hex, size_name, price, stock_quantity, low_stock_threshold, is_active, product_id",
    )
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true });

  console.log(
    "[Inventory] variants fetched:",
    variants?.length,
    "error:",
    variantError?.message,
  );

  if (variantError) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Inventory</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-sm text-red-700">
          Failed to load variants: {variantError.message}
        </div>
      </div>
    );
  }

  // ⭐ Query 2: products for those variants (no joins)
  const productIds = Array.from(
    new Set((variants || []).map((v) => v.product_id)),
  );

  let products: any[] = [];
  if (productIds.length > 0) {
    const { data: prodData } = await supabase
      .from("products")
      .select("id, name, slug, base_price, is_active, category_id")
      .in("id", productIds);

    products = prodData || [];
  }

  // ⭐ Optional Query 3: categories separately
  const categoryIds = Array.from(
    new Set(products.map((p) => p.category_id).filter(Boolean)),
  );

  let categories: any[] = [];
  if (categoryIds.length > 0) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);
    categories = catData || [];
  }

  // ⭐ Join in JavaScript — nothing can fail silently
  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const enriched = (variants || [])
    .map((v) => {
      const product = productMap.get(v.product_id);
      if (!product || !product.is_active) return null;
      return {
        id: v.id,
        sku: v.sku,
        color_name: v.color_name,
        color_hex: v.color_hex,
        size_name: v.size_name,
        price: v.price,
        stock_quantity: v.stock_quantity,
        low_stock_threshold: v.low_stock_threshold,
        products: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          categories: product.category_id
            ? { name: categoryMap.get(product.category_id)?.name || "—" }
            : null,
        },
      };
    })
    .filter(Boolean) as any[];

  console.log("[Inventory] enriched variants:", enriched.length);

  // Filters
  let filtered = enriched;
  if (filter === "low") {
    filtered = filtered.filter(
      (v) =>
        v.stock_quantity > 0 &&
        v.stock_quantity <= (v.low_stock_threshold || 5),
    );
  } else if (filter === "out") {
    filtered = filtered.filter((v) => v.stock_quantity === 0);
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.products?.name?.toLowerCase().includes(query) ||
        v.sku?.toLowerCase().includes(query) ||
        v.color_name?.toLowerCase().includes(query) ||
        v.size_name?.toLowerCase().includes(query),
    );
  }

  // Stats
  const totalStock = enriched.reduce((s, v) => s + v.stock_quantity, 0);
  const lowStockCount = enriched.filter(
    (v) =>
      v.stock_quantity > 0 && v.stock_quantity <= (v.low_stock_threshold || 5),
  ).length;
  const outOfStockCount = enriched.filter((v) => v.stock_quantity === 0).length;
  const totalValue = enriched.reduce(
    (s, v) => s + v.stock_quantity * (v.price || v.products?.base_price || 0),
    0,
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-gray-500 mt-1">
          Manage stock levels across all product variants
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Total Units
          </p>
          <p className="text-2xl font-bold mt-2">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Stock Value
          </p>
          <p className="text-2xl font-bold mt-2">
            ৳{totalValue.toLocaleString()}
          </p>
        </div>
        <Link
          href="/admin/inventory?filter=low"
          className={`p-5 rounded-lg border transition ${
            filter === "low"
              ? "bg-yellow-50 border-yellow-300"
              : "bg-white hover:border-yellow-300"
          }`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Low Stock
          </p>
          <p className="text-2xl font-bold mt-2 text-yellow-700">
            {lowStockCount}
          </p>
        </Link>
        <Link
          href="/admin/inventory?filter=out"
          className={`p-5 rounded-lg border transition ${
            filter === "out"
              ? "bg-red-50 border-red-300"
              : "bg-white hover:border-red-300"
          }`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Out of Stock
          </p>
          <p className="text-2xl font-bold mt-2 text-red-700">
            {outOfStockCount}
          </p>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <Link
            href="/admin/inventory"
            className={`px-4 py-2 rounded-md text-xs uppercase tracking-wider transition ${
              !filter
                ? "bg-black text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            All ({enriched.length})
          </Link>
          <Link
            href="/admin/inventory?filter=low"
            className={`px-4 py-2 rounded-md text-xs uppercase tracking-wider transition ${
              filter === "low"
                ? "bg-yellow-500 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Low Stock ({lowStockCount})
          </Link>
          <Link
            href="/admin/inventory?filter=out"
            className={`px-4 py-2 rounded-md text-xs uppercase tracking-wider transition ${
              filter === "out"
                ? "bg-red-600 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </Link>
        </div>

        <form method="GET" className="flex-1 min-w-[200px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by product, SKU, or color..."
            className="w-full border p-2.5 rounded-md text-sm"
          />
        </form>
      </div>

      <InventoryTable variants={filtered} />
    </div>
  );
}
