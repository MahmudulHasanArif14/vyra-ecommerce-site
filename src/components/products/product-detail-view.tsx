"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import ProductGallery from "./product-gallery";
import ProductVariantSelector from "@/app/(store)/products/[slug]/variant-selector";
import { Sparkles } from "lucide-react";

type Image = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  color_name: string | null;
};

export default function ProductDetailView({
  product,
  images,
  colors,
  sizes,
  variants,
}: {
  product: any;
  images: Image[];
  colors: string[];
  sizes: string[];
  variants: any[];
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] || null,
  );

  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Filter images by selected color
  const visibleImages = useMemo(() => {
    if (!selectedColor) return images;

    const target = selectedColor.toLowerCase().trim();
    const filtered = images.filter((img) => {
      if (!img.color_name) return true;
      return img.color_name.toLowerCase().trim() === target;
    });

    return filtered.length > 0 ? filtered : images;
  }, [images, selectedColor]);

  // Entrance animation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!galleryRef.current || !infoRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      galleryRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
    ).fromTo(
      infoRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.5",
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* ============================================================ */}
      {/* GALLERY */}
      {/* ============================================================ */}
      <div ref={galleryRef}>
        <ProductGallery
          key={selectedColor || "all"}
          images={visibleImages}
          productName={product.name}
          selectedColor={selectedColor}
        />
      </div>

      {/* ============================================================ */}
      {/* INFO */}
      {/* ============================================================ */}
      <div ref={infoRef} className="space-y-6">
        {/* Category + Name + SKU */}
        <div>
          {product.categories?.name && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-4">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                {product.categories.name}
              </span>
            </div>
          )}

          <h1
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {product.name}
          </h1>

          {product.short_description && (
            <p className="text-gray-400 mt-4 leading-relaxed text-base">
              {product.short_description}
            </p>
          )}

          {product.sku && (
            <p className="text-[10px] text-gray-600 mt-4 font-mono tracking-wider uppercase">
              SKU: {product.sku}
            </p>
          )}
        </div>

        {/* Variant Selector (Price, Colors, Sizes, Add to Cart) */}
        <ProductVariantSelector
          product={product}
          colors={colors}
          sizes={sizes}
          variants={variants}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {/* Full Description */}
        {product.description && (
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">
              Description
            </h2>
            <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <TrustRow text="Cash on Delivery available" />
          <TrustRow text="Delivery within 3-5 business days" />
          <TrustRow text="7 days return policy" />
        </div>
      </div>
    </>
  );
}

/* ============================================================ */
/* Trust Row                                                     */
/* ============================================================ */
function TrustRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
      <span>{text}</span>
    </div>
  );
}
