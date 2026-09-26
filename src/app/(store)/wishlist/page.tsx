import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowRight, Sparkles, Package } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";
import WishlistCard from "./wishlist-card";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/wishlist");
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    return <EmptyWishlist />;
  }

  const { data: items } = await supabase
    .from("wishlist_items")
    .select(
      `
      id, created_at, product_id,
      products (
        id, name, slug, base_price, compare_at_price, is_active,
        product_images (image_url, is_primary),
        product_variants (id, price, stock_quantity, color_hex, color_name)
      )
    `,
    )
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  const validItems =
    items?.filter((i: any) => i.products && i.products.is_active) || [];

  if (validItems.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8 md:space-y-10">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="border-b border-white/5 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Saved
              </span>
            </div>

            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <h1
                  className="text-4xl md:text-6xl font-bold tracking-tight mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  My Wishlist
                </h1>
                <p className="text-gray-400">
                  {validItems.length}{" "}
                  {validItems.length === 1 ? "saved item" : "saved items"}
                </p>
              </div>

              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-white transition"
              >
                Continue shopping
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* WISHLIST GRID */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.08}
          y={30}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          selector=":scope > div"
        >
          {validItems.map((item: any) => (
            <div key={item.id}>
              <WishlistCard item={item} />
            </div>
          ))}
        </StaggerChildren>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Empty Wishlist                                                */
/* ============================================================ */
function EmptyWishlist() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-24 md:py-32 text-center">
        <FadeIn y={20}>
          {/* Heart icon with glow */}
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <Heart className="w-9 h-9 md:w-10 md:h-10 text-pink-400" />
            </div>
          </div>

          <h1
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Your Wishlist is Empty
          </h1>

          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Save items you love and come back to them later. Tap the heart on
            any product to add it here.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              START SHOPPING
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
            >
              BACK HOME
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
