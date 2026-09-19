import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | VYRA Accessories",
  description:
    "Frequently asked questions about orders, shipping, and returns.",
};

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3-5 business days across Bangladesh. Remote areas may take an additional 1-2 days.",
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes! We offer Cash on Delivery on all orders. Pay when your order arrives.",
  },
  {
    q: "Is delivery free?",
    a: "Delivery is free on orders over ৳5000. Below that, a flat delivery charge applies.",
  },
  {
    q: "How do I track my order?",
    a: "You can track your order anytime at /track-order by entering your order number (VYRA-XXXX-XXXXXX).",
  },
  {
    q: "What is your return policy?",
    a: "You can return any product within 7 days of delivery if unused and in original packaging.",
  },
  {
    q: "How long do refunds take?",
    a: "Refunds are processed within 5-7 business days after we receive the returned item.",
  },
  {
    q: "Do you ship outside Bangladesh?",
    a: "Currently we only deliver within Bangladesh. For international orders, please contact us.",
  },
  {
    q: "How can I contact you?",
    a: "Email us at hello@vyra.com or call us at +880 1700-000000.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-10">
        Everything you need to know about ordering from VYRA.
      </p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white border rounded-lg p-5 cursor-pointer"
          >
            <summary className="font-medium list-none flex justify-between items-center">
              {faq.q}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="text-sm text-gray-600 mt-3 pt-3 border-t">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
