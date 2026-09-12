"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Star } from "lucide-react";
import { uploadProductImage } from "@/actions/admin";

type UploadedImage = {
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

export default function ImageUploader({
  images,
  setImages,
  productId = "temp",
}: {
  images: UploadedImage[];
  setImages: (imgs: UploadedImage[]) => void;
  productId?: string;
}) {
  const [uploading, setUploading] = useState(false);

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
          },
        ]);
      }
    }

    // ⭐ Reset the input so its buffer is cleared
    e.target.value = "";
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-md overflow-hidden border group"
          >
            <Image
              src={img.image_url}
              alt=""
              fill
              sizes="150px"
              className="object-cover"
            />
            {img.is_primary && (
              <span className="absolute top-1 left-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded">
                PRIMARY
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
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
          </div>
        ))}

        {/* Upload Button — file input is fully detached from any parent form */}
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            form="" /* ⭐ Detaches from parent form */
          />
          <Upload className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-500">
            {uploading ? "Uploading..." : "Add Image"}
          </span>
        </label>
      </div>
      <p className="text-xs text-gray-500">JPG, PNG, WEBP · Max 5MB each</p>
    </div>
  );
}
