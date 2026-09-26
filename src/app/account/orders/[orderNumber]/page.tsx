import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Home,
  XCircle,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import CancelOrderButton from "@/components/account/cancel-order-button";
import CopyButton from "@/components/account/copy-button";
import FadeIn from "@/components/animation/fade-in";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Clock,
    description: "We received your order",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    description: "Order confirmed by our team",
  },
  {
    key: "processing",
    label: "Processing",
    icon: Package,
    description: "Preparing your items",
  },
  {
    key: "dispatched",
    label: "Dispatched",
    icon: Truck,
    description: "On the way to you",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: Home,
    description: "Order delivered",
  },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account/orders");

  const { orderNumber } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*),
      order_addresses (*)
    `,
    )
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const address = order.order_addresses?.[0];
  const isCancelled = ["cancelled", "returned"].includes(order.status);
  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status,
  );
  const canCancel = ["pending", "confirmed"].includes(order.status);

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "processing":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "packed":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
      case "dispatched":
        return "bg-orange-500/10 text-orange-300 border-orange-500/30";
      case "delivered":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      default:
        return "bg-white/5 text-gray-300 border-white/10";
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-6">
        {/* ============================================================ */}
        {/* BACK LINK */}
        {/* ============================================================ */}
        <FadeIn y={10}>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to orders
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold font-mono text-white">
                    {order.order_number}
                  </h1>
                  <CopyButton text={order.order_number} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border font-medium ${statusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
                {canCancel && (
                  <CancelOrderButton
                    orderId={order.id}
                    orderNumber={order.order_number}
                    redirectTo="/account/orders"
                  />
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* PROGRESS TIMELINE */}
        {/* ============================================================ */}
        {!isCancelled && currentStepIndex >= 0 && (
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold mb-8">Order Progress</h2>

              <div className="relative">
                {/* Background line — desktop */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 hidden md:block" />
                {/* Progress fill — desktop */}
                <div
                  className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all hidden md:block"
                  style={{
                    width:
                      currentStepIndex >= 0
                        ? `calc((100% - 40px) * ${currentStepIndex / (STATUS_STEPS.length - 1)})`
                        : "0%",
                  }}
                />

                {/* Steps */}
                <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isComplete = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div
                        key={step.key}
                        className="flex md:flex-col items-center gap-4 md:gap-3 md:flex-1 relative z-10"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
                            isComplete
                              ? "bg-green-500/20 border-green-500 text-green-400"
                              : "bg-white/[0.02] border-white/10 text-gray-500"
                          } ${
                            isCurrent
                              ? "shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-110"
                              : ""
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="md:text-center flex-1 md:flex-none">
                          <p
                            className={`text-sm font-medium transition-colors ${
                              isComplete ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 hidden md:block mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ============================================================ */}
        {/* CANCELLED BANNER */}
        {/* ============================================================ */}
        {isCancelled && (
          <FadeIn y={20} delay={0.1}>
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300 capitalize">
                  Order {order.status}
                </p>
                <p className="text-sm text-red-400/80 mt-1 leading-relaxed">
                  {order.status === "cancelled"
                    ? "This order has been cancelled. If you paid, a refund will be processed within 5-7 business days."
                    : "This order has been returned."}
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ============================================================ */}
        {/* ITEMS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.15}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold mb-6">
              Items ({order.order_items?.length || 0})
            </h2>

            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                    {item.product_image_url ? (
                      <Image
                        src={item.product_image_url}
                        alt={item.product_name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variant_name}
                      </p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-gray-600 font-mono mt-1">
                        SKU: {item.sku}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5 tabular-nums">
                      ৳{item.unit_price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm text-white tabular-nums whitespace-nowrap">
                    ৳{item.line_total}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-white/10 mt-6 pt-5 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white tabular-nums">
                  ৳{order.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="text-white tabular-nums">
                  {Number(order.delivery_fee) === 0
                    ? "FREE"
                    : `৳${order.delivery_fee}`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Discount</span>
                  <span className="text-green-400 tabular-nums">
                    -৳{order.discount}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-3 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-white text-lg tabular-nums">
                  ৳{order.total}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* DELIVERY ADDRESS */}
        {/* ============================================================ */}
        {address && (
          <FadeIn y={20} delay={0.2}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg font-bold">Delivery Address</h2>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-white">{address.full_name}</p>

                {address.phone && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {address.phone}
                  </p>
                )}

                {address.email && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {address.email}
                  </p>
                )}

                <p className="text-gray-400 mt-3 leading-relaxed">
                  {address.address_line1}
                </p>
                <p className="text-gray-400">
                  {address.city}
                  {address.postal_code && `, ${address.postal_code}`}
                </p>

                {address.delivery_notes && (
                  <p className="text-xs text-gray-500 italic mt-4 pt-4 border-t border-white/5">
                    Delivery note: {address.delivery_notes}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ============================================================ */}
        {/* PAYMENT */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.25}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <h2 className="text-lg font-bold">Payment</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="capitalize text-white">
                  {order.payment_method?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    order.payment_status === "paid"
                      ? "bg-green-500/10 text-green-300 border-green-500/30"
                      : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* HELP */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.3}>
          <div className="text-center text-sm text-gray-500 pt-4">
            Need help with this order?{" "}
            <Link
              href="/contact"
              className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition"
            >
              Contact support
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
