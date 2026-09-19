import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | VYRA Accessories",
  description: "Terms and conditions for using our website and services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you agree to be bound by these
          Terms & Conditions.
        </p>

        <h2 className="text-2xl font-bold mt-8">Orders</h2>
        <p>
          All orders are subject to acceptance and availability. We reserve the
          right to refuse or cancel any order.
        </p>

        <h2 className="text-2xl font-bold mt-8">Pricing</h2>
        <p>
          All prices are in Bangladeshi Taka (৳) and include applicable taxes.
          We reserve the right to change prices without notice.
        </p>

        <h2 className="text-2xl font-bold mt-8">Product Accuracy</h2>
        <p>
          We make every effort to display product colors and details accurately.
          However, actual colors may vary slightly due to different screen
          settings.
        </p>

        <h2 className="text-2xl font-bold mt-8">Limitation of Liability</h2>
        <p>
          VYRA Accessories shall not be liable for any indirect, incidental, or
          consequential damages arising from the use of our products or website.
        </p>

        <h2 className="text-2xl font-bold mt-8">Governing Law</h2>
        <p>
          These terms are governed by the laws of Bangladesh. Any disputes will
          be resolved in the courts of Sylhet, Bangladesh.
        </p>

        <h2 className="text-2xl font-bold mt-8">Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use
          of our site after changes constitutes acceptance.
        </p>
      </div>
    </div>
  );
}
