"use client";

import { useState } from "react";
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
} from "lucide-react";
import { trackOrder } from "@/actions/track-order";

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

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Find current step index
  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const isCancelled =
    order?.status === "cancelled" || order?.status === "returned";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-gray-500">
          Enter your order number to see the latest status
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg border space-y-4 max-w-lg mx-auto"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="VYRA-2026-A7K2P9"
              required
              className="w-full border p-3 pl-10 rounded-md font-mono tracking-wider"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            You'll find this in your order confirmation email
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "SEARCHING..." : "TRACK ORDER"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 max-w-lg mx-auto bg-red-50 border border-red-200 p-4 rounded-md text-sm text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="mt-8 space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Order Number
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-bold font-mono text-lg">
                    {order.order_number}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-black transition"
                    title="Copy order number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Total
                </p>
                <p className="font-bold text-2xl">৳{order.total}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {order.payment_method.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-bold mb-6">Order Status</h2>

            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800 capitalize">
                    Order {order.status}
                  </p>
                  <p className="text-sm text-red-600">
                    Contact support if you have questions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-black transition-all"
                  style={{
                    width:
                      currentStepIndex >= 0
                        ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition relative z-10 ${
                            isComplete
                              ? "border-black bg-black text-white"
                              : "border-gray-200 text-gray-300"
                          } ${isCurrent ? "ring-4 ring-gray-200" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <p
                          className={`text-[10px] uppercase tracking-wider mt-2 text-center ${
                            isComplete
                              ? "font-bold text-black"
                              : "text-gray-400"
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

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-bold mb-4">
              Items ({order.order_items.length})
            </h2>
            <div className="space-y-3">
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      ৳{item.unit_price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">৳{item.line_total}</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>৳{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>
                  {Number(order.delivery_fee) === 0
                    ? "FREE"
                    : `৳${order.delivery_fee}`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>৳{order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.order_addresses?.[0] && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="font-bold mb-3">Delivery Address</h2>
              <p className="text-sm font-medium">
                {order.order_addresses[0].full_name}
              </p>
              <p className="text-sm text-gray-600">
                {order.order_addresses[0].phone}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.order_addresses[0].address_line1}
              </p>
              <p className="text-sm text-gray-600">
                {order.order_addresses[0].city}
                {order.order_addresses[0].postal_code &&
                  `, ${order.order_addresses[0].postal_code}`}
              </p>
              {order.order_addresses[0].delivery_notes && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Note: {order.order_addresses[0].delivery_notes}
                </p>
              )}
            </div>
          )}

          {/* Help */}
          <div className="text-center text-sm text-gray-500 pt-4">
            Need help?{" "}
            <Link href="/contact" className="text-black underline">
              Contact support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
