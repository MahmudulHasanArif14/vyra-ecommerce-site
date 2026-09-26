"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  Clock,
  Loader2,
  Star as StarIcon,
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

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (reviews.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No reviews found</h3>
        <p className="text-sm text-gray-400">
          Reviews will appear here when customers leave feedback.
        </p>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================
  return (
    <div className="space-y-4">
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
            className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-300 ${
              !review.is_approved
                ? "border-l-4 border-l-amber-400 border-t-white/10 border-r-white/10 border-b-white/10"
                : "border-white/10 hover:border-white/25"
            }`}
          >
            {/* Review body */}
            <div className="p-5 md:p-6">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Header: avatar + name + badges */}
                  <div className="flex items-start gap-3 flex-wrap">
                    {review.profiles?.avatar_url ? (
                      <img
                        src={review.profiles.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                        {initials || "?"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-white">
                          {review.profiles?.full_name || "Anonymous"}
                        </span>
                        {review.profiles?.email && (
                          <span className="text-xs text-gray-500 truncate">
                            {review.profiles.email}
                          </span>
                        )}

                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 border border-green-500/20 font-medium">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}

                        {!review.is_approved && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating + product + date */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>

                    {review.products && (
                      <Link
                        href={`/products/${review.products.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition"
                      >
                        {review.products.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title + comment */}
                  {review.title && (
                    <p className="font-semibold text-sm text-white mt-4">
                      {review.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-2 whitespace-pre-line leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {!review.is_approved ? (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={isPending}
                      className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 disabled:opacity-50 inline-flex items-center gap-1.5 transition-all duration-300 font-medium"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnapprove(review.id)}
                      disabled={isPending}
                      className="text-xs border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:border-white/25 disabled:opacity-50 inline-flex items-center gap-1.5 transition-all duration-300 font-medium"
                    >
                      <XCircle className="w-3 h-3" />
                      Hide
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === review.id ? null : review.id)
                    }
                    className="text-xs border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:border-white/25 inline-flex items-center gap-1.5 transition-all duration-300 font-medium"
                    title="Reply to this review"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Reply
                  </button>

                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-300"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* EXISTING REPLIES */}
            {/* ============================================================ */}
            {review.review_replies && review.review_replies.length > 0 && (
              <div className="bg-white/[0.02] border-t border-white/10 px-5 md:px-6 py-4 space-y-3">
                {review.review_replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <CornerDownRight className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {reply.is_admin_reply && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-cyan-300">
                            <ShieldCheck className="w-3 h-3" />
                            VYRA Team
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          {new Date(reply.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!reply.is_visible && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1.5 whitespace-pre-line leading-relaxed">
                        {reply.reply}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          handleToggleReplyVisibility(
                            reply.id,
                            reply.is_visible,
                          )
                        }
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
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
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-300"
                        title="Delete reply"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============================================================ */}
            {/* REPLY FORM */}
            {/* ============================================================ */}
            {replyingTo === review.id && (
              <div className="bg-cyan-500/5 border-t border-cyan-500/20 px-5 md:px-6 py-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Reply as VYRA Team
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Thank you for your feedback..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition resize-none"
                  autoFocus
                />

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleSubmitReply(review.id)}
                    disabled={submittingReply || !replyText.trim()}
                    className="bg-white text-black px-4 py-2 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all duration-300"
                  >
                    {submittingReply ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        POSTING...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        POST REPLY
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    disabled={submittingReply}
                    className="px-4 py-2 border border-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
