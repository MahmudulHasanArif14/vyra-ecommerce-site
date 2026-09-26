import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ArrowRight,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import RelatedProducts from "@/components/products/related-products";
import FadeIn from "@/components/animation/fade-in";
import SuccessConfetti from "./success-confetti";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const supabase = await createClient();
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <Package className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Order</h1>
          <p className="text-gray-400 mb-6">
            The order link is missing or invalid.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition group"
          >
            CONTINUE SHOPPING
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <Package className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-400 mb-6">
            We couldn&apos;t find an order with that number.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition group"
          >
            CONTINUE SHOPPING
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    );
  }

  const [itemsResult, addressResult] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase
      .from("order_addresses")
      .select("*")
      .eq("order_id", order.id)
      .single(),
  ]);

  const orderItems = itemsResult.data || [];
  const address = addressResult.data;

  console.log("[Success] items:", orderItems.length, "address:", !!address);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-green-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
      </div>

      <SuccessConfetti />

      <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24 space-y-8 md:space-y-10">
        {/* ============================================================ */}
        {/* SUCCESS HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="text-center">
            {/* Icon with pulse */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-40" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-green-500/10 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-400" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Payment Confirmed
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Order Confirmed!
            </h1>

            <p className="text-gray-400 max-w-md mx-auto">
              Thank you for your purchase,{" "}
              <span className="text-white font-medium">
                {address?.full_name || "friend"}
              </span>
              .
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* ORDER DETAILS CARD */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.15}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Header with order number + total */}
            <div className="bg-white/[0.02] px-6 py-5 border-b border-white/10">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Order Number
                  </p>
                  <p className="font-mono font-bold text-lg text-white">
                    {order.order_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Total Amount
                  </p>
                  <p className="font-bold text-2xl text-white tabular-nums">
                    ৳{order.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Delivery address */}
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                    Delivered To
                  </p>
                  <p className="text-sm font-medium text-white">
                    {address?.full_name}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {address?.phone}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {address?.address_line1}
                    {address?.city && `, ${address.city}`}
                    {address?.postal_code && ` - ${address.postal_code}`}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                    Payment Method
                  </p>
                  <p className="text-sm text-white">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay when you receive your order
                  </p>
                </div>
              </div>

              {/* Items count */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                    Items Ordered
                  </p>
                  <p className="text-sm text-white">
                    {orderItems.length}{" "}
                    {orderItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* DELIVERY TIMELINE */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.25}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-6">
              What happens next
            </p>

            <div className="space-y-0">
              <Step
                icon={Package}
                title="Order Received"
                description="We've received your order and are preparing it"
                active
              />
              <Step
                icon={Truck}
                title="Out for Delivery"
                description="A courier will pick up your package soon"
              />
              <Step
                icon={Home}
                title="Delivered"
                description="You'll receive your order within 3-5 business days"
                isLast
              />
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* EMAIL CONFIRMATION */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.35}>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-200/90">
                A confirmation email has been sent to
              </p>
              <p className="text-sm font-medium text-white mt-0.5 break-all">
                {order.guest_email}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* ACTION BUTTONS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.45}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/track-order?order=${orderNumber}`}
              className="group flex-1 inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              TRACK YOUR ORDER
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/products"
              className="flex-1 inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* RELATED PRODUCTS */}
        {/* ============================================================ */}
        <RelatedProducts
          productId={
            orderItems[0]?.product_id || "00000000-0000-0000-0000-000000000000"
          }
          categoryId={null}
          gender={null}
          limit={4}
        />
      </div>
    </div>
  );
}

/* ============================================================ */
/* Step component                                                */
/* ============================================================ */
function Step({
  icon: Icon,
  title,
  description,
  active = false,
  isLast = false,
}: {
  icon: any;
  title: string;
  description: string;
  active?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
            active
              ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "bg-white/[0.02] border-white/10 text-gray-500"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 my-1 ${
              active ? "bg-green-500/30" : "bg-white/10"
            }`}
          />
        )}
      </div>
      <div className="flex-1 pb-6 last:pb-0">
        <p
          className={`font-medium text-sm ${
            active ? "text-white" : "text-gray-500"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
