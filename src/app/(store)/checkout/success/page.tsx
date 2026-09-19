import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import RelatedProducts from "@/components/products/related-products";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order: string };
}) {
  const supabase = await createClient();
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) return <div>Invalid order</div>;

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), order_addresses(*)")
    .eq("order_number", orderNumber)
    .single();

  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-8">
      <div className="flex justify-center">
        <CheckCircle className="w-20 h-20 text-green-500" />
      </div>

      <div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-gray-500 mt-2">
          Thank you for your purchase, {order.order_addresses[0]?.full_name}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg text-left space-y-4">
        <div className="flex justify-between border-b pb-4">
          <span className="font-semibold">Order Number</span>
          <span>{order.order_number}</span>
        </div>
        <div className="flex justify-between border-b pb-4">
          <span className="font-semibold">Total Amount</span>
          <span className="font-bold">৳{order.total}</span>
        </div>
        <div className="flex justify-between border-b pb-4">
          <span className="font-semibold">Payment Method</span>
          <span>Cash on Delivery</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Delivery Address</span>
          <span className="text-right text-sm">
            {order.order_addresses[0]?.address_line1},{" "}
            {order.order_addresses[0]?.city}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          We'll send a confirmation email to {order.guest_email}.
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-gray-800 transition"
        >
          <RelatedProducts
            productId="00000000-0000-0000-0000-000000000000"
            categoryId={null}
            gender={null}
            limit={4}
          />
          CONTINUE SHOPPING
        </Link>
        <Link href={`/track-order?order=${orderNumber}`}>Track this order</Link>
      </div>
    </div>
  );
}
