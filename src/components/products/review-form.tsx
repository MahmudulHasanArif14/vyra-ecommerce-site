"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Star,
  X,
  Image as ImageIcon,
  Loader2,
  Send,
  MessageSquare,
} from "lucide-react";
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

    // Validate each file
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, WEBP allowed`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Must be under 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setUploading(true);
    const uploaded: { url: string; path: string }[] = [];

    for (const file of validFiles) {
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

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition";
  const labelClass =
    "block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2";

  // ============================================================
  // COLLAPSED STATE — "WRITE A REVIEW" button
  // ============================================================
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full bg-white text-black py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        WRITE A REVIEW
      </button>
    );
  }

  // ============================================================
  // EXPANDED STATE — form
  // ============================================================
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {/* ============================================================ */}
      {/* RATING */}
      {/* ============================================================ */}
      <div>
        <label className={labelClass}>Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 transition-colors duration-200 ${
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TITLE */}
      {/* ============================================================ */}
      <div>
        <label className={labelClass}>Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Great product!"
          maxLength={120}
          className={inputClass}
        />
      </div>

      {/* ============================================================ */}
      {/* COMMENT */}
      {/* ============================================================ */}
      <div>
        <label className={labelClass}>
          Review <span className="text-red-400">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Share your experience with this product..."
          className={`${inputClass} resize-none`}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-gray-600">Minimum 10 characters</p>
          <p
            className={`text-[10px] tabular-nums ${
              comment.length > 1800 ? "text-amber-400" : "text-gray-600"
            }`}
          >
            {comment.length} / 2000
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* IMAGE UPLOAD */}
      {/* ============================================================ */}
      <div>
        <label className={labelClass}>
          Add Photos <span className="text-gray-600">(optional, max 5)</span>
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-white/5"
            >
              <Image
                src={img.url}
                alt={`Preview ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-red-100 transition-all duration-300 hover:scale-110"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {images.length < 5 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300 disabled:opacity-50 group"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors duration-300 mb-1" />
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-cyan-300 transition-colors duration-300">
                    Add
                  </span>
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
          <p className="text-xs text-cyan-300 mt-2 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading images...
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* SUBMIT */}
      {/* ============================================================ */}
      <div className="flex gap-3 pt-2 flex-wrap">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 min-w-[180px] bg-white text-black py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              SUBMITTING...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              SUBMIT REVIEW
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setImages([]);
          }}
          disabled={submitting || uploading}
          className="px-6 py-3 border border-white/10 text-gray-300 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
