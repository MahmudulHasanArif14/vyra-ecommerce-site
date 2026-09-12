import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import OrderStatusUpdater from "./status-updater";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
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
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg border space-y-3">
          <h2 className="font-bold">Customer</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-gray-500">Name:</span> {address?.full_name}
            </p>
            <p>
              <span className="text-gray-500">Email:</span> {order.guest_email}
            </p>
            <p>
              <span className="text-gray-500">Phone:</span> {order.guest_phone}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white p-6 rounded-lg border space-y-3">
          <h2 className="font-bold">Delivery Address</h2>
          <div className="text-sm space-y-1">
            <p>{address?.address_line1}</p>
            <p>
              {address?.city}
              {address?.postal_code && `, ${address.postal_code}`}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-bold mb-4">Order Items</h2>
        <div className="space-y-3">
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
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-gray-500">
                  {item.variant_name} · SKU: {item.sku}
                </p>
                <p className="text-sm mt-1">
                  ৳{item.unit_price} × {item.quantity}
                </p>
              </div>
              <p className="font-bold">৳{item.line_total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg border space-y-2 max-w-md ml-auto">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>৳{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery</span>
          <span>৳{order.delivery_fee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span>-৳{order.discount}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total</span>
          <span>৳{order.total}</span>
        </div>
      </div>
    </div>
  );
}
