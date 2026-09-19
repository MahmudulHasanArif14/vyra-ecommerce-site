"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Star, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { submitReview, uploadReviewImage } from "@/actions/reviews";
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
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      return toast.error("Maximum 5 images per review");
    }

    setUploading(true);
    const uploaded: { url: string; path: string }[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadReviewImage(formData);

      if (result.success && result.url && result.path) {
        uploaded.push({ url: result.url, path: result.path });
      } else {
        toast.error(result.error || "Upload failed");
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    e.target.value = "";
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      return toast.error("Review must be at least 10 characters");
    }
    if (uploading) {
      return toast.error("Please wait for images to finish uploading");
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("product_slug", productSlug);
    formData.append("rating", String(rating));
    formData.append("title", title);
    formData.append("comment", comment);
    images.forEach((img, i) => {
      formData.append(`image_url_${i}`, img.url);
    });

    const result = await submitReview(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Thank you! Your review has been published.");
      setOpen(false);
      setRating(5);
      setTitle("");
      setComment("");
      setImages([]);
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

      {/* ⭐ Image upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Add Photos <span className="text-gray-400">(optional, max 5)</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden border group bg-gray-50"
            >
              <Image
                src={img.url}
                alt={`Preview ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50"
                title="Remove"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-black transition disabled:opacity-50 bg-gray-50"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageSelect}
          disabled={uploading}
          className="hidden"
          form=""
        />

        {uploading && (
          <p className="text-xs text-gray-500 mt-2">Uploading images...</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 bg-black text-white py-2.5 text-xs tracking-widest rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setImages([]);
          }}
          className="px-4 py-2.5 border rounded-md text-xs hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
