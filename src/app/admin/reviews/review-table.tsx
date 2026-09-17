"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  CornerDownRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import {
  approveReview,
  unapproveReview,
  deleteReview,
} from "@/actions/reviews";
import {
  createReply,
  deleteReply,
  toggleReplyVisibility,
} from "@/actions/review-replies";
import { toast } from "sonner";

type Reply = {
  id: string;
  reply: string;
  is_admin_reply: boolean;
  is_visible: boolean;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

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
  review_replies: Reply[];
};

export default function ReviewModerationTable({
  reviews,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveReview(id);
      if (result.success) {
        toast.success("Review approved");
        router.refresh();
      } else toast.error(result.error || "Failed");
    });
  };

  const handleUnapprove = (id: string) => {
    startTransition(async () => {
      const result = await unapproveReview(id);
      if (result.success) {
        toast.success("Review hidden");
        router.refresh();
      } else toast.error(result.error || "Failed");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.success) {
        toast.success("Review deleted");
        router.refresh();
      } else toast.error(result.error || "Failed");
    });
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return toast.error("Reply is empty");

    setSubmittingReply(true);
    const formData = new FormData();
    formData.append("review_id", reviewId);
    formData.append("reply", replyText);

    const result = await createReply(formData);
    setSubmittingReply(false);

    if (result.success) {
      toast.success("Reply posted");
      setReplyingTo(null);
      setReplyText("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to post reply");
    }
  };

  const handleToggleReplyVisibility = (replyId: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleReplyVisibility(replyId, !current);
      if (result.success) {
        toast.success(current ? "Reply hidden" : "Reply visible");
        router.refresh();
      } else toast.error(result.error || "Failed");
    });
  };

  const handleDeleteReply = (replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    startTransition(async () => {
      const result = await deleteReply(replyId);
      if (result.success) {
        toast.success("Reply deleted");
        router.refresh();
      } else toast.error(result.error || "Failed");
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
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={`bg-white border rounded-lg overflow-hidden ${
            !review.is_approved ? "border-l-4 border-l-yellow-400" : ""
          }`}
        >
          {/* Review body */}
          <div className="p-5">
            <div className="flex justify-between items-start gap-4 flex-wrap">
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
                  onClick={() =>
                    setReplyingTo(replyingTo === review.id ? null : review.id)
                  }
                  className="text-xs border px-3 py-1.5 rounded hover:bg-gray-50 inline-flex items-center gap-1"
                  title="Reply to this review"
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>

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

          {/* Existing replies */}
          {review.review_replies && review.review_replies.length > 0 && (
            <div className="bg-gray-50 border-t px-5 py-3 space-y-3">
              {review.review_replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <CornerDownRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {reply.is_admin_reply && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-blue-700">
                          <ShieldCheck className="w-3 h-3" />
                          VYRA Team
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                      {!reply.is_visible && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                      {reply.reply}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        handleToggleReplyVisibility(reply.id, reply.is_visible)
                      }
                      disabled={isPending}
                      className="p-1.5 text-gray-400 hover:text-black disabled:opacity-50"
                      title={reply.is_visible ? "Hide" : "Show"}
                    >
                      {reply.is_visible ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      disabled={isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete reply"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyingTo === review.id && (
            <div className="bg-blue-50 border-t px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Reply as VYRA Team
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Thank you for your feedback..."
                className="w-full border p-3 rounded-md text-sm bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmitReply(review.id)}
                  disabled={submittingReply || !replyText.trim()}
                  className="bg-black text-white px-4 py-2 rounded-md text-xs tracking-wider hover:bg-gray-800 disabled:bg-gray-400 inline-flex items-center gap-2"
                >
                  <Send className="w-3 h-3" />
                  {submittingReply ? "POSTING..." : "POST REPLY"}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  disabled={submittingReply}
                  className="px-4 py-2 border rounded-md text-xs hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
