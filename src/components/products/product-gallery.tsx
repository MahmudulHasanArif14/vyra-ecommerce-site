"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

export default function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  // Sort images: primary first, then by sort_order
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (sorted.length === 0) {
    return (
      <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  const activeImage = sorted[activeIndex];

  const goNext = () => setActiveIndex((i) => (i + 1) % sorted.length);
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
        <Image
          key={activeImage.id}
          src={activeImage.image_url}
          alt={activeImage.alt_text || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          priority={activeIndex === 0}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Prev/Next arrows (show on hover, hidden on mobile) */}
        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter badge */}
        {sorted.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
            {activeIndex + 1} / {sorted.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setIsZoomed(false);
              }}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition bg-gray-50 ${
                activeIndex === i
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
              {activeIndex === i && (
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile) */}
      {sorted.length > 1 && (
        <div className="flex justify-center gap-2 md:hidden">
          {sorted.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setIsZoomed(false);
              }}
              className={`w-2 h-2 rounded-full transition ${
                activeIndex === i ? "bg-black w-6" : "bg-gray-300"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
