import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  FileText,
  Lock,
  Cookie,
  Users,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "Privacy Policy | VYRA Accessories",
  description:
    "How we collect, use, and protect your personal information at VYRA Accessories.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    icon: Database,
    accent: "cyan" as const,
    title: "Information We Collect",
    items: [
      "Name, email, phone number, and delivery address",
      "Order history and payment information",
      "Browsing behavior on our site (anonymized, for analytics only)",
      "Device type and browser information",
    ],
  },
  {
    icon: FileText,
    accent: "blue" as const,
    title: "How We Use Your Information",
    items: [
      "To process and deliver your orders",
      "To communicate about your order status",
      "To improve our products and website",
      "To send promotional emails (only if you opted in)",
    ],
  },
];

const paragraphs = [
  {
    icon: Lock,
    accent: "green" as const,
    title: "Data Security",
    text: "We use industry-standard security measures to protect your data. Passwords are hashed and never stored in plain text. Payment information is handled by our payment providers and never stored on our servers.",
  },
  {
    icon: Cookie,
    accent: "amber" as const,
    title: "Cookies",
    text: "We use cookies for essential site functionality (cart, login) and anonymous analytics. You can disable cookies in your browser settings, but some features may not work.",
  },
  {
    icon: Users,
    accent: "purple" as const,
    title: "Third Parties",
    text: "We share information only with parties essential to running the store: our hosting provider, courier services, and payment processors. We never sell your data.",
  },
  {
    icon: UserCheck,
    accent: "pink" as const,
    title: "Your Rights",
    text: "You can request access to, correction of, or deletion of your personal data at any time by contacting us. We'll respond within 30 days.",
  },
];

export default function PrivacyPage() {
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
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Legal
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Privacy Policy
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
        {/* LIST SECTIONS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.1}
          y={30}
          className="space-y-6 mb-6"
          selector=":scope > div"
        >
          {sections.map((section) => (
            <SectionCard
              key={section.title}
              icon={section.icon}
              accent={section.accent}
              title={section.title}
            >
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* PARAGRAPH SECTIONS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.1}
          y={30}
          className="space-y-6"
          selector=":scope > div"
        >
          {paragraphs.map((section) => (
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
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Questions about your data?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Reach out and we'll be happy to help.
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
                  href="/terms"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
                >
                  VIEW TERMS
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
