import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle, Clock } from "lucide-react";

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, title, comment, is_approved, created_at,
      products (name, slug)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-gray-500 mt-1">
          Reviews you've written on our products
        </p>
      </div>

      {reviews?.length ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white border rounded-lg p-5">
              <div className="flex justify-between items-start">
                <Link
                  href={`/products/${review.products?.slug}`}
                  className="font-medium text-sm hover:underline"
                >
                  {review.products?.name}
                </Link>
                {review.is_approved ? (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {review.title && (
                <p className="font-semibold text-sm mt-3">{review.title}</p>
              )}
              <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
          <p>You haven't written any reviews yet.</p>
          <Link
            href="/products"
            className="text-xs text-black underline mt-2 inline-block"
          >
            Browse products
          </Link>
        </div>
      )}
    </div>
  );
}
