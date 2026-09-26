import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  FileText,
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
  Gavel,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "Terms & Conditions | VYRA Accessories",
  description:
    "Terms and conditions for using VYRA Accessories and purchasing our products.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    icon: FileText,
    accent: "cyan" as const,
    title: "Acceptance of Terms",
    text: "By accessing and using this website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.",
  },
  {
    icon: ShoppingBag,
    accent: "blue" as const,
    title: "Orders",
    text: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, pricing errors, or stock unavailability.",
  },
  {
    icon: DollarSign,
    accent: "green" as const,
    title: "Pricing",
    text: "All prices are in Bangladeshi Taka (৳) and include applicable taxes. We reserve the right to change prices without notice. In the rare case of a pricing error, we will contact you before processing your order.",
  },
  {
    icon: Package,
    accent: "purple" as const,
    title: "Product Accuracy",
    text: "We make every effort to display product colors and details accurately. However, actual colors may vary slightly due to different screen settings, lighting conditions, and monitor calibrations.",
  },
  {
    icon: AlertTriangle,
    accent: "amber" as const,
    title: "Limitation of Liability",
    text: "VYRA Accessories shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability is limited to the amount paid for the product in question.",
  },
  {
    icon: Gavel,
    accent: "pink" as const,
    title: "Governing Law",
    text: "These terms are governed by the laws of Bangladesh. Any disputes will be resolved in the courts of Sylhet, Bangladesh, and you consent to the exclusive jurisdiction of those courts.",
  },
  {
    icon: RefreshCw,
    accent: "cyan" as const,
    title: "Changes to Terms",
    text: "We reserve the right to update these terms at any time. Continued use of our site after changes constitutes acceptance of the new terms. We recommend reviewing this page periodically.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-20 md:py-28">
        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Legal
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Terms &amp; Conditions
            </h1>

            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* SECTIONS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.08}
          y={30}
          className="space-y-6"
          selector=":scope > div"
        >
          {sections.map((section) => (
            <SectionCard
              key={section.title}
              icon={section.icon}
              accent={section.accent}
              title={section.title}
            >
              <p className="text-sm text-gray-400 leading-relaxed">
                {section.text}
              </p>
            </SectionCard>
          ))}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* CONTACT CTA */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.4}>
          <div className="mt-14 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                <Scale className="w-5 h-5 text-blue-400" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Questions about our terms?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                We&apos;re happy to clarify anything you&apos;re unsure about.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  CONTACT US
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
                >
                  VIEW PRIVACY
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
/* Section Card                                                  */
/* ============================================================ */
function SectionCard({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: any;
  accent: "cyan" | "blue" | "green" | "amber" | "purple" | "pink";
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
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-white/25">
      <div className="flex items-start gap-4 mb-4">
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
