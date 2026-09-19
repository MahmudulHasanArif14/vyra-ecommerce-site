import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import SplitHero from "@/components/store/split-hero";
import { getSettings } from "@/lib/settings";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

const settings = await getSettings();

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  // Fetch Best Sellers (Featured)
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
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans">
      {/* Hero Section */}
      <SplitHero />

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <FadeIn y={30}>
          <h2 className="text-center text-2xl font-bold mb-12 tracking-widest">
            SHOP BY CATEGORY
          </h2>
        </FadeIn>
        <StaggerChildren
          stagger={0.1}
          y={30}
          className="grid grid-cols-2 md:grid-cols-5 gap-6"
        >
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group text-center space-y-4"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-black transition">
                <Image
                  src={
                    cat.image_url ||
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400"
                  }
                  sizes="160px"
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold tracking-wider">{cat.name}</p>
            </Link>
          ))}
        </StaggerChildren>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <FadeIn y={30}>
          <h2 className="text-center text-2xl font-bold mb-12 tracking-widest">
            BEST SELLERS
          </h2>
        </FadeIn>

        <ProductGrid products={bestSellers || []} />
      </section>
    </div>
  );
}
