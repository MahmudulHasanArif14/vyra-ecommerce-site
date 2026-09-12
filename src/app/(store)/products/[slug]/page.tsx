import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductVariantSelector from "./variant-selector";
import ProductViewTracker from "./view-tracker";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Next.js 15/16 requires Promise
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(name, slug),
      product_images(id, image_url, alt_text, is_primary, sort_order),
      product_variants(id, price, stock_quantity, color_hex, color_name, size_name, sku)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  // Sort images
  const sortedImages = product.product_images.sort(
    (a: any, b: any) => a.sort_order - b.sort_order,
  );
  const primaryImage =
    sortedImages.find((img: any) => img.is_primary)?.image_url ||
    sortedImages[0]?.image_url;

  // Group variants by color and size
  const colors = Array.from(
    new Set(product.product_variants.map((v: any) => v.color_name)),
  ).filter(Boolean) as string[];

  const sizes = Array.from(
    new Set(product.product_variants.map((v: any) => v.size_name)),
  ).filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
      <ProductViewTracker
        productId={product.id}
        productName={product.name}
        price={product.base_price}
      />

      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
          <Image
            src={
              primaryImage ||
              "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800"
            }
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {sortedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {sortedImages.map((img: any) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:border-black transition bg-gray-50"
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || product.name}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info & Variant Selector */}
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            {product.categories?.name}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            {product.name}
          </h1>

          {product.short_description && (
            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* SKU reference */}
          {product.sku && (
            <p className="text-xs text-gray-400 mt-2">SKU: {product.sku}</p>
          )}
        </div>

        {/* ✅ Interactive Variant Selector — handles price, add to cart, buy now */}
        <ProductVariantSelector
          product={product}
          colors={colors}
          sizes={sizes}
          variants={product.product_variants}
        />

        {/* Full description */}
        {product.description && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
          <p>✓ Cash on Delivery available</p>
          <p>✓ Delivery within 3-5 business days</p>
          <p>✓ 7 days return policy</p>
        </div>
      </div>
    </div>
  );
}
