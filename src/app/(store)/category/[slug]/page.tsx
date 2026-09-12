import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, compare_at_price, featured,
      product_images(image_url, is_primary),
       product_variants(id, price, stock_quantity, color_hex, color_name)
    `,
    )
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-gray-500">
          Category
        </p>
        <h1 className="text-3xl font-bold mt-1">{category.name}</h1>
        {category.description && (
          <p className="text-gray-500 mt-2">{category.description}</p>
        )}
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
