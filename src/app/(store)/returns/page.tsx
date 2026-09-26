import type { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  Calendar,
  Package,
  ClipboardList,
  Ban,
  Wallet,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getSettings, getNumber } from "@/lib/settings";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "Returns & Refunds | VYRA Accessories",
  description:
    "Learn about our 7-day return and refund policy at VYRA Accessories.",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage() {
  const settings = await getSettings();
  const returnDays = getNumber(settings.return_policy_days, 7);
  const storeEmail = settings.store_email || "hello@vyra.com";

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
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Returns
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Returns &amp; Refunds
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
              Shop with confidence — easy returns within {returnDays} days.
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* HIGHLIGHT STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-10">
            <StatBadge
              icon={Calendar}
              value={`${returnDays} days`}
              label="Return Window"
              accent="cyan"
            />
            <StatBadge
              icon={Wallet}
              value="5–7 days"
              label="Refund Time"
              accent="green"
            />
            <StatBadge
              icon={CheckCircle2}
              value="Free"
              label="Exchanges"
              accent="blue"
            />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* RETURN WINDOW */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.15}>
          <SectionCard icon={Calendar} accent="cyan" title="Return Window">
            <p className="text-sm text-gray-400 leading-relaxed">
              You can return any product within{" "}
              <strong className="text-white font-medium">
                {returnDays} days
              </strong>{" "}
              of delivery if you&apos;re not completely satisfied.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* RETURN CONDITIONS */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.2}>
          <SectionCard icon={Package} accent="blue" title="Return Conditions">
            <ul className="space-y-2.5">
              {[
                "Item must be unused and in original packaging",
                "Original tags must be attached",
                "Proof of purchase (order number) required",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* HOW TO RETURN */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.25}>
          <SectionCard
            icon={ClipboardList}
            accent="purple"
            title="How to Return"
          >
            <ol className="space-y-3">
              {[
                <>
                  Contact us at{" "}
                  <strong className="text-white">{storeEmail}</strong>
                </>,
                "Include your order number and reason for return",
                "We'll arrange pickup or provide return instructions",
                "Once received, we'll inspect and process your refund/exchange",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-semibold text-purple-300 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-400 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* NON-RETURNABLE */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.3}>
          <SectionCard icon={Ban} accent="amber" title="Non-Returnable Items">
            <ul className="space-y-2.5">
              {[
                "Intimate apparel and personal care items",
                "Items damaged due to misuse",
                "Sale items (unless defective)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* REFUND TIMELINE */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.35}>
          <SectionCard icon={Wallet} accent="green" title="Refund Timeline">
            <p className="text-sm text-gray-400 leading-relaxed">
              Once approved, refunds are processed within{" "}
              <strong className="text-white font-medium">
                5-7 business days
              </strong>
              . For Cash on Delivery orders, refunds are issued via bank
              transfer or mobile banking.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* DAMAGED / WRONG ITEMS */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.4}>
          <SectionCard
            icon={AlertCircle}
            accent="pink"
            title="Damaged or Wrong Items"
          >
            <p className="text-sm text-gray-400 leading-relaxed">
              If you receive a damaged or wrong item, contact us within{" "}
              <strong className="text-white font-medium">48 hours</strong> of
              delivery. We&apos;ll arrange an immediate replacement at no cost.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* CONTACT CTA */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.5}>
          <div className="mt-14 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Need to start a return?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Reach out and we&apos;ll help you within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  START A RETURN
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

/* ============================================================ */
/* Stat Badge                                                    */
/* ============================================================ */
function StatBadge({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: any;
  value: string;
  label: string;
  accent: "cyan" | "blue" | "green";
}) {
  const accents = {
    cyan: {
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/5",
    },
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
    },
    green: {
      text: "text-green-400",
      border: "border-green-500/20",
      bg: "bg-green-500/5",
    },
  };
  const colors = accents[accent];

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-xl p-4 text-center`}
    >
      <Icon className={`w-4 h-4 ${colors.text} mx-auto mb-2`} />
      <p className="text-lg md:text-xl font-bold text-white tabular-nums">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mt-1">
        {label}
      </p>
    </div>
  );
}

/* ============================================================ */
/* Section Card                                                  */
/* ============================================================ */
function SectionCard({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: any;
  accent: "cyan" | "blue" | "purple" | "green" | "amber" | "pink";
  title: string;
  children: React.ReactNode;
}) {
  const accents = {
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
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 mb-6 transition-all duration-300 hover:border-white/25">
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`w-11 h-11 shrink-0 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-white pt-1.5">
          {title}
        </h2>
      </div>
      <div className="ml-15">{children}</div>
    </div>
  );
}
