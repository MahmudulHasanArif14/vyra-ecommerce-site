import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductViewTracker from "./view-tracker";
import ProductDetailView from "@/components/products/product-detail-view";
import ReviewSection from "@/components/products/review-section";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const normalized = slug.toLowerCase().trim().replace(/\s+/g, "-");
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(name, slug),
      product_images(id, image_url, alt_text, is_primary, sort_order, color_name),
      product_variants(id, price, stock_quantity, color_hex, color_name, size_name, sku)
    `,
    )
    .or(`slug.eq.${slug},slug.eq.${normalized}`)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) notFound();

  // Sort images: primary first, then by sort_order
  const sortedImages = [...(product.product_images || [])].sort(
    (a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    },
  );

  const colors = Array.from(
    new Set(product.product_variants.map((v: any) => v.color_name)),
  ).filter(Boolean) as string[];

  const sizes = Array.from(
    new Set(product.product_variants.map((v: any) => v.size_name)),
  ).filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <ProductViewTracker
        productId={product.id}
        productName={product.name}
        price={product.base_price}
      />

      {/* Grid wrapper that holds gallery + detail view */}
      <div className="grid md:grid-cols-2 gap-12">
        <ProductDetailView
          product={product}
          images={sortedImages}
          colors={colors}
          sizes={sizes}
          variants={product.product_variants}
        />
      </div>

      <ReviewSection productId={product.id} productSlug={product.slug} />
    </div>
  );
}
