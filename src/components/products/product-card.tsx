"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { addToCart } from "@/actions/cart";
import { trackEvent } from "@/lib/analytics/track";
import { toast } from "sonner";
import TiltCard from "@/components/animation/tilt-card";

import WishlistButton from "./wishlist-button"; // ⭐ NEW

export default function ProductCard({
  product,
  isInWishlist = false, // ⭐ NEW prop
}: {
  product: any;
  isInWishlist?: boolean;
}) {
  const { addItem } = useCart();

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant) return toast.error("Out of stock");

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
  };

  return (
    <TiltCard>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />

          {product.compare_at_price &&
            product.compare_at_price > product.base_price && (
              <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded">
                -
                {Math.round(
                  (1 - product.base_price / product.compare_at_price) * 100,
                )}
                %
              </span>
            )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold tracking-widest">
                OUT OF STOCK
              </span>
            </div>
          )}

          {/* ⭐ NEW: Real wishlist button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
            <WishlistButton
              productId={product.id}
              isInWishlist={isInWishlist}
            />
          </div>
        </div>

        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold">৳{product.base_price}</span>
          {product.compare_at_price &&
            product.compare_at_price > product.base_price && (
              <span className="text-gray-400 line-through text-sm">
                ৳{product.compare_at_price}
              </span>
            )}
        </div>

        {product.product_variants?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {Array.from(
              new Set(product.product_variants.map((v: any) => v.color_hex)),
            )
              .slice(0, 4)
              .map((hex: any) => (
                <span
                  key={hex}
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: hex }}
                />
              ))}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full mt-3 py-2 text-xs tracking-widest flex items-center justify-center gap-2 transition whitespace-nowrap ${
            inStock
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingBag className="w-3 h-3  shrink-0" />
          {inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>
      </Link>
    </TiltCard>
  );
}
