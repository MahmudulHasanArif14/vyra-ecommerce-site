import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact Us | VYRA Accessories",
  description: "Get in touch with VYRA Accessories. We reply within 24 hours.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
      <p className="text-gray-500 mb-10">
        We reply to every message within 24 hours.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border rounded-lg p-6">
          <Mail className="w-6 h-6 text-gray-400 mb-3" />
          <h2 className="font-bold mb-2">Email</h2>
          <a
            href={`mailto:${settings.store_email}`}
            className="text-sm text-gray-600 hover:text-black break-all"
          >
            {settings.store_email || "hello@vyra.com"}
          </a>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <Phone className="w-6 h-6 text-gray-400 mb-3" />
          <h2 className="font-bold mb-2">Phone</h2>
          <a
            href={`tel:${settings.store_phone}`}
            className="text-sm text-gray-600 hover:text-black"
          >
            {settings.store_phone || "+880 1700-000000"}
          </a>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <MapPin className="w-6 h-6 text-gray-400 mb-3" />
          <h2 className="font-bold mb-2">Visit</h2>
          <p className="text-sm text-gray-600">
            {settings.store_address || "Sylhet, Bangladesh"}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-3">Response Time</h2>
        <p className="text-gray-600">
          For order-related questions, please include your order number
          (VYRA-XXXX-XXXXXX) for faster help.
        </p>
      </div>
    </div>
  );
}
