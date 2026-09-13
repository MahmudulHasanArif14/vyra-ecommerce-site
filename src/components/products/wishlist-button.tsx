"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
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

    const previous = inWishlist;
    setInWishlist(!previous); // optimistic

    startTransition(async () => {
      const result = await toggleWishlist(productId);

      if (result.success) {
        if (result.added) {
          toast.success("Added to wishlist");
        } else {
          toast.success("Removed from wishlist");
        }
        router.refresh();
      } else {
        // rollback
        setInWishlist(previous);
        toast.error(result.error || "Failed to update wishlist");
      }
    });
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center justify-center gap-2 px-4 py-3 border text-sm font-medium transition w-full ${
          inWishlist
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-gray-300 hover:border-black"
        } disabled:opacity-50`}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        {inWishlist ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition disabled:opacity-50"
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-4 h-4 transition ${
          inWishlist ? "fill-red-500 text-red-500" : "text-black"
        }`}
      />
    </button>
  );
}
