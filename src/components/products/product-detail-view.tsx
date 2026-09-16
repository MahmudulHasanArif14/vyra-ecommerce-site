"use client";

import { useState, useMemo } from "react";
import ProductGallery from "./product-gallery";
import ProductVariantSelector from "@/app/(store)/products/[slug]/variant-selector";

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

  // Filter images by selected color
  const visibleImages = useMemo(() => {
    if (!selectedColor) return images;

    const target = selectedColor.toLowerCase().trim();
    const filtered = images.filter((img) => {
      if (!img.color_name) return true;
      return img.color_name.toLowerCase().trim() === target;
    });

    // Fallback: if filtering removed everything, show all
    return filtered.length > 0 ? filtered : images;
  }, [images, selectedColor]);

  console.log("[DetailView] selectedColor:", selectedColor);
  console.log(
    "[DetailView] images:",
    images.map((i) => ({ color: i.color_name })),
  );
  console.log("[DetailView] visibleImages:", visibleImages.length);

  return (
    <>
      <ProductGallery
        key={selectedColor || "all"}
        images={visibleImages}
        productName={product.name}
        selectedColor={selectedColor}
      />

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            {product.categories?.name}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            {product.name}
          </h1>
          {product.short_description && (
            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.short_description}
            </p>
          )}
          {product.sku && (
            <p className="text-xs text-gray-400 mt-2">SKU: {product.sku}</p>
          )}
        </div>

        <ProductVariantSelector
          product={product}
          colors={colors}
          sizes={sizes}
          variants={variants}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {product.description && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
          <p>✓ Cash on Delivery available</p>
          <p>✓ Delivery within 3-5 business days</p>
          <p>✓ 7 days return policy</p>
        </div>
      </div>
    </>
  );
}
