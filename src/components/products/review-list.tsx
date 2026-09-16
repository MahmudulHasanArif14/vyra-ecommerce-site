import { Star, CheckCircle } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reviews yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to share your thoughts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => {
        const initials = (review.profiles?.full_name || "Anonymous")
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div
            key={review.id}
            className="border-b last:border-0 pb-5 last:pb-0"
          >
            {/* Reviewer header */}
            <div className="flex items-start gap-3">
              {review.profiles?.avatar_url ? (
                <img
                  src={review.profiles.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {initials || "?"}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">
                    {review.profiles?.full_name || "Anonymous"}
                  </p>
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-medium">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {review.title && (
              <p className="font-semibold text-sm mt-3 ml-13">{review.title}</p>
            )}
            <p className="text-sm text-gray-700 mt-2 ml-13 whitespace-pre-line">
              {review.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}
