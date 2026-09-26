"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset when images change (color switch)
  useEffect(() => {
    setActiveIndex(0);
    setIsZoomed(false);
    setLightboxOpen(false);
  }, [images]);

  // ESC closes lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll while lightbox open
  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] flex items-center justify-center">
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

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
    <>
      <div className="space-y-4">
        {/* ============================================================ */}
        {/* MAIN IMAGE */}
        {/* ============================================================ */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] group">
          <Image
            key={activeImage.id}
            src={activeImage.image_url}
            alt={activeImage.alt_text || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-transform duration-500 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            priority={safeIndex === 0}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 hover:scale-110 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 hover:scale-110 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full border border-white/10 tabular-nums z-10">
              {safeIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom button (top-right) */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 hover:scale-110 active:scale-95"
            aria-label="Open full-size image"
            title="View full-size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Selected color badge */}
          {selectedColor && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 z-10">
              {selectedColor}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* THUMBNAILS */}
        {/* ============================================================ */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => selectImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 bg-white/[0.03] group ${
                  safeIndex === i
                    ? "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                    : "border-white/10 hover:border-white/30"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="120px"
                  className={`object-cover transition-transform duration-500 ${
                    safeIndex === i ? "" : "group-hover:scale-105"
                  }`}
                />

                {/* Active overlay indicator */}
                {safeIndex === i && (
                  <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* MOBILE DOTS (shown when > 6 images) */}
        {/* ============================================================ */}
        {images.length > 6 && (
          <div className="flex md:hidden justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectImage(i)}
                className={`rounded-full transition-all duration-300 ${
                  safeIndex === i
                    ? "w-6 h-1.5 bg-cyan-400"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* LIGHTBOX */}
      {/* ============================================================ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Full-size image */}
          <div
            className="relative max-w-4xl w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={activeImage.id}
              src={activeImage.image_url}
              alt={activeImage.alt_text || productName}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-white/10 tabular-nums">
              {safeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
