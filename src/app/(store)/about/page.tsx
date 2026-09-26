import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export const metadata: Metadata = {
  title: "About Us | VYRA Accessories",
  description:
    "Learn about VYRA Accessories — premium fashion and accessories for the modern lifestyle. Fast delivery across Bangladesh, cash on delivery, and 7-day returns.",
  alternates: { canonical: "/about" },
};

export const revalidate = 3600

export default async function AboutPage() {
  const settings = await getSettings();

  const storeName = settings.store_name || "VYRA Accessories";
  const storeEmail = settings.store_email || "hello@vyra.com";
  const storePhone = settings.store_phone || "+880 1700-000000";
  const storeAddress = settings.store_address || "Sylhet, Bangladesh";
  const returnDays = settings.return_policy_days || "7";

  return (
    <>
      {" "}
      <div className="bg-[#0a0a0a] min-h-screen text-white overflow-hidden">
        {/* ============================ */}
        {/* HERO */}
        {/* ============================ */}
        <section className="relative border-b border-white/5">
          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-125 h-125 rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-slow" />
            <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] animate-pulse-slow" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
            <FadeIn y={20}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                  About
                </span>
              </div>
            </FadeIn>

            <FadeIn y={30} delay={0.1}>
              <h1
                className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {storeName}
              </h1>
            </FadeIn>

            <FadeIn y={30} delay={0.2}>
              <p className="text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed text-base md:text-lg italic">
                A premium fashion and accessories brand built for the modern
                lifestyle.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ============================ */}
        {/* STATS BAR */}
        {/* ============================ */}
        <section className="border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <StaggerChildren
              stagger={0.1}
              y={20}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
              selector=":scope > div"
            >
              <Stat value="100%" label="Curated Quality" />
              <Stat value="3-5" label="Day Delivery" />
              <Stat value={`${returnDays} Days`} label="Easy Returns" />
              <Stat value="24/7" label="Support" />
            </StaggerChildren>
          </div>
        </section>

        {/* ============================ */}
        {/* INTRO PARAGRAPHS */}
        {/* ============================ */}
        <section className="max-w-3xl mx-auto px-4 py-20 space-y-6">
          <FadeIn y={30}>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-200 font-light">
              <span className="text-white font-medium">{storeName}</span> is a
              premium fashion and accessories brand built for the modern
              lifestyle.
            </p>
          </FadeIn>

          <FadeIn y={30} delay={0.1}>
            <p className="leading-relaxed text-gray-400 text-base md:text-lg">
              We curate a collection of clothing, bags, mobile cases, AirPods
              cases, and accessories that blend timeless design with everyday
              functionality. Every piece is chosen for its quality,
              craftsmanship, and the way it makes you feel.
            </p>
          </FadeIn>
        </section>

        {/* ============================ */}
        {/* MISSION */}
        {/* ============================ */}
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <FadeIn y={30}>
            <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <Heart className="w-5 h-5 text-cyan-400" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Our Mission
                </h2>
                <p className="leading-relaxed text-gray-400 text-base md:text-lg">
                  To make elevated style accessible. We believe premium design
                  shouldn't be a luxury — it should be a standard. Every product
                  we offer is designed to help you feel confident in your
                  everyday moments.
                </p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ============================ */}
        {/* PROMISE */}
        {/* ============================ */}
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <FadeIn y={30}>
            <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                  Our Promise
                </h2>

                <StaggerChildren
                  stagger={0.08}
                  y={20}
                  className="space-y-5"
                  selector=":scope > div"
                >
                  <PromiseItem
                    icon={Package}
                    title="Curated Quality"
                    description="No compromises on materials or finish."
                  />
                  <PromiseItem
                    icon={Truck}
                    title="Fast Delivery"
                    description="Across all of Bangladesh within 3-5 business days."
                  />
                  <PromiseItem
                    icon={RotateCcw}
                    title={`${returnDays}-Day Returns`}
                    description="Full refund or exchange if you're not satisfied."
                  />
                  <PromiseItem
                    icon={Headphones}
                    title="Real Support"
                    description="Friendly customer service based in Bangladesh."
                  />
                </StaggerChildren>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ============================ */}
        {/* GET IN TOUCH */}
        {/* ============================ */}
        <section className="max-w-3xl mx-auto px-4 pb-24">
          <FadeIn y={30}>
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Get in Touch
              </h2>
              <p className="text-gray-400 mb-8">
                Have a question? We'd love to hear from you.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <ContactCard
                  icon={Mail}
                  label="Email"
                  value={storeEmail}
                  href={`mailto:${storeEmail}`}
                />
                <ContactCard
                  icon={Phone}
                  label="Phone"
                  value={storePhone}
                  href={`tel:${storePhone}`}
                />
                <ContactCard
                  icon={MapPin}
                  label="Location"
                  value={storeAddress}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                <Link
                  href="/contact"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black py-3.5 rounded-lg text-xs tracking-widest font-medium hover:bg-gray-200 transition group"
                >
                  CONTACT US
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/products"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-white/10 py-3.5 rounded-lg text-xs tracking-widest font-medium text-gray-300 hover:bg-white/5 transition"
                >
                  BROWSE PRODUCTS
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </>
  );
}

/* ============================================================ */
/* Small components                                              */
/* ============================================================ */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        className="text-2xl md:text-3xl font-bold text-white mb-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
    </div>
  );
}

function PromiseItem({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="w-11 h-11 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.07]">
        <Icon className="w-4 h-4 text-gray-300" />
      </div>
      <div className="pt-1">
        <p className="font-medium text-white text-sm md:text-base">{title}</p>
        <p className="text-sm text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: any;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 h-full transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-[10px] uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
      <p className="text-sm text-white break-all">{value}</p>
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
