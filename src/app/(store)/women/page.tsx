import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/products/product-grid";
import BreadcrumbJsonLd from "@/components/seo/breadcrumb-json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Women's Collection | VYRA Accessories",
  description:
    "Shop premium women's clothing, bags, and accessories at VYRA. Delivery across Bangladesh.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, compare_at_price, featured,
      product_images(image_url, is_primary),
      product_variants(id, price, stock_quantity, color_hex, color_name)
    `,
    )
    .in("gender", ["women", "unisex"])
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Women", url: "/women" },
        ]}
      />

      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Collection
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 tracking-wide">
          WOMEN
        </h1>
        <p className="text-gray-500 mt-3 max-w-2xl">
          Timeless pieces for the modern woman. {products?.length || 0} pieces
          available.
        </p>
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
