import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import SplitHero from "@/components/store/split-hero";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const { data: bestSellers } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, compare_at_price, featured,
      product_images(image_url, is_primary),
      product_variants(id, price, stock_quantity, color_hex, color_name)
    `,
    )
    .eq("featured", true)
    .eq("is_active", true)
    .limit(4);

  return (
    <div className="bg-transparent min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative">
        <SplitHero />

        {/* ============================================================ */}
        {/* SHOP BY CATEGORY */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <FadeIn y={30}>
            <div className="text-center mb-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
                Browse
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Shop by Category
              </h2>
            </div>
          </FadeIn>

          <StaggerChildren
            stagger={0.1}
            y={30}
            className="grid grid-cols-2 md:grid-cols-5 gap-6"
            selector=":scope > a"
          >
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group text-center space-y-4"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white transition-all duration-300">
                  <Image
                    src={
                      cat.image_url ||
                      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400"
                    }
                    sizes="160px"
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-sm font-medium tracking-wider text-gray-300 group-hover:text-white transition">
                  {cat.name}
                </p>
              </Link>
            ))}
          </StaggerChildren>
        </section>

        {/* ============================================================ */}
        {/* BEST SELLERS */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <FadeIn y={30}>
            <div className="text-center mb-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
                Featured
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Best Sellers
              </h2>
            </div>
          </FadeIn>

          <ProductGrid products={bestSellers || []} />
        </section>
      </div>
    </div>
  );
}
