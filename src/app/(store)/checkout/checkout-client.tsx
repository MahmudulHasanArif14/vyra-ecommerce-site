"use client";

import { useCart } from "@/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  CheckoutFormValues,
} from "../../../validations/checkout";
import { createOrder } from "@/actions/orders";
import { validateCoupon } from "@/actions/coupons";
import { trackEvent } from "@/lib/analytics/track";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Tag,
  X,
  Loader2,
  Shield,
  Truck,
  RotateCcw,
  ArrowRight,
  Check,
} from "lucide-react";
import { gsap } from "gsap";

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

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validating, setValidating] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Compute totals
  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Math.max(0, cartTotal - discount);
  const deliveryFee = discountedSubtotal >= freeThreshold ? 0 : deliveryCharge;
  const total = discountedSubtotal + deliveryFee;
  const amountUntilFreeDelivery = freeThreshold - discountedSubtotal;

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

  // Entrance animation
  useEffect(() => {
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
    ).fromTo(
      summaryRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.4",
    );

    return () => {
      tl.kill();
    };
  }, [items.length]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError("");

    const result = await validateCoupon(couponCode, cartTotal);

    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      toast.success(`Coupon applied: -৳${result.coupon.discount}`);
    } else {
      setCouponError(result.error || "Invalid coupon");
      setAppliedCoupon(null);
    }
    setValidating(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

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
        couponCode: appliedCoupon?.code || null,
      });

      if (result.success) {
        trackEvent("order_created", {
          order_number: result.orderNumber,
          total,
          item_count: items.length,
          coupon: appliedCoupon?.code,
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
      <div className="bg-[#0a0a0a] min-h-screen text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-400">Add products before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
            Checkout
          </p>
          <h1
            className="text-3xl md:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Almost there
          </h1>
          <p className="text-gray-400 mt-3">
            Complete your order below — takes less than a minute.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ============================================================ */}
          {/* CHECKOUT FORM */}
          {/* ============================================================ */}
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-3 space-y-6"
          >
            {/* ============ CONTACT ============ */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Contact Information
                </h2>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Full Name
                </label>
                <input
                  {...register("fullName")}
                  placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Phone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ============ DELIVERY ============ */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Delivery Address
                </h2>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Street Address
                </label>
                <input
                  {...register("addressLine1")}
                  placeholder="House / street / area"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
                />
                {errors.addressLine1 && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    City
                  </label>
                  <input
                    {...register("city")}
                    placeholder="Sylhet"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Area
                  </label>
                  <input
                    {...register("area")}
                    placeholder="Zindabazar"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
                  />
                  {errors.area && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.area.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Delivery Notes (optional)
                </label>
                <textarea
                  {...register("deliveryNotes")}
                  rows={2}
                  placeholder="e.g. Leave at the door, call before delivery"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition resize-none"
                />
              </div>
            </div>

            {/* ============ PAYMENT ============ */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Payment Method
                </h2>
              </div>

              <label className="flex items-start gap-4 p-4 rounded-xl border border-green-500/30 bg-green-500/5 cursor-pointer transition hover:bg-green-500/10">
                <input
                  type="radio"
                  {...register("paymentMethod")}
                  value="cash_on_delivery"
                  defaultChecked
                  className="mt-1 w-4 h-4 accent-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">Cash on Delivery</p>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-300">
                      Popular
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Pay in cash when your order arrives. No advance payment
                    needed.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit button — mobile only (summary button hidden on mobile) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="lg:hidden w-full bg-white text-black py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  PLACE ORDER — ৳{total}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* ============================================================ */}
          {/* ORDER SUMMARY */}
          {/* ============================================================ */}
          <div ref={summaryRef} className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold tracking-tight">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity}
                        {item.color && ` · ${item.color}`}
                        {item.size && ` · ${item.size}`}
                      </p>
                    </div>
                    <p className="font-medium text-sm text-white tabular-nums whitespace-nowrap">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <label className="text-xs uppercase tracking-wider text-gray-500">
                    Have a coupon?
                  </label>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="font-mono font-medium text-sm text-green-300">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-400/80 mt-0.5">
                        -৳{appliedCoupon.discount}
                        {appliedCoupon.description &&
                          ` · ${appliedCoupon.description}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      aria-label="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter code"
                        className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-white/30 transition"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validating || !couponCode.trim()}
                        className="bg-white text-black px-4 py-2.5 rounded-lg text-xs tracking-wider font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition flex items-center gap-1.5"
                      >
                        {validating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "APPLY"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-xs mt-2">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white tabular-nums">৳{cartTotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">
                      Discount ({appliedCoupon?.code})
                    </span>
                    <span className="text-green-400 tabular-nums">
                      -৳{discount}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-400 font-medium">FREE</span>
                  ) : (
                    <span className="text-white tabular-nums">
                      ৳{deliveryFee}
                    </span>
                  )}
                </div>

                {/* Free delivery nudge */}
                {deliveryFee > 0 && amountUntilFreeDelivery > 0 && (
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Add ৳{amountUntilFreeDelivery} more for free delivery
                    </p>
                  </div>
                )}

                {deliveryFee === 0 && (
                  <div className="flex items-start gap-2 bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-300 leading-relaxed">
                      You qualify for free delivery!
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-2xl text-white tabular-nums">
                    ৳{total}
                  </span>
                </div>
              </div>

              {/* Submit — desktop */}
              <button
                type="submit"
                form="checkout-form"
                onClick={(e) => {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }}
                disabled={isSubmitting}
                className="hidden lg:flex w-full bg-white text-black py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-500 items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    PLACE ORDER — ৳{total}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <TrustRow icon={Shield} text="Secure checkout" />
                <TrustRow icon={RotateCcw} text="7-day easy returns" />
                <TrustRow icon={Truck} text="Fast delivery across Bangladesh" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}
