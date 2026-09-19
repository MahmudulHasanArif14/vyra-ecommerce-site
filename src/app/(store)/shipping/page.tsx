import type { Metadata } from "next";
import { getSettings, getNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Shipping Policy | VYRA Accessories",
  description:
    "Learn about our delivery timelines, charges, and shipping policy.",
};

export default async function ShippingPage() {
  const settings = await getSettings();
  const deliveryCharge = getNumber(settings.delivery_charge, 100);
  const freeThreshold = getNumber(settings.free_delivery_threshold, 5000);
  const deliveryTime = settings.delivery_time || "3-5 business days";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold">Delivery Time</h2>
        <p>
          All orders are processed within 24 hours. Delivery takes{" "}
          <strong>{deliveryTime}</strong> across Bangladesh.
        </p>

        <h2 className="text-2xl font-bold mt-8">Delivery Charges</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Standard delivery: ৳{deliveryCharge}</li>
          <li>
            <strong>FREE delivery</strong> on orders over ৳{freeThreshold}
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Cash on Delivery</h2>
        <p>
          We offer Cash on Delivery on all orders. Pay when your order arrives —
          no advance payment required.
        </p>

        <h2 className="text-2xl font-bold mt-8">Tracking Your Order</h2>
        <p>
          Once your order ships, you'll receive a tracking number. You can also
          track any order anytime at{" "}
          <a href="/track-order" className="text-black underline">
            /track-order
          </a>
          .
        </p>

        <h2 className="text-2xl font-bold mt-8">Delivery Areas</h2>
        <p>
          We currently deliver across all of Bangladesh. If you're outside our
          standard coverage area, contact us before ordering.
        </p>

        <h2 className="text-2xl font-bold mt-8">Missed Deliveries</h2>
        <p>
          If you're not available when our courier arrives, they'll attempt
          redelivery. After 3 failed attempts, the order is returned to us and
          you'll be contacted to arrange a new delivery.
        </p>
      </div>
    </div>
  );
}
