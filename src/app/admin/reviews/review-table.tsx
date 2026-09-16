"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import {
  approveReview,
  unapproveReview,
  deleteReview,
} from "@/actions/reviews";
import { toast } from "sonner";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  products: { id: string; name: string; slug: string } | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export default function ReviewModerationTable({
  reviews,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveReview(id);
      if (result.success) {
        toast.success("Review approved");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to approve");
      }
    });
  };

  const handleUnapprove = (id: string) => {
    startTransition(async () => {
      const result = await unapproveReview(id);
      if (result.success) {
        toast.success("Review hidden");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unapprove");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.success) {
        toast.success("Review deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
        No reviews found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={`bg-white border rounded-lg p-5 ${
            !review.is_approved ? "border-l-4 border-l-yellow-400" : ""
          }`}
        >
          <div className="flex justify-between items-start gap-4 flex-wrap">
            {/* Left: reviewer + rating */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {review.profiles?.full_name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500">
                  {review.profiles?.email}
                </span>

                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}

                {!review.is_approved && (
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex">
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

                {review.products && (
                  <Link
                    href={`/products/${review.products.slug}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-black inline-flex items-center gap-1"
                  >
                    {review.products.name}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              {review.title && (
                <p className="font-semibold text-sm mt-3">{review.title}</p>
              )}
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                {review.comment}
              </p>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!review.is_approved ? (
                <button
                  onClick={() => handleApprove(review.id)}
                  disabled={isPending}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
              ) : (
                <button
                  onClick={() => handleUnapprove(review.id)}
                  disabled={isPending}
                  className="text-xs border px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  Hide
                </button>
              )}

              <button
                onClick={() => handleDelete(review.id)}
                disabled={isPending}
                className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
