"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  color_name: string | null;
};

export default function ProductGallery({
  images,
  productName,
  selectedColor,
}: {
  images: GalleryImage[];
  productName: string;
  selectedColor?: string | null;
}) {
  // Reset to first image whenever the image set changes (color switch, etc.)
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // ⭐ Reset index when images array identity changes
  useEffect(() => {
    setActiveIndex(0);
    setIsZoomed(false);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  // Clamp index in case images array shrank
  const safeIndex = Math.min(activeIndex, images.length - 1);
  const activeImage = images[safeIndex];

  const goNext = () => {
    setActiveIndex((i) => (i + 1) % images.length);
    setIsZoomed(false);
  };
  const goPrev = () => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
    setIsZoomed(false);
  };
  const selectImage = (i: number) => {
    setActiveIndex(i);
    setIsZoomed(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
        <Image
          // ⭐ key forces a fresh <img> whenever the URL changes — no stale caching
          key={activeImage.id}
          src={activeImage.image_url}
          alt={activeImage.alt_text || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          priority={safeIndex === 0}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Prev/Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
            {safeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => selectImage(i)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition bg-gray-50 ${
                safeIndex === i
                  ? "border-black"
                  : "border-transparent hover:border-gray-400"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${productName} thumbnail ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
