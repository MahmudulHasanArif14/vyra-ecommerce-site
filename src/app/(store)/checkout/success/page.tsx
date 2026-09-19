import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle, Package, Truck, Home, ArrowRight } from "lucide-react";
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Invalid Order</h1>
        <p className="text-gray-500 mt-2">
          The order link is missing or invalid.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-black text-white px-8 py-3 text-xs tracking-widest hover:bg-gray-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), order_addresses(*)")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-gray-500 mt-2">
          We couldn't find an order with that number.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-black text-white px-8 py-3 text-xs tracking-widest hover:bg-gray-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  // Fetch relations separately — can't fail as a group
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
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      {/* ⭐ Confetti burst on mount (client component) */}
      <SuccessConfetti />

      {/* Success header */}
      <FadeIn y={20}>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">Order Confirmed!</h1>
          <p className="text-gray-500 mt-3">
            Thank you for your purchase, {address?.full_name || "friend"}.
          </p>
        </div>
      </FadeIn>

      {/* Order details */}
      <FadeIn y={30} delay={0.15}>
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Order Number
                </p>
                <p className="font-mono font-bold text-lg">
                  {order.order_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Amount
                </p>
                <p className="font-bold text-lg">৳{order.total}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Delivery address */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Delivered To
              </p>
              <p className="text-sm font-medium">{address?.full_name}</p>
              <p className="text-sm text-gray-600">{address?.phone}</p>
              <p className="text-sm text-gray-600 mt-1">
                {address?.address_line1}
                {address?.city && `, ${address.city}`}
                {address?.postal_code && ` - ${address.postal_code}`}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Payment
              </p>
              <p className="text-sm">Cash on Delivery</p>
            </div>

            {/* Items count */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Items
              </p>
              <p className="text-sm">
                {orderItems.length || 0} item
                {orderItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Delivery timeline preview */}
      <FadeIn y={30} delay={0.25}>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
            What happens next
          </p>

          <div className="space-y-4">
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

      {/* Email confirmation */}
      <FadeIn y={20} delay={0.35}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            📧 A confirmation email has been sent to{" "}
            <strong>{order.guest_email}</strong>
          </p>
        </div>
      </FadeIn>

      {/* Action buttons */}
      <FadeIn y={20} delay={0.45}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?order=${orderNumber}`}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 text-xs tracking-widest hover:bg-gray-800 transition"
          >
            TRACK YOUR ORDER
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 text-xs tracking-widest hover:bg-gray-50 transition"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </FadeIn>

      {/* ⭐ Related products — OUTSIDE the buttons, full width */}
      <RelatedProducts
        productId={
          order.order_items?.[0]?.product_id ||
          "00000000-0000-0000-0000-000000000000"
        }
        categoryId={null}
        gender={null}
        limit={4}
      />
    </div>
  );
}

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
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            active
              ? "bg-black border-black text-white"
              : "bg-white border-gray-200 text-gray-400"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 mt-1 ${
              active ? "bg-black" : "bg-gray-200"
            }`}
          />
        )}
      </div>
      <div className="flex-1 pb-4">
        <p
          className={`font-medium text-sm ${active ? "text-black" : "text-gray-500"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
