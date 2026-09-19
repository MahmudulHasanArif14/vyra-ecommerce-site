import { createClient } from "@/lib/supabase/server";
import { getProductRating } from "@/actions/reviews";
import ReviewList from "./review-list";
import ReviewForm from "./review-form";
import { Star } from "lucide-react";

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
  // 1. Fetch approved reviews (no nested joins)
  // ============================================================
  const { data: reviewsBase, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      "id, rating, title, comment, is_verified_purchase, user_id, created_at",
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  console.log(
    "[ReviewSection] reviews fetched:",
    reviewsBase?.length,
    "error:",
    reviewsError?.message,
  );

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
  // 3. Fetch images for those reviews
  // ============================================================
  let images: any[] = [];
  if (reviewIds.length > 0) {
    const { data, error: imgErr } = await supabase
      .from("review_images")
      .select("id, review_id, image_url, sort_order")
      .in("review_id", reviewIds)
      .order("sort_order");

    if (imgErr) {
      console.log("[ReviewSection] images fetch error:", imgErr.message);
    }
    images = data || [];
  }

  // ============================================================
  // 4. Fetch replies for those reviews
  // ============================================================
  let replies: any[] = [];
  if (reviewIds.length > 0) {
    const { data, error: repErr } = await supabase
      .from("review_replies")
      .select("id, review_id, reply, is_admin_reply, created_at, user_id")
      .in("review_id", reviewIds)
      .eq("is_visible", true)
      .order("created_at", { ascending: true });

    if (repErr) {
      console.log("[ReviewSection] replies fetch error:", repErr.message);
    }
    replies = data || [];
  }

  // Fetch reply author profiles
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
  // 5. Assemble
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
    <section className="max-w-4xl mx-auto mt-16 border-t pt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-5xl font-bold">
              {average > 0 ? average.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(average)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {count} review{count !== 1 ? "s" : ""}
            </p>

            {count > 0 && (
              <div className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const num = distribution[stars - 1];
                  const pct = count > 0 ? (num / count) * 100 : 0;
                  return (
                    <div
                      key={stars}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-6 text-gray-500">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-gray-500">
                        {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!user ? (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <a href="/login" className="text-black underline">
                Sign in
              </a>{" "}
              to write a review
            </div>
          ) : userReview ? (
            <div className="mt-4 text-sm text-green-700 text-center bg-green-50 border border-green-200 rounded-md p-3">
              ✓ Your review is published
            </div>
          ) : (
            <div className="mt-4">
              <ReviewForm productId={productId} productSlug={productSlug} />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <ReviewList reviews={reviews} showMoreButton={true} />
        </div>
      </div>
    </section>
  );
}
