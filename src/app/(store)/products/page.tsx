import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { sort?: string; category?: string };
}) {
  const supabase = await createClient();
  const { sort = "newest", category } = await searchParams;

  let query = supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, compare_at_price, featured,
      categories(name, slug),
      product_images(image_url, is_primary),
      product_variants(id, price, stock_quantity, color_hex, color_name)
    `,
    )
    .eq("is_active", true);

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-gray-500 mt-1">{products?.length || 0} items</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="?sort=newest"
            className={`px-3 py-2 text-xs uppercase border rounded ${sort === "newest" ? "bg-black text-white" : ""}`}
          >
            Newest
          </Link>
          <Link
            href="?sort=price_asc"
            className={`px-3 py-2 text-xs uppercase border rounded ${sort === "price_asc" ? "bg-black text-white" : ""}`}
          >
            Price ↑
          </Link>
          <Link
            href="?sort=price_desc"
            className={`px-3 py-2 text-xs uppercase border rounded ${sort === "price_desc" ? "bg-black text-white" : ""}`}
          >
            Price ↓
          </Link>
        </div>
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
