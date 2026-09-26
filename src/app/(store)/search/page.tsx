import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/products/product-grid";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { q = "" } = await searchParams;

  let products: any[] = [];

  if (q) {
    const { data } = await supabase
      .from("products")
      .select(
        `
        id, name, slug, base_price, compare_at_price,
        product_images(image_url, is_primary),
        product_variants(id, price, stock_quantity, color_hex, color_name)
      `,
      )
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(48);
    products = data || [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Search</h1>
      <p className="text-gray-500 mb-8">
        {q
          ? `${products.length} results for "${q}"`
          : "Enter a keyword to search"}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
