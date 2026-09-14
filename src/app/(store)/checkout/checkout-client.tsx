"use client";

import { useCart } from "@/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/validations/checkout";
import { createOrder } from "@/actions/orders";
import { trackEvent } from "@/lib/analytics/track";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

export default function CheckoutClient({
  deliveryCharge,
  freeThreshold,
  userDefaults,
}: {
  deliveryCharge: number;
  freeThreshold: number;
  userDefaults: { fullName: string; email: string; phone: string } | null;
}) {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute delivery + total on the client (must match server logic)
  const deliveryFee = cartTotal >= freeThreshold ? 0 : deliveryCharge;
  const total = cartTotal + deliveryFee;
  const amountUntilFreeDelivery = freeThreshold - cartTotal;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash_on_delivery",
      fullName: userDefaults?.fullName || "",
      email: userDefaults?.email || "",
      phone: userDefaults?.phone || "",
    },
  });

  // Track checkout_started once on mount
  useEffect(() => {
    if (items.length > 0) {
      trackEvent("checkout_started", {
        item_count: items.length,
        cart_total: cartTotal,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return toast.error("Your cart is empty");
    setIsSubmitting(true);

    try {
      const result = await createOrder({
        customer: data,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (result.success) {
        trackEvent("order_created", {
          order_number: result.orderNumber,
          total,
          item_count: items.length,
        });

        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/checkout/success?order=${result.orderNumber}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500">Add products before checking out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12">
      {/* Checkout Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Checkout Details</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              {...register("fullName")}
              className="w-full border p-3 rounded-md"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border p-3 rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              {...register("phone")}
              className="w-full border p-3 rounded-md"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold border-b pb-2">Delivery Address</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              {...register("addressLine1")}
              className="w-full border p-3 rounded-md"
            />
            {errors.addressLine1 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.addressLine1.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                {...register("city")}
                className="w-full border p-3 rounded-md"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <input
                {...register("area")}
                className="w-full border p-3 rounded-md"
              />
              {errors.area && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.area.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Notes (optional)
            </label>
            <textarea
              {...register("deliveryNotes")}
              rows={2}
              placeholder="e.g. Leave at the door, call before delivery"
              className="w-full border p-3 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold border-b pb-2">Payment Method</h2>
          <div className="flex items-center gap-3 border p-4 rounded-md bg-gray-50">
            <input
              type="radio"
              {...register("paymentMethod")}
              value="cash_on_delivery"
              defaultChecked
              className="w-5 h-5"
            />
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-gray-500">
                Pay when you receive your order.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 text-sm tracking-widest hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {isSubmitting ? "PROCESSING..." : `PLACE ORDER — ৳${total}`}
        </button>
      </form>

      {/* Order Summary Sidebar */}
      <div className="bg-gray-50 p-6 rounded-lg h-fit space-y-6">
        <h2 className="text-xl font-bold">Order Summary</h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 items-center">
              <div className="relative w-16 h-16 rounded overflow-hidden bg-white shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} {item.color && `| ${item.color}`}{" "}
                  {item.size && `| ${item.size}`}
                </p>
              </div>
              <p className="font-medium text-sm whitespace-nowrap">
                ৳{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>৳{cartTotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            {deliveryFee === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              <span>৳{deliveryFee}</span>
            )}
          </div>

          {/* Free delivery nudge */}
          {deliveryFee > 0 && amountUntilFreeDelivery > 0 && (
            <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded">
              Add ৳{amountUntilFreeDelivery} more for free delivery
            </p>
          )}

          {deliveryFee === 0 && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-2 rounded">
              🎉 You qualify for free delivery!
            </p>
          )}

          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>৳{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
