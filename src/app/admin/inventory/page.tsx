import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
} from "lucide-react";
import InventoryTable from "./inventory-table";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { filter, q } = await searchParams;

  // Query 1: variants
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
      <div className="bg-[#0a0a0a] min-h-screen text-white p-6 md:p-8">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Inventory
        </h1>
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl text-sm text-red-300">
          Failed to load variants: {variantError.message}
        </div>
      </div>
    );
  }

  // Query 2: products
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

  // Query 3: categories
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

  // Join in JS
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
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Stock
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Inventory
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage stock levels across all product variants
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Units */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Total Units
                </p>
              </div>
            </div>

            {/* Stock Value */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  ৳{totalValue.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Stock Value
                </p>
              </div>
            </div>

            {/* Low Stock */}
            <Link
              href="/admin/inventory?filter=low"
              className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group ${
                filter === "low"
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-white/[0.03] border border-white/10 hover:border-yellow-500/30 hover:bg-white/[0.05]"
              }`}
            >
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    filter === "low"
                      ? "bg-yellow-500/20 border-yellow-500/40"
                      : "bg-yellow-500/10 border-yellow-500/20"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-300 tabular-nums">
                  {lowStockCount}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Low Stock
                </p>
              </div>
            </Link>

            {/* Out of Stock */}
            <Link
              href="/admin/inventory?filter=out"
              className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group ${
                filter === "out"
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-white/[0.03] border border-white/10 hover:border-red-500/30 hover:bg-white/[0.05]"
              }`}
            >
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-red-500/10 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    filter === "out"
                      ? "bg-red-500/20 border-red-500/40"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-300 tabular-nums">
                  {outOfStockCount}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Out of Stock
                </p>
              </div>
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FILTERS + SEARCH */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.15}>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/inventory"
                className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-300 ${
                  !filter
                    ? "bg-white text-black"
                    : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/[0.05]"
                }`}
              >
                All ({enriched.length})
              </Link>
              <Link
                href="/admin/inventory?filter=low"
                className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-300 ${
                  filter === "low"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-yellow-500/30 hover:bg-white/[0.05]"
                }`}
              >
                Low ({lowStockCount})
              </Link>
              <Link
                href="/admin/inventory?filter=out"
                className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-300 ${
                  filter === "out"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-red-500/30 hover:bg-white/[0.05]"
                }`}
              >
                Out ({outOfStockCount})
              </Link>
            </div>

            {/* Search */}
            <form method="GET" className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search by product, SKU, or color..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
                />
              </div>
            </form>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* TABLE */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <InventoryTable variants={filtered} />
        </FadeIn>
      </div>
    </div>
  );
}
