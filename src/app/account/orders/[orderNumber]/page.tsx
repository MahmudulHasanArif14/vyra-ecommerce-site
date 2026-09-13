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
  Copy,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import CancelOrderButton from "@/components/account/cancel-order-button";
import CopyButton from "@/components/account/copy-button";

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

  if (!user) redirect("/login");

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
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "packed":
        return "bg-indigo-100 text-indigo-800";
      case "dispatched":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono">
                {order.order_number}
              </h1>
              <CopyButton text={order.order_number} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
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
              className={`text-xs uppercase px-3 py-1.5 rounded font-medium ${statusColor(order.status)}`}
            >
              {order.status}
            </span>
            {canCancel && (
              <CancelOrderButton
                orderId={order.id}
                orderNumber={order.order_number}
              />
            )}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      {!isCancelled && currentStepIndex >= 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-bold mb-6">Order Progress</h2>

          <div className="relative">
            {/* Background line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 hidden md:block" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-black transition-all hidden md:block"
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
                    className="flex md:flex-col items-center gap-4 md:gap-2 md:flex-1 relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition shrink-0 ${
                        isComplete
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-300"
                      } ${isCurrent ? "ring-4 ring-gray-100" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="md:text-center flex-1 md:flex-none">
                      <p
                        className={`text-sm font-medium ${
                          isComplete ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 hidden md:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 capitalize">
              Order {order.status}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {order.status === "cancelled"
                ? "This order has been cancelled. If you paid, a refund will be processed within 5-7 business days."
                : "This order has been returned."}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">
          Items ({order.order_items?.length || 0})
        </h2>

        <div className="space-y-4">
          {order.order_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex gap-4 py-3 border-b last:border-0"
            >
              <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
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
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-500">{item.variant_name}</p>
                )}
                {item.sku && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    SKU: {item.sku}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  ৳{item.unit_price} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-sm">৳{item.line_total}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>৳{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery</span>
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
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>৳{order.total}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {address && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Delivery Address
          </h2>

          <div className="space-y-2 text-sm">
            <p className="font-medium">{address.full_name}</p>
            {address.phone && (
              <p className="text-gray-600 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {address.phone}
              </p>
            )}
            {address.email && (
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {address.email}
              </p>
            )}
            <p className="text-gray-600 mt-2">{address.address_line1}</p>
            <p className="text-gray-600">
              {address.city}
              {address.postal_code && `, ${address.postal_code}`}
            </p>
            {address.delivery_notes && (
              <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t">
                Delivery note: {address.delivery_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">Payment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="capitalize">
              {order.payment_method?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span
              className={`text-xs uppercase px-2 py-0.5 rounded ${
                order.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Need help with this order?{" "}
        <Link href="/contact" className="text-black underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}
