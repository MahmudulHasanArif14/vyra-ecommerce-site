import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "Contact Us | VYRA Accessories",
  description:
    "Get in touch with VYRA Accessories. We reply to every message within 24 hours.",
  alternates: { canonical: "/contact" },
};


export const revalidate = 3600

export default async function ContactPage() {
  const settings = await getSettings();

  const storeEmail = settings.store_email || "hello@vyra.com";
  const storePhone = settings.store_phone || "+880 1700-000000";
  const storeAddress = settings.store_address || "Sylhet, Bangladesh";

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Contact
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Get in Touch
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
              We reply to every message within 24 hours — usually much sooner.
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* CONTACT CARDS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.1}
          y={30}
          className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12"
          selector=":scope > div"
        >
          <ContactTile
            icon={Mail}
            label="Email"
            value={storeEmail}
            href={`mailto:${storeEmail}`}
            hint="Replies within 24 hours"
            accent="cyan"
          />
          <ContactTile
            icon={Phone}
            label="Phone"
            value={storePhone}
            href={`tel:${storePhone}`}
            hint="Sat–Thu · 10am–7pm"
            accent="blue"
          />
          <ContactTile
            icon={MapPin}
            label="Visit"
            value={storeAddress}
            hint="Walk-in showroom"
            accent="purple"
          />
        </StaggerChildren>

        {/* ============================================================ */}
        {/* RESPONSE TIME CARD */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.2}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Fast Response
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  For order-related questions, please include your order number
                  <span className="text-white font-mono">
                    {" "}
                    (VYRA-2026-XXXXXX)
                  </span>{" "}
                  in the message for the fastest help.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* QUICK ACTIONS */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.3}>
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link
              href="/faq"
              className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Read our FAQ</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Quick answers to common questions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>

            <Link
              href="/track-order"
              className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Clock className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Track your order</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Check status anytime with your order number
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* DIRECT EMAIL CTA */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Prefer to write to us directly?
            </p>
            <a
              href={`mailto:${storeEmail}`}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300 group"
            >
              <Mail className="w-3.5 h-3.5" />
              EMAIL US
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Contact Tile                                                  */
/* ============================================================ */
function ContactTile({
  icon: Icon,
  label,
  value,
  href,
  hint,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  href?: string;
  hint: string;
  accent: "cyan" | "blue" | "purple";
}) {
  const accentColors = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
    },
  };

  const colors = accentColors[accent];

  const inner = (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-full transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group">
      <div
        className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
        {label}
      </p>

      <p className="text-white font-medium text-sm break-all leading-snug">
        {value}
      </p>

      <p className="text-xs text-gray-500 mt-3">{hint}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }

  return inner;
}
