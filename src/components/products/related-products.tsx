import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import StaggerChildren from "@/components/animation/stagger-children";
import FadeIn from "@/components/animation/fade-in";
import ProductCard from "./product-card";
import { getWishlistProductIds } from "@/actions/wishlist";

export default async function RelatedProducts({
  productId,
  categoryId,
  gender,
  limit = 4,
}: {
  productId: string;
  categoryId: string | null;
  gender: string | null;
  limit?: number;
}) {
  const supabase = await createClient();

  // ============================================================
  // Strategy: same gender → same category → featured fallback
  // Always exclude the current product.
  // ============================================================
  let related: any[] = [];

  const baseSelect = `
    id, name, slug, base_price, compare_at_price, featured, gender,
    product_images(image_url, is_primary),
    product_variants(id, price, stock_quantity, color_hex, color_name)
  `;

  // 1. Same gender first (preferred)
  if (gender && gender !== "unisex") {
    const { data } = await supabase
      .from("products")
      .select(baseSelect)
      .eq("is_active", true)
      .eq("gender", gender)
      .neq("id", productId)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    related = data || [];
  }

  // 2. Fill remaining with same category
  if (related.length < limit && categoryId) {
    const excludeIds = [productId, ...related.map((p) => p.id)];
    const { data } = await supabase
      .from("products")
      .select(baseSelect)
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit - related.length);

    if (data) related = [...related, ...data];
  }

  // 3. Fallback: any featured products
  if (related.length < limit) {
    const excludeIds = [productId, ...related.map((p) => p.id)];
    const { data } = await supabase
      .from("products")
      .select(baseSelect)
      .eq("is_active", true)
      .eq("featured", true)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .limit(limit - related.length);

    if (data) related = [...related, ...data];
  }

  if (related.length === 0) return null;

  // Get user's wishlist to fill hearts correctly
  const wishlistIds = await getWishlistProductIds();
  const wishlistSet = new Set(wishlistIds);

  // Heading based on context
  const heading =
    gender && gender !== "unisex"
      ? `More for ${gender === "men" ? "Him" : "Her"}`
      : "You May Also Like";

  const subtitle =
    gender && gender !== "unisex"
      ? "Hand-picked from the same collection"
      : "Curated pieces you might love";

  return (
    <section className="max-w-7xl mx-auto px-4 mt-20 md:mt-24 border-t border-white/5 pt-14 md:pt-16">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <FadeIn y={20}>
        <div className="flex justify-between items-end gap-4 mb-10 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-4">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                {subtitle}
              </span>
            </div>

            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {heading}
            </h2>
          </div>

          {gender && gender !== "unisex" && (
            <Link
              href={`/${gender}`}
              className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors duration-300 shrink-0"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          )}
        </div>
      </FadeIn>

      {/* ============================================================ */}
      {/* GRID */}
      {/* ============================================================ */}
      <StaggerChildren
        stagger={0.08}
        y={40}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        selector=":scope > div"
      >
        {related.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              isInWishlist={wishlistSet.has(product.id)}
            />
          </div>
        ))}
      </StaggerChildren>
    </section>
  );
}
