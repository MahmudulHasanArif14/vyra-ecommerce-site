import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/breadcrumb-json-ld";
import FadeIn from "@/components/animation/fade-in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} | VYRA Accessories`,
    description:
      category.description ||
      `Shop premium ${category.name.toLowerCase()} at VYRA Accessories. Delivery across Bangladesh.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}


export const revalidate = 120;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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

  const productCount = products?.length || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      {/* Structured data — invisible */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: category.name, url: `/category/${category.slug}` },
        ]}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* ============================================================ */}
        {/* CATEGORY HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="mb-12 md:mb-16 border-b border-white/5 pb-10">
            {/* Breadcrumb label */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Category
            </p>

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {category.name}
            </h1>

            {/* Description */}
            {category.description && (
              <p className="text-gray-400 max-w-2xl text-base md:text-lg leading-relaxed mb-6">
                {category.description}
              </p>
            )}

            {/* Count */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">
                {productCount} {productCount === 1 ? "product" : "products"}
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
            <div className="text-center py-24 border border-white/10 rounded-2xl bg-white/[0.02]">
              <p className="text-gray-400 mb-2">
                No products in this category yet
              </p>
              <p className="text-xs text-gray-500">
                Check back soon — new pieces are added regularly.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
