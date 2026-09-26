"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function WishlistButton({
  productId,
  isInWishlist = false,
  variant = "icon",
}: {
  productId: string;
  isInWishlist?: boolean;
  variant?: "icon" | "full";
}) {
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    const previous = inWishlist;
    setInWishlist(!previous); // optimistic update

    startTransition(async () => {
      const result = await toggleWishlist(productId);

      if (result.success) {
        toast.success(
          result.added ? "Added to wishlist" : "Removed from wishlist",
        );
        router.refresh();
      } else {
        // rollback on error
        setInWishlist(previous);
        toast.error(result.error || "Failed to update wishlist");
      }
    });
  };

  // ============================================================
  // FULL VARIANT (used on product detail page)
  // ============================================================
  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={`group flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium transition-all duration-300 w-full border ${
          inWishlist
            ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
            : "border-white/10 text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/5"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart
            className={`w-4 h-4 transition-transform duration-300 ${
              inWishlist ? "fill-red-500 text-red-500" : "group-hover:scale-110"
            }`}
          />
        )}
        <span>{inWishlist ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}</span>
      </button>
    );
  }

  // ============================================================
  // ICON VARIANT (used on product cards)
  // ============================================================
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
        inWishlist
          ? "bg-red-500/20 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:bg-red-500/30"
          : "bg-black/60 border-white/10 hover:border-white/30 hover:bg-black/80"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${
            inWishlist
              ? "fill-red-500 text-red-500 scale-110"
              : "text-white hover:scale-110"
          }`}
        />
      )}

      {/* Subtle pulse ring when just saved */}
      {inWishlist && !isPending && (
        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping opacity-40 pointer-events-none" />
      )}
    </button>
  );
}
