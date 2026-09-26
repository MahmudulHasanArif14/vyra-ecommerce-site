import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/products/product-grid";
import BreadcrumbJsonLd from "@/components/seo/breadcrumb-json-ld";
import FadeIn from "@/components/animation/fade-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Men's Collection | VYRA Accessories",
  description:
    "Shop premium men's clothing, bags, and accessories at VYRA. Delivery across Bangladesh.",
  alternates: { canonical: "/men" },
};


export const revalidate = 120;

export default async function MenPage() {
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
    .in("gender", ["men", "unisex"])
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const productCount = products?.length || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Men", url: "/men" },
        ]}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="mb-12 md:mb-16 border-b border-white/5 pb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Collection
            </p>

            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              MEN
            </h1>

            <p className="text-gray-400 max-w-2xl text-base md:text-lg leading-relaxed mb-6">
              Curated essentials for the modern man.
            </p>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">
                {productCount} {productCount === 1 ? "piece" : "pieces"}
              </span>
              <span className="w-8 h-px bg-white/10" />
              <span className="text-gray-500">Free delivery over ৳5000</span>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* PRODUCT GRID */}
        {/* ============================================================ */}
        {productCount > 0 ? (
          <ProductGrid products={products || []} />
        ) : (
          <FadeIn y={20}>
            <div className="text-center py-24 border border-white/10 rounded-2xl bg-white/2">
              <p className="text-gray-400 mb-2">No products yet</p>
              <p className="text-xs text-gray-500">
                New pieces are added regularly — check back soon.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
