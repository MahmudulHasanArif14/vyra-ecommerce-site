import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import OrderStatusUpdater from "./status-updater";
import FadeIn from "@/components/animation/fade-in";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), order_addresses(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const address = order.order_addresses?.[0];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 max-w-5xl">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
                <Package className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                  Order
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-mono">
                {order.order_number}
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Placed on{" "}
                {new Date(order.created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* CUSTOMER + ADDRESS */}
        {/* ============================================================ */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Customer */}
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold">Customer</h2>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-white font-medium">
                  {address?.full_name || "—"}
                </p>
                {order.guest_email && (
                  <p className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="break-all">{order.guest_email}</span>
                  </p>
                )}
                {order.guest_phone && (
                  <p className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {order.guest_phone}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Delivery Address */}
          <FadeIn y={20} delay={0.15}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold">Delivery Address</h2>
              </div>

              <div className="space-y-1.5 text-sm text-gray-400">
                <p className="text-white">{address?.address_line1}</p>
                <p>
                  {address?.city}
                  {address?.postal_code && `, ${address.postal_code}`}
                </p>
                {address?.delivery_notes && (
                  <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-white/5">
                    Note: {address.delivery_notes}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ============================================================ */}
        {/* ORDER ITEMS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-lg font-bold">
                Order Items ({order.order_items?.length || 0})
              </h2>
            </div>

            <div className="space-y-3">
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
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">
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

                  <p className="font-semibold text-white text-sm tabular-nums whitespace-nowrap">
                    ৳{item.line_total}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* TOTALS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.25}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md ml-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-lg font-bold">Order Summary</h2>
            </div>

            <div className="space-y-3">
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
      </div>
    </div>
  );
}
