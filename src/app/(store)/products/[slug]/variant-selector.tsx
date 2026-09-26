"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { addToCart } from "@/actions/cart";
import { trackEvent } from "@/lib/analytics/track";
import { toast } from "sonner";
import { Minus, Plus, Heart, ShoppingBag, Zap } from "lucide-react";
import WishlistButton from "@/components/products/wishlist-button";

export default function ProductVariantSelector({
  product,
  colors,
  sizes,
  variants,
  selectedColor,
  onColorChange,
}: {
  product: any;
  colors: string[];
  sizes: string[];
  variants: any[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
}) {
  // const [selectedColor, onColorChange] = useState<string | null>(
  //   colors[0] || null,
  // );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  // Find matching variant
  const selectedVariant = variants.find(
    (v) =>
      (v.color_name === selectedColor || !selectedColor) &&
      (v.size_name === selectedSize || !selectedSize),
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;
  const price = selectedVariant?.price || product.base_price;
  const maxQuantity = selectedVariant?.stock_quantity || 0;

  // Helper: get the primary image for the selected color
  const variantImage =
    product.product_images?.find((img: any) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("Please select a valid variant");
    if (isOutOfStock) return toast.error("This variant is out of stock");
    if (quantity > maxQuantity)
      return toast.error(`Only ${maxQuantity} available`);

    setLoading(true);

    // 1. Update client UI immediately
    addItem({
      variantId: selectedVariant.id,
      quantity,
      name: product.name,
      price,
      image: variantImage,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    // 2. Persist to cookie
    await addToCart(selectedVariant.id, quantity);

    // 3. Track
    trackEvent("add_to_cart", {
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      price,
      quantity,
    });

    toast.success(`Added ${quantity} × ${product.name} to cart!`);
    setLoading(false);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return toast.error("Please select a valid variant");
    if (isOutOfStock) return toast.error("This variant is out of stock");

    setLoading(true);

    addItem({
      variantId: selectedVariant.id,
      quantity,
      name: product.name,
      price,
      image: variantImage,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    await addToCart(selectedVariant.id, quantity);

    trackEvent("add_to_cart", {
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      price,
      quantity,
      source: "buy_now",
    });

    // Redirect to checkout immediately
    router.push("/checkout");
  };

  const handleWishlist = () => {
    toast.success("Added to wishlist");
    trackEvent("add_to_wishlist", {
      product_id: product.id,
      product_name: product.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Price display */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
          ৳{price}
        </span>
        {product.compare_at_price && product.compare_at_price > price && (
          <>
            <span className="text-gray-500 line-through text-lg tabular-nums">
              ৳{product.compare_at_price}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">
              -{Math.round((1 - price / product.compare_at_price) * 100)}% OFF
            </span>
          </>
        )}
      </div>

      {/* Color selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500">
              Color
            </h3>
            <span className="text-xs text-gray-400">{selectedColor}</span>
          </div>
          <div className="flex gap-3">
            {colors.map((color: string) => {
              const variant = variants.find((v: any) => v.color_name === color);
              const isActive = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onColorChange(color);
                    setSelectedSize(null);
                    setQuantity(1);
                  }}
                  className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all duration-300 ${
                    isActive
                      ? "border-white scale-110 shadow-[0_0_16px_rgba(255,255,255,0.25)]"
                      : "border-white/20 hover:border-white/50"
                  }`}
                  title={color}
                >
                  <span
                    className="block w-full h-full rounded-full"
                    style={{ backgroundColor: variant?.color_hex || "#ccc" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500">
              Size
            </h3>
            <span className="text-xs text-gray-400">{selectedSize || "—"}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {sizes.map((size: string) => {
              const variant = variants.find(
                (v: any) =>
                  v.size_name === size &&
                  (v.color_name === selectedColor || !selectedColor),
              );
              const isDisabled = !variant || variant.stock_quantity <= 0;
              const isActive = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  disabled={isDisabled}
                  className={`px-5 py-2.5 border text-sm font-medium transition-all duration-300 rounded-lg ${
                    isActive
                      ? "bg-white text-black border-white"
                      : "bg-white/[0.03] text-white border-white/10 hover:border-white/30"
                  } ${
                    isDisabled
                      ? "opacity-30 cursor-not-allowed line-through"
                      : ""
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      {selectedVariant && (
        <div className="text-sm">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-2 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Out of stock
            </span>
          ) : selectedVariant.stock_quantity <= 5 ? (
            <span className="inline-flex items-center gap-2 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Only {selectedVariant.stock_quantity} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              In stock
            </span>
          )}
        </div>
      )}

      {/* Quantity selector */}
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500 mb-3">
          Quantity
        </label>
        <div className="flex items-center border border-white/10 rounded-lg w-fit bg-white/[0.02] overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-6 py-3 text-sm font-medium min-w-[50px] text-center text-white tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(Math.min(maxQuantity || 99, quantity + 1))
            }
            disabled={quantity >= maxQuantity}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {/* Add to Cart + Wishlist */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            className={`flex-1 py-4 rounded-xl text-xs tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
              isOutOfStock || loading
                ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {loading ? "ADDING..." : "ADD TO CART"}
          </button>

          <div className="w-14">
            <WishlistButton
              productId={product.id}
              isInWishlist={product.isInWishlist || false}
            />
          </div>
        </div>

        {/* Buy Now — amber gradient with glow */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || loading}
          className={`w-full py-4 rounded-xl text-xs tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
            isOutOfStock || loading
              ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
          }`}
        >
          <Zap className="w-4 h-4" />
          {loading ? "PROCESSING..." : "BUY NOW"}
        </button>
      </div>

      {/* Trust badges */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <TrustRow text="Cash on Delivery available" />
        <TrustRow text="Delivery within 3-5 business days" />
        <TrustRow text="7 days return policy" />
      </div>
    </div>
  );
}

function TrustRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
