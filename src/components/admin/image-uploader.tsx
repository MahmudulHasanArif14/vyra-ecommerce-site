"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Star, Loader2, ImageIcon } from "lucide-react";
import { uploadProductImage } from "@/actions/admin";
import { toast } from "sonner";

type UploadedImage = {
  id?: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  color_name?: string | null;
};

export default function ImageUploader({
  images,
  setImages,
  productId = "temp",
  availableColors = [],
}: {
  images: UploadedImage[];
  setImages: (imgs: UploadedImage[]) => void;
  productId?: string;
  availableColors?: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadColor, setUploadColor] = useState<string>("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Client-side validation
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

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const result = await uploadProductImage(formData);
      if (result.success && result.url) {
        setImages([
          ...images,
          {
            image_url: result.url,
            is_primary: images.length === 0,
            sort_order: images.length,
            color_name: uploadColor || null,
          },
        ]);
      } else {
        toast.error(result.error || `Failed to upload ${file.name}`);
      }
    }

    e.target.value = "";
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const updateImageColor = (index: number, color: string) => {
    setImages(
      images.map((img, i) =>
        i === index ? { ...img, color_name: color || null } : img,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* UPLOAD CONTROLS */}
      {/* ============================================================ */}
      {availableColors.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 uppercase tracking-wider">
              Tag new uploads as:
            </span>
            <select
              value={uploadColor}
              onChange={(e) => setUploadColor(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition bg-[#0f0f0f] cursor-pointer"
            >
              <option value="">All colors (default)</option>
              {availableColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* ============================================================ */}
      {/* IMAGE GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id || i}
            className="relative rounded-xl overflow-hidden border border-white/10 group bg-white/5"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={img.image_url}
                alt=""
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>

            {/* Primary badge */}
            {img.is_primary && (
              <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-white text-black text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider">
                <Star className="w-2.5 h-2.5 fill-current" />
                PRIMARY
              </span>
            )}

            {/* Color tag badge (visible when not hovering) */}
            {img.color_name && (
              <span className="absolute top-2 right-2 z-10 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-white border border-white/20 font-medium group-hover:opacity-0 transition-opacity duration-300">
                {img.color_name}
              </span>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPrimary(i)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-yellow-100 transition-all duration-300 hover:scale-110"
                title="Set as primary"
                aria-label="Set as primary"
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-red-100 transition-all duration-300 hover:scale-110"
                title="Remove"
                aria-label="Remove image"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>

            {/* Color tag dropdown */}
            {availableColors.length > 0 && (
              <select
                value={img.color_name || ""}
                onChange={(e) => updateImageColor(i, e.target.value)}
                className="w-full text-[10px] px-2 py-1.5 border-t border-white/10 bg-[#0f0f0f] text-gray-300 cursor-pointer focus:outline-none focus:bg-white/5 transition"
                title="Tag this image to a color"
              >
                <option value="">All colors</option>
                {availableColors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Upload button */}
        <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300 group">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            form=""
          />
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mb-1.5" />
              <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-medium">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110">
                <Upload className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-white transition">
                Add Image
              </span>
            </>
          )}
        </label>
      </div>

      {/* ============================================================ */}
      {/* HELP TEXT */}
      {/* ============================================================ */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/[0.02] border border-white/10 rounded-lg p-3">
        <ImageIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-600" />
        <p className="leading-relaxed">
          <span className="text-gray-400">JPG, PNG, or WEBP</span> · Max 5MB
          each · Tag an image to a color to show it only when that color is
          selected on the storefront.
        </p>
      </div>
    </div>
  );
}
