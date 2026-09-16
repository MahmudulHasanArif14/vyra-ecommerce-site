"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Star } from "lucide-react";
import { uploadProductImage } from "@/actions/admin";

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
  const [uploadColor, setUploadColor] = useState<string>(""); // which color to tag new uploads with

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
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
      {/* Upload controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Tag new uploads as:</span>
          <select
            value={uploadColor}
            onChange={(e) => setUploadColor(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm bg-white"
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative rounded-md overflow-hidden border group bg-white"
          >
            {/* Image preview */}
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
              <span className="absolute top-1 left-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded">
                PRIMARY
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
              <button
                type="button"
                onClick={() => setPrimary(i)}
                className="p-1.5 bg-white rounded-full hover:bg-yellow-100"
                title="Set primary"
              >
                <Star className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="p-1.5 bg-white rounded-full hover:bg-red-100"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Color tag dropdown */}
            {availableColors.length > 0 && (
              <select
                value={img.color_name || ""}
                onChange={(e) => updateImageColor(i, e.target.value)}
                className="w-full text-[10px] px-1 py-1 border-t bg-gray-50 cursor-pointer"
                title="Tag image to a color"
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
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            form=""
          />
          <Upload className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-500">
            {uploading ? "Uploading..." : "Add Image"}
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-500">
        JPG, PNG, WEBP · Max 5MB each · Tag images to a color to show them only
        when that color is selected
      </p>
    </div>
  );
}
