"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  CornerDownRight,
  ShieldCheck,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ReviewImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Reply = {
  id: string;
  reply: string;
  is_admin_reply: boolean;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  review_replies?: Reply[];
  review_images?: ReviewImage[];
};

export default function ReviewList({
  reviews,
  showMoreButton = false,
}: {
  reviews: Review[];
  showMoreButton?: boolean;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const INITIAL_COUNT = 3;
  const visible =
    showMoreButton && !showAll ? reviews.slice(0, INITIAL_COUNT) : reviews;
  const hasMore = showMoreButton && reviews.length > INITIAL_COUNT;

  // ESC closes lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white/[0.03] border border-white/10 rounded-2xl">
        <div className="relative inline-flex mb-5">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <p className="text-white font-medium">No reviews yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Be the first to share your thoughts
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {visible.map((review) => {
          const initials = (review.profiles?.full_name || "Anonymous")
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          const sortedImages = (review.review_images || []).sort(
            (a, b) => a.sort_order - b.sort_order,
          );

          return (
            <div
              key={review.id}
              className="border-b border-white/5 last:border-0 pb-6 last:pb-0"
            >
              {/* ============================================================ */}
              {/* REVIEWER HEADER */}
              {/* ============================================================ */}
              <div className="flex items-start gap-3">
                {review.profiles?.avatar_url ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt={review.profiles.full_name || ""}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                    {initials || "?"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-white">
                      {review.profiles?.full_name || "Anonymous"}
                    </p>
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 border border-green-500/20 font-medium">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-600"
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

              {/* ============================================================ */}
              {/* TITLE + BODY */}
              {/* ============================================================ */}
              {review.title && (
                <p className="font-semibold text-sm text-white mt-3 ml-13">
                  {review.title}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-2 ml-13 whitespace-pre-line leading-relaxed">
                {review.comment}
              </p>

              {/* ============================================================ */}
              {/* REVIEW IMAGES */}
              {/* ============================================================ */}
              {sortedImages.length > 0 && (
                <div className="ml-13 mt-4 flex gap-2 flex-wrap">
                  {sortedImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightbox(img.image_url)}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
                      aria-label="View review photo"
                    >
                      <Image
                        src={img.image_url}
                        alt="Review photo"
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-[8px] uppercase tracking-wider text-white font-medium">
                          View
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ============================================================ */}
              {/* REPLIES */}
              {/* ============================================================ */}
              {review.review_replies && review.review_replies.length > 0 && (
                <div className="ml-13 mt-4 space-y-3">
                  {review.review_replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-cyan-500/5 border-l-2 border-cyan-500/40 rounded-r-lg p-3.5"
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CornerDownRight className="w-3 h-3 text-cyan-400" />
                        {reply.is_admin_reply ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-cyan-300">
                            <ShieldCheck className="w-3 h-3" />
                            VYRA Team
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-white">
                            {reply.profiles?.full_name || "Customer"}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          {new Date(reply.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                        {reply.reply}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* SEE MORE / SHOW LESS */}
      {/* ============================================================ */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="group w-full mt-6 py-3.5 border border-white/10 rounded-lg text-xs tracking-[0.2em] uppercase font-medium text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
              See All {reviews.length} Reviews
            </>
          )}
        </button>
      )}

      {/* ============================================================ */}
      {/* LIGHTBOX */}
      {/* ============================================================ */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative w-full max-w-3xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt="Review photo"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Hint */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/50">
            Press ESC to close
          </p>
        </div>
      )}
    </>
  );
}
