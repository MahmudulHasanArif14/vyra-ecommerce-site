import { createClient } from "@/lib/supabase/server";
import { getProductRating } from "@/actions/reviews";
import ReviewList from "./review-list";
import ReviewForm from "./review-form";
import { Star, Sparkles, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";

export default async function ReviewSection({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================================================
  // 1. Fetch approved reviews
  // ============================================================
  const { data: reviewsBase, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      "id, rating, title, comment, is_verified_purchase, user_id, created_at",
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const reviewIds = (reviewsBase || []).map((r) => r.id);
  const userIds = Array.from(
    new Set((reviewsBase || []).map((r) => r.user_id)),
  );

  // ============================================================
  // 2. Fetch reviewer profiles
  // ============================================================
  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    profiles = data || [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // ============================================================
  // 3. Fetch images
  // ============================================================
  let images: any[] = [];
  if (reviewIds.length > 0) {
    const { data } = await supabase
      .from("review_images")
      .select("id, review_id, image_url, sort_order")
      .in("review_id", reviewIds)
      .order("sort_order");
    images = data || [];
  }

  // ============================================================
  // 4. Fetch replies
  // ============================================================
  let replies: any[] = [];
  if (reviewIds.length > 0) {
    const { data } = await supabase
      .from("review_replies")
      .select("id, review_id, reply, is_admin_reply, created_at, user_id")
      .in("review_id", reviewIds)
      .eq("is_visible", true)
      .order("created_at", { ascending: true });
    replies = data || [];
  }

  const replyUserIds = Array.from(
    new Set(replies.map((r) => r.user_id).filter(Boolean)),
  );
  let replyProfiles: any[] = [];
  if (replyUserIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", replyUserIds);
    replyProfiles = data || [];
  }
  const replyProfileMap = new Map(replyProfiles.map((p) => [p.id, p]));

  // ============================================================
  // 5. Assemble reviews
  // ============================================================
  const reviews = (reviewsBase || []).map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) || null,
    review_images: images.filter((i) => i.review_id === r.id),
    review_replies: replies
      .filter((rp) => rp.review_id === r.id)
      .map((rp) => ({
        ...rp,
        profiles: replyProfileMap.get(rp.user_id) || null,
      })),
  }));

  // ============================================================
  // 6. Rating summary
  // ============================================================
  const { average, count, distribution } = await getProductRating(productId);

  // ============================================================
  // 7. Can this user review?
  // ============================================================
  let userReview: any = null;
  if (user) {
    const { data: existing } = await supabase
      .from("reviews")
      .select("id, rating, title, comment, is_approved")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();
    userReview = existing;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 mt-16 md:mt-20 border-t border-white/5 pt-12 md:pt-16">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <FadeIn y={20}>
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-4">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
              Feedback
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Customer Reviews
          </h2>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {/* ============================================================ */}
        {/* SUMMARY + FORM COLUMN */}
        {/* ============================================================ */}
        <div className="md:col-span-1 space-y-5">
          {/* Rating Summary Card */}
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <div className="relative text-center">
                <div className="text-5xl md:text-6xl font-bold text-white tabular-nums leading-none">
                  {average > 0 ? average.toFixed(1) : "—"}
                </div>

                <div className="flex justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  {count} review{count !== 1 ? "s" : ""}
                </p>

                {/* Distribution bars */}
                {count > 0 && (
                  <div className="mt-5 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const num = distribution[stars - 1];
                      const pct = count > 0 ? (num / count) * 100 : 0;
                      return (
                        <div
                          key={stars}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-6 text-gray-500 tabular-nums text-left">
                            {stars}★
                          </span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-gray-500 tabular-nums">
                            {num}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Review Form / Sign-in prompt / Already reviewed */}
          <FadeIn y={20} delay={0.15}>
            {!user ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Sign in to share your experience with other shoppers
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  SIGN IN
                </a>
              </div>
            ) : userReview ? (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm font-medium text-green-300">
                  Your review is published
                </p>
                <p className="text-xs text-green-400/70 mt-1">
                  Thank you for helping other shoppers
                </p>
              </div>
            ) : (
              <ReviewForm productId={productId} productSlug={productSlug} />
            )}
          </FadeIn>
        </div>

        {/* ============================================================ */}
        {/* REVIEWS LIST COLUMN */}
        {/* ============================================================ */}
        <div className="md:col-span-2">
          <FadeIn y={20} delay={0.2}>
            <ReviewList reviews={reviews} showMoreButton={true} />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
