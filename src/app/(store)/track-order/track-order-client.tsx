"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  CheckCircle2,
  Truck,
  Home,
  XCircle,
  Clock,
  Copy,
  Check,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { trackOrder } from "@/actions/track-order";
import { gsap } from "gsap";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  order_items: any[];
  order_addresses: any[];
};

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Inside the component:
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order");

  useEffect(() => {
    if (initialOrder && !order) {
      setOrderNumber(initialOrder.toUpperCase());
    }
  }, [initialOrder, order]);

  // Entrance animation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!formRef.current) return;

    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    );
  }, []);

  // Animate result when order loads
  useEffect(() => {
    if (!order || !resultRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-order-card]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power3.out",
        },
      );

      // Progress bar animation
      gsap.fromTo(
        "[data-progress-bar]",
        { width: "0%" },
        {
          width:
            currentStepIndex >= 0
              ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
              : "0%",
          duration: 1.2,
          delay: 0.4,
          ease: "power3.out",
        },
      );
    }, resultRef);

    return () => ctx.revert();
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    const result = await trackOrder(orderNumber);

    if (result.success && result.order) {
      setOrder(result.order as Order);
    } else {
      setError(result.error || "Not found");
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const isCancelled =
    order?.status === "cancelled" || order?.status === "returned";

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-20">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
              Order Tracking
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Track Your Order
          </h1>

          <p className="text-gray-400 max-w-md mx-auto">
            Enter your order number to see the latest status.
          </p>
        </div>

        {/* ============================================================ */}
        {/* SEARCH FORM */}
        {/* ============================================================ */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 max-w-lg mx-auto backdrop-blur-sm"
        >
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
              Order Number
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="VYRA-2026-A7K2P9"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-11 pr-4 py-3.5 font-mono tracking-wider text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You'll find this in your order confirmation email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
                SEARCHING...
              </>
            ) : (
              <>
                TRACK ORDER
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* ============================================================ */}
        {/* ERROR */}
        {/* ============================================================ */}
        {error && (
          <div className="mt-6 max-w-lg mx-auto bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* ORDER DETAILS */}
        {/* ============================================================ */}
        {order && (
          <div ref={resultRef} className="mt-10 space-y-5">
            {/* ---------- Header Card ---------- */}
            <div
              data-order-card
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                    Order Number
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-mono text-lg text-white">
                      {order.order_number}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="text-gray-500 hover:text-white transition p-1 rounded"
                      title="Copy order number"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                    Total
                  </p>
                  <p className="font-bold text-2xl text-white tabular-nums">
                    ৳{order.total}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    {order.payment_method.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- Status Timeline ---------- */}
            <div
              data-order-card
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-lg font-bold mb-6">Order Status</h2>

              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-300 capitalize">
                      Order {order.status}
                    </p>
                    <p className="text-sm text-red-400/80 mt-0.5">
                      Contact support if you have questions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10" />
                  {/* Progress fill */}
                  <div
                    data-progress-bar
                    className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all"
                    style={{
                      width:
                        currentStepIndex >= 0
                          ? `calc((100% - 40px) * ${currentStepIndex / (STATUS_STEPS.length - 1)})`
                          : "0%",
                    }}
                  />

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const isComplete = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
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
                          <p
                            className={`text-[10px] uppercase tracking-[0.15em] mt-3 text-center transition-colors ${
                              isComplete
                                ? "font-semibold text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Order Items ---------- */}
            <div
              data-order-card
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-lg font-bold mb-5">
                Items ({order.order_items.length})
              </h2>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white">
                        {item.product_name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1.5 tabular-nums">
                        ৳{item.unit_price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm text-white tabular-nums whitespace-nowrap">
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

            {/* ---------- Delivery Address ---------- */}
            {order.order_addresses?.[0] && (
              <div
                data-order-card
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-lg font-bold">Delivery Address</h2>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-white">
                    {order.order_addresses[0].full_name}
                  </p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {order.order_addresses[0].phone}
                  </p>
                  <p className="text-gray-400 mt-2 leading-relaxed">
                    {order.order_addresses[0].address_line1}
                  </p>
                  <p className="text-gray-400">
                    {order.order_addresses[0].city}
                    {order.order_addresses[0].postal_code &&
                      `, ${order.order_addresses[0].postal_code}`}
                  </p>
                  {order.order_addresses[0].delivery_notes && (
                    <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-white/5">
                      Note: {order.order_addresses[0].delivery_notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ---------- Help ---------- */}
            <div
              data-order-card
              className="text-center text-sm text-gray-500 pt-4"
            >
              Need help?{" "}
              <Link
                href="/contact"
                className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition"
              >
                Contact support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
