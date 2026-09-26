import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/products/product-grid";
import FadeIn from "@/components/animation/fade-in";
import Link from "next/link";
import { Sparkles, TrendingDown, TrendingUp, Clock } from "lucide-react";
import BreadcrumbJsonLd from "@/components/seo/breadcrumb-json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products | VYRA Accessories",
  description:
    "Browse our full collection of premium fashion and accessories. Delivery across Bangladesh.",
  alternates: { canonical: "/products" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "price_asc", label: "Price ↑", icon: TrendingUp },
  { value: "price_desc", label: "Price ↓", icon: TrendingDown },
];

export const revalidate = 120;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
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
          { name: "All Products", url: "/products" },
        ]}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="mb-10 md:mb-14 border-b border-white/5 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                The Collection
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              All Products
            </h1>

            <p className="text-gray-400 max-w-2xl text-base md:text-lg leading-relaxed">
              {productCount} {productCount === 1 ? "piece" : "pieces"} curated
              for the modern lifestyle.
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* SORT FILTER */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Sort
            </span>

            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = sort === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={`?sort=${opt.value}${category ? `&category=${category}` : ""}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-white/25"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {category && (
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-gray-300 hover:border-white/25 transition"
            >
              Category:{" "}
              <span className="text-white font-medium">{category}</span>
              <span className="text-gray-500">✕</span>
            </Link>
          </div>
        )}

        {/* ============================================================ */}
        {/* PRODUCT GRID */}
        {/* ============================================================ */}
        {productCount > 0 ? (
          <ProductGrid products={products || []} />
        ) : (
          <FadeIn y={20}>
            <div className="text-center py-24 border border-white/10 rounded-2xl bg-white/[0.02]">
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
