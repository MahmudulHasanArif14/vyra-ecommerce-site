"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { addToCart } from "@/actions/cart";
import { trackEvent } from "@/lib/analytics/track";
import { toast } from "sonner";
import WishlistButton from "./wishlist-button";

export default function ProductCard({
  product,
  isInWishlist = false,
}: {
  product: any;
  isInWishlist?: boolean;
}) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const primaryImage =
    product.product_images?.find((i: any) => i.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400";

  const totalStock =
    product.product_variants?.reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0,
    ) || 0;

  const inStock = totalStock > 0;
  const firstVariant = product.product_variants?.find(
    (v: any) => v.stock_quantity > 0,
  );

  const discount =
    product.compare_at_price && product.compare_at_price > product.base_price
      ? Math.round((1 - product.base_price / product.compare_at_price) * 100)
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || adding) return;

    setAdding(true);

    addItem({
      variantId: firstVariant.id,
      quantity: 1,
      name: product.name,
      price: product.base_price,
      image: primaryImage,
      color: firstVariant.color_name,
    });

    await addToCart(firstVariant.id, 1);

    trackEvent("add_to_cart", {
      product_id: product.id,
      variant_id: firstVariant.id,
      product_name: product.name,
      price: product.base_price,
      quantity: 1,
    });

    toast.success("Added to cart!");
    setAdding(false);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block transition-transform duration-500 hover:-translate-y-1"
    >
      {/* ============================================================ */}
      {/* IMAGE CONTAINER */}
      {/* ============================================================ */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 mb-3 transition-all duration-500 group-hover:border-white/25 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-white text-black text-[10px] px-2 py-1 rounded-md font-semibold tracking-wider shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-white/90 border border-white/20 px-3 py-1.5 rounded-full">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Wishlist button — always visible on mobile, appears on hover on desktop */}
        <div className="absolute top-3 right-3 z-20 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <WishlistButton productId={product.id} isInWishlist={isInWishlist} />
        </div>

        {/* Quick "Add to Cart" on image (desktop hover only) */}
        {inStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="hidden md:flex absolute bottom-3 left-3 right-3 items-center justify-center gap-2 bg-white text-black py-2.5 rounded-lg text-xs font-medium tracking-wider translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-lg z-20"
          >
            {adding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ADDING...
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                QUICK ADD
              </>
            )}
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* INFO */}
      {/* ============================================================ */}
      <h3 className="font-medium text-sm text-white line-clamp-2 leading-snug transition-colors duration-300 group-hover:text-cyan-300">
        {product.name}
      </h3>

      {/* Price */}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="font-semibold text-white tabular-nums">
          ৳{product.base_price}
        </span>
        {product.compare_at_price &&
          product.compare_at_price > product.base_price && (
            <span className="text-gray-500 line-through text-sm tabular-nums">
              ৳{product.compare_at_price}
            </span>
          )}
      </div>

      {/* Color dots */}
      {product.product_variants?.length > 0 && (
        <div className="flex gap-1.5 mt-2.5">
          {Array.from(
            new Set(product.product_variants.map((v: any) => v.color_hex)),
          )
            .slice(0, 4)
            .map((hex: any) => (
              <span
                key={hex}
                className="w-3 h-3 rounded-full border border-white/20 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: hex }}
              />
            ))}
        </div>
      )}

      {/* Add to cart button — mobile + desktop */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!inStock || adding}
        className={`w-full mt-3 py-2.5 text-xs tracking-widest flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap rounded-lg ${
          inStock && !adding
            ? "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
            : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
        }`}
      >
        {adding ? (
          <>
            <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
            <span>ADDING...</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3 h-3 shrink-0" />
            <span>{inStock ? "ADD TO CART" : "OUT OF STOCK"}</span>
          </>
        )}
      </button>
    </Link>
  );
}
