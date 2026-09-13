"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag, Trash2, Check } from "lucide-react";
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
    <div className="bg-white border rounded-lg overflow-hidden group hover:border-black transition">
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-gray-100"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold tracking-widest">
              OUT OF STOCK
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleRemove();
          }}
          disabled={removing}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition disabled:opacity-50"
          title="Remove from wishlist"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold">৳{product.base_price}</span>
          {product.compare_at_price &&
            product.compare_at_price > product.base_price && (
              <span className="text-gray-400 line-through text-sm">
                ৳{product.compare_at_price}
              </span>
            )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className={`w-full py-2 text-xs tracking-widest flex items-center justify-center gap-2 transition ${
            inStock && !adding
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingBag className="w-3 h-3" />
          {adding ? "ADDING..." : inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>
      </div>
    </div>
  );
}
