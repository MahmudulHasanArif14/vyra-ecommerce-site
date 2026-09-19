import type { Metadata } from "next";
import { getSettings, getNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Returns & Refunds | VYRA Accessories",
  description: "Learn about our return and refund policy.",
};

export default async function ReturnsPage() {
  const settings = await getSettings();
  const returnDays = getNumber(settings.return_policy_days, 7);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Returns & Refunds</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold">Return Window</h2>
        <p>
          You can return any product within <strong>{returnDays} days</strong>{" "}
          of delivery if you're not completely satisfied.
        </p>

        <h2 className="text-2xl font-bold mt-8">Return Conditions</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Item must be unused and in original packaging</li>
          <li>Original tags must be attached</li>
          <li>Proof of purchase (order number) required</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How to Return</h2>
        <ol className="space-y-2 list-decimal list-inside">
          <li>Contact us at {settings.store_email}</li>
          <li>Include your order number and reason for return</li>
          <li>We'll arrange pickup or provide return instructions</li>
          <li>Once received, we'll inspect and process your refund/exchange</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">Non-Returnable Items</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Intimate apparel and personal care items</li>
          <li>Items damaged due to misuse</li>
          <li>Sale items (unless defective)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Refund Timeline</h2>
        <p>
          Once approved, refunds are processed within 5-7 business days. For
          Cash on Delivery orders, refunds are issued via bank transfer or
          mobile banking.
        </p>

        <h2 className="text-2xl font-bold mt-8">Damaged or Wrong Items</h2>
        <p>
          If you receive a damaged or wrong item, contact us within 48 hours of
          delivery. We'll arrange an immediate replacement at no cost.
        </p>
      </div>
    </div>
  );
}
