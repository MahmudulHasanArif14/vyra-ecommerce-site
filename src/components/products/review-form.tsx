"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      return toast.error("Review must be at least 10 characters");
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("product_slug", productSlug);
    formData.append("rating", String(rating));
    formData.append("title", title);
    formData.append("comment", comment);

    const result = await submitReview(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Review submitted! It will appear after approval.");
      setOpen(false);
      setRating(5);
      setTitle("");
      setComment("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to submit");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-black text-white py-3 text-xs tracking-widest rounded-md hover:bg-gray-800"
      >
        WRITE A REVIEW
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Title (optional)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Great product!"
          maxLength={120}
          className="w-full border p-2.5 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Share your experience with this product..."
          className="w-full border p-2.5 rounded-md text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length} / 2000</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-black text-white py-2.5 text-xs tracking-widest rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2.5 border rounded-md text-xs hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
