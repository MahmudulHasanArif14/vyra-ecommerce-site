import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  // Strategy: try same gender → then same category → then popular
  // Always exclude the current product.
  // ============================================================

  let related: any[] = [];

  // 1. Same gender first (preferred)
  if (gender && gender !== "unisex") {
    const { data } = await supabase
      .from("products")
      .select(
        `
        id, name, slug, base_price, compare_at_price, featured, gender,
        product_images(image_url, is_primary),
        product_variants(id, price, stock_quantity, color_hex, color_name)
      `,
      )
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
      .select(
        `
        id, name, slug, base_price, compare_at_price, featured, gender,
        product_images(image_url, is_primary),
        product_variants(id, price, stock_quantity, color_hex, color_name)
      `,
      )
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit - related.length);

    if (data) related = [...related, ...data];
  }

  // 3. If still not enough, grab any featured products
  if (related.length < limit) {
    const excludeIds = [productId, ...related.map((p) => p.id)];
    const { data } = await supabase
      .from("products")
      .select(
        `
        id, name, slug, base_price, compare_at_price, featured, gender,
        product_images(image_url, is_primary),
        product_variants(id, price, stock_quantity, color_hex, color_name)
      `,
      )
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

  // Heading text based on context
  const heading =
    gender && gender !== "unisex"
      ? `More for ${gender === "men" ? "Him" : "Her"}`
      : "You May Also Like";

  return (
    <section className="max-w-7xl mx-auto px-4 mt-24 border-t pt-16">
      <FadeIn y={20}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Curated for you
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 tracking-wide">
              {heading}
            </h2>
          </div>

          {gender && gender !== "unisex" && (
            <Link
              href={`/${gender}`}
              className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest text-gray-500 hover:text-black transition group"
            >
              VIEW ALL
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </FadeIn>

      <StaggerChildren
        stagger={0.08}
        y={40}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {related.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isInWishlist={wishlistSet.has(product.id)}
          />
        ))}
      </StaggerChildren>
    </section>
  );
}
