import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, Mail, Sparkles, Plus } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "FAQ | VYRA Accessories",
  description:
    "Frequently asked questions about orders, shipping, and returns at VYRA Accessories.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3-5 business days across Bangladesh. Remote areas may take an additional 1-2 days.",
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes! We offer Cash on Delivery on all orders. Pay when your order arrives — no advance payment required.",
  },
  {
    q: "Is delivery free?",
    a: "Delivery is free on orders over ৳5000. Below that, a flat delivery charge of ৳100 applies.",
  },
  {
    q: "How do I track my order?",
    a: "You can track your order anytime by entering your order number (VYRA-2026-XXXXXX) on our Track Order page.",
  },
  {
    q: "What is your return policy?",
    a: "You can return any product within 7 days of delivery if it's unused and in its original packaging with tags attached.",
  },
  {
    q: "How long do refunds take?",
    a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item.",
  },
  {
    q: "Do you ship outside Bangladesh?",
    a: "Currently we only deliver within Bangladesh. For international orders, please contact us and we'll see what we can do.",
  },
  {
    q: "How can I contact you?",
    a: "Email us at hello@vyra.com or call us at +880 1700-000000. We reply within 24 hours.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-20 md:py-28">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Support
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Frequently Asked
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
              Everything you need to know about ordering from VYRA.
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FAQ LIST */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.06}
          y={20}
          className="space-y-3"
          selector=":scope > details"
        >
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/25 open:border-white/25 open:bg-white/[0.05]"
            >
              <summary className="list-none cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4">
                <span className="font-medium text-white text-sm md:text-base pr-2 leading-snug">
                  {faq.q}
                </span>
                <span className="shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-open:bg-white group-open:text-black group-open:rotate-45">
                  <Plus className="w-4 h-4" />
                </span>
              </summary>

              <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* STILL NEED HELP */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.4}>
          <div className="mt-14 bg-white/[0.03] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Still need help?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Can't find what you're looking for? Our team is one message
                away.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  <Mail className="w-3.5 h-3.5" />
                  CONTACT US
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
                >
                  TRACK ORDER
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
