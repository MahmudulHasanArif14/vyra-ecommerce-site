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

  // Approved reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, title, comment, is_verified_purchase, created_at,
      profiles:user_id (full_name, avatar_url)
    `,
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  // Aggregate rating
  const { average, count, distribution } = await getProductRating(productId);

  // Did this user already review?
  let userReview: any = null;
  let canReview = false;

  if (user) {
    const { data: existing } = await supabase
      .from("reviews")
      .select("id, rating, title, comment, is_approved")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    userReview = existing;

    // Check if the user has ever ordered this product (so we can show "verified" hint)
    if (!existing) {
      const { count: purchasedCount } = await supabase
        .from("order_items")
        .select("id, orders!inner(user_id)", { count: "exact", head: true })
        .eq("product_id", productId)
        .eq("orders.user_id", user.id);

      canReview = true; // allow review regardless of purchase
    }
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

            {/* Distribution bars */}
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

          {/* Write a review */}
          {!user ? (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <a href="/login" className="text-black underline">
                Sign in
              </a>{" "}
              to write a review
            </div>
          ) : userReview ? (
            <div className="mt-4 text-sm text-gray-500 text-center bg-green-50 border border-green-200 rounded-md p-3">
              {userReview.is_approved
                ? "✓ Your review is published"
                : "⏳ Your review is pending approval"}
            </div>
          ) : canReview ? (
            <div className="mt-4">
              <ReviewForm productId={productId} productSlug={productSlug} />
            </div>
          ) : null}
        </div>

        {/* Reviews list */}
        <div className="md:col-span-2">
          <ReviewList reviews={reviews || []} />
        </div>
      </div>
    </section>
  );
}
