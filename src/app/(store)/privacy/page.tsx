import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VYRA Accessories",
  description: "How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold">Information We Collect</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Name, email, phone number, and delivery address</li>
          <li>Order history and payment information</li>
          <li>
            Browsing behavior on our site (anonymized, for analytics only)
          </li>
          <li>Device type and browser information</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How We Use Your Information</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>To process and deliver your orders</li>
          <li>To communicate about your order status</li>
          <li>To improve our products and website</li>
          <li>To send promotional emails (only if you opted in)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Data Security</h2>
        <p>
          We use industry-standard security measures to protect your data.
          Passwords are hashed and never stored in plain text. Payment
          information is handled by our payment providers and never stored on
          our servers.
        </p>

        <h2 className="text-2xl font-bold mt-8">Cookies</h2>
        <p>
          We use cookies for essential site functionality (cart, login) and
          anonymous analytics. You can disable cookies in your browser settings,
          but some features may not work.
        </p>

        <h2 className="text-2xl font-bold mt-8">Third Parties</h2>
        <p>
          We share information only with parties essential to running the store:
          our hosting provider, courier services, and payment processors. We
          never sell your data.
        </p>

        <h2 className="text-2xl font-bold mt-8">Your Rights</h2>
        <p>
          You can request access to, correction of, or deletion of your personal
          data at any time by contacting us.
        </p>
      </div>
    </div>
  );
}
