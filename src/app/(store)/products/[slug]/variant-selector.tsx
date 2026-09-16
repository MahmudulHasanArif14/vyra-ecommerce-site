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
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">৳{price}</span>
        {product.compare_at_price && product.compare_at_price > price && (
          <>
            <span className="text-gray-400 line-through">
              ৳{product.compare_at_price}
            </span>
            <span className="text-sm font-semibold text-green-600">
              -{Math.round((1 - price / product.compare_at_price) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Color selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Color
            </h3>
            <span className="text-sm text-gray-500">{selectedColor}</span>
          </div>
          <div className="flex gap-3">
            {colors.map((color: string) => {
              const variant = variants.find((v: any) => v.color_name === color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onColorChange(color);
                    setSelectedSize(null); // reset size when color changes
                    setQuantity(1);
                  }}
                  className={`w-10 h-10 rounded-full border-2 p-0.5 transition ${
                    selectedColor === color
                      ? "border-black"
                      : "border-gray-200 hover:border-gray-400"
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
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Size
            </h3>
            <span className="text-sm text-gray-500">{selectedSize}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {sizes.map((size: string) => {
              const variant = variants.find(
                (v: any) =>
                  v.size_name === size &&
                  (v.color_name === selectedColor || !selectedColor),
              );
              const isDisabled = !variant || variant.stock_quantity <= 0;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  disabled={isDisabled}
                  className={`px-4 py-2 border text-sm font-medium transition ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-black"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed line-through" : ""}`}
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
            <span className="text-red-600 font-medium">✕ Out of stock</span>
          ) : selectedVariant.stock_quantity <= 5 ? (
            <span className="text-orange-600 font-medium">
              ⚠ Only {selectedVariant.stock_quantity} left in stock
            </span>
          ) : (
            <span className="text-green-600 font-medium">✓ In stock</span>
          )}
        </div>
      )}

      {/* Quantity selector */}
      <div>
        <label className="block text-sm font-semibold uppercase tracking-wider mb-3">
          Quantity
        </label>
        <div className="flex items-center border w-fit">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="p-3 hover:bg-gray-50 disabled:opacity-30"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-6 py-3 text-sm font-medium min-w-[50px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(Math.min(maxQuantity || 99, quantity + 1))
            }
            disabled={quantity >= maxQuantity}
            className="p-3 hover:bg-gray-50 disabled:opacity-30"
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
            className={`flex-1 py-4 text-sm tracking-widest font-medium flex items-center justify-center gap-2 transition ${
              isOutOfStock || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {loading ? "ADDING..." : "ADD TO CART"}
          </button>

          {/* ⭐ NEW: Real wishlist button */}
          <div className="w-14">
            <WishlistButton
              productId={product.id}
              isInWishlist={product.isInWishlist || false}
            />
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="w-14 border flex items-center justify-center hover:bg-gray-50 transition"
            title="Add to wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Buy Now — big black button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || loading}
          className={`w-full py-4 text-sm tracking-widest font-medium flex items-center justify-center gap-2 transition ${
            isOutOfStock || loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#8B5E3C] text-white hover:bg-[#704A2E]"
          }`}
        >
          <Zap className="w-4 h-4" />
          {loading ? "PROCESSING..." : "BUY NOW"}
        </button>
      </div>

      {/* Trust badges */}
      <div className="pt-6 border-t space-y-2 text-sm text-gray-600">
        <p>✓ Cash on Delivery available</p>
        <p>✓ Delivery within 3-5 business days</p>
        <p>✓ 7 days return policy</p>
      </div>
    </div>
  );
}
