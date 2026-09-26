"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { removeFromWishlist } from "@/actions/wishlist";
import { addToCart } from "@/actions/cart";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function WishlistCard({ item }: { item: any }) {
  const product = item.products;
  const { addItem } = useCart();
  const router = useRouter();
  const [removing, startRemove] = useTransition();
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

  const handleRemove = () => {
    startRemove(async () => {
      const result = await removeFromWishlist(product.id);
      if (result.success) {
        toast.success("Removed from wishlist");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove");
      }
    });
  };

  const handleAddToCart = async () => {
    if (!firstVariant) return toast.error("Out of stock");
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
    toast.success("Added to cart!");
    setAdding(false);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-white/5 overflow-hidden"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-white text-black text-[10px] px-2 py-1 rounded-md font-semibold tracking-wider z-10">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-white/90 border border-white/20 px-3 py-1.5 rounded-full">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleRemove();
          }}
          disabled={removing}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-red-500/80 hover:text-white transition-all duration-300 disabled:opacity-50 z-10"
          title="Remove from wishlist"
        >
          {removing ? (
            <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 md:p-5 space-y-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm text-white line-clamp-2 leading-snug hover:underline transition">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
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

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className={`w-full py-2.5 rounded-lg text-xs tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
            inStock && !adding
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          {adding ? "ADDING..." : inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>
      </div>
    </div>
  );
}
