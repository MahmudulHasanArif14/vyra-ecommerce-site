import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About Us | VYRA Accessories",
  description:
    "Learn about VYRA Accessories — premium fashion and accessories for the modern lifestyle.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">
        About {settings.store_name || "VYRA"}
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          {settings.store_name || "VYRA Accessories"} is a premium fashion and
          accessories brand built for the modern lifestyle.
        </p>

        <p>
          We curate a collection of clothing, bags, mobile cases, AirPods cases,
          and accessories that blend timeless design with everyday
          functionality. Every piece is chosen for its quality, craftsmanship,
          and the way it makes you feel.
        </p>

        <h2 className="text-2xl font-bold mt-10">Our Mission</h2>
        <p>
          To make elevated style accessible. We believe premium design shouldn't
          be a luxury — it should be a standard. Every product we offer is
          designed to help you feel confident in your everyday moments.
        </p>

        <h2 className="text-2xl font-bold mt-10">Our Promise</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Curated quality — no compromises on materials or finish</li>
          <li>Fast delivery across Bangladesh</li>
          <li>Cash on Delivery available on every order</li>
          <li>
            {settings.return_policy_days || 7}-day returns if you're not
            satisfied
          </li>
          <li>Real customer support, based in Bangladesh</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10">Get in Touch</h2>
        <p>
          Have a question? Reach us at{" "}
          <a
            href={`mailto:${settings.store_email}`}
            className="text-black underline"
          >
            {settings.store_email}
          </a>{" "}
          or call us at{" "}
          <a
            href={`tel:${settings.store_phone}`}
            className="text-black underline"
          >
            {settings.store_phone}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
