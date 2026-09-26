import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Clock,
  Wallet,
  Banknote,
  MapPin,
  Package,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getSettings, getNumber } from "@/lib/settings";
import FadeIn from "@/components/animation/fade-in";

export const metadata: Metadata = {
  title: "Shipping Policy | VYRA Accessories",
  description:
    "Learn about our delivery timelines, charges, and shipping policy at VYRA Accessories.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const settings = await getSettings();
  const deliveryCharge = getNumber(settings.delivery_charge, 100);
  const freeThreshold = getNumber(settings.free_delivery_threshold, 5000);
  const deliveryTime = settings.delivery_time || "3-5 business days";

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
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Delivery
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Shipping Policy
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
              Fast, reliable delivery across Bangladesh.
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* HIGHLIGHT STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-10">
            <StatBadge
              icon={Clock}
              value={deliveryTime.split(" ")[0]}
              label="Delivery Time"
              accent="cyan"
            />
            <StatBadge
              icon={Wallet}
              value={`৳${deliveryCharge}`}
              label="Standard Fee"
              accent="blue"
            />
            <StatBadge
              icon={Banknote}
              value="COD"
              label="Available"
              accent="green"
            />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* DELIVERY TIME */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.15}>
          <SectionCard icon={Clock} accent="cyan" title="Delivery Time">
            <p className="text-sm text-gray-400 leading-relaxed">
              All orders are processed within{" "}
              <strong className="text-white font-medium">24 hours</strong>.
              Delivery takes{" "}
              <strong className="text-white font-medium">{deliveryTime}</strong>{" "}
              across Bangladesh.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* DELIVERY CHARGES */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.2}>
          <SectionCard icon={Wallet} accent="blue" title="Delivery Charges">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-2 shrink-0" />
                <span>
                  Standard delivery:{" "}
                  <strong className="text-white font-medium tabular-nums">
                    ৳{deliveryCharge}
                  </strong>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/60 mt-2 shrink-0" />
                <span>
                  <strong className="text-green-400 font-medium">
                    FREE delivery
                  </strong>{" "}
                  on orders over{" "}
                  <strong className="text-white font-medium tabular-nums">
                    ৳{freeThreshold}
                  </strong>
                </span>
              </li>
            </ul>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* CASH ON DELIVERY */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.25}>
          <SectionCard icon={Banknote} accent="green" title="Cash on Delivery">
            <p className="text-sm text-gray-400 leading-relaxed">
              We offer Cash on Delivery on all orders. Pay when your order
              arrives — no advance payment required.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* TRACKING YOUR ORDER */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.3}>
          <SectionCard
            icon={Package}
            accent="purple"
            title="Tracking Your Order"
          >
            <p className="text-sm text-gray-400 leading-relaxed">
              Once your order ships, you&apos;ll receive a tracking number. You
              can also track any order anytime on our{" "}
              <Link
                href="/track-order"
                className="text-white font-medium underline underline-offset-4 decoration-white/40 hover:decoration-white transition"
              >
                Track Order
              </Link>{" "}
              page.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* DELIVERY AREAS */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.35}>
          <SectionCard icon={MapPin} accent="amber" title="Delivery Areas">
            <p className="text-sm text-gray-400 leading-relaxed">
              We currently deliver across{" "}
              <strong className="text-white font-medium">
                all of Bangladesh
              </strong>
              . If you&apos;re outside our standard coverage area, contact us
              before ordering.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* MISSED DELIVERIES */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.4}>
          <SectionCard
            icon={AlertTriangle}
            accent="pink"
            title="Missed Deliveries"
          >
            <p className="text-sm text-gray-400 leading-relaxed">
              If you&apos;re not available when our courier arrives,
              they&apos;ll attempt redelivery. After{" "}
              <strong className="text-white font-medium">
                3 failed attempts
              </strong>
              , the order is returned to us and you&apos;ll be contacted to
              arrange a new delivery.
            </p>
          </SectionCard>
        </FadeIn>

        {/* ============================================================ */}
        {/* TRUST STRIP */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.45}>
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <TrustItem icon={CheckCircle2} text="COD Available" />
            <TrustItem icon={Truck} text="Fast Delivery" />
            <TrustItem icon={Wallet} text="Free over ৳5000" />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* CTA */}
        {/* ============================================================ */}
        <FadeIn y={30} delay={0.5}>
          <div className="mt-14 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Have an order to track?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Enter your order number and see where your package is right now.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/track-order"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  TRACK MY ORDER
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
                >
                  CONTACT US
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
/* Small components                                              */
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

function TrustItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
        {text}
      </span>
    </div>
  );
}
