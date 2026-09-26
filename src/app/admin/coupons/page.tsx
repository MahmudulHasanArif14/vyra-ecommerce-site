import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Ticket, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import CouponTable from "./coupon-table";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const totalCoupons = coupons?.length || 0;
  const activeCoupons = (coupons || []).filter((c) => c.is_active).length;
  const totalRedemptions = (coupons || []).reduce(
    (s, c) => s + (c.used_count || 0),
    0,
  );

  const stats = [
    {
      label: "Total Coupons",
      value: totalCoupons,
      icon: Ticket,
      accent: "cyan" as const,
    },
    {
      label: "Active",
      value: activeCoupons,
      icon: CheckCircle2,
      accent: "green" as const,
    },
    {
      label: "Total Uses",
      value: totalRedemptions,
      icon: TrendingUp,
      accent: "blue" as const,
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="flex justify-between items-start md:items-center gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                  Promotions
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Coupons
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Create and manage discount codes
              </p>
            </div>

            <Link
              href="/admin/coupons/new"
              className="group inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              NEW COUPON
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                accent={stat.accent}
              />
            ))}
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* COUPON TABLE */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <CouponTable coupons={coupons || []} />
        </FadeIn>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Stat Card                                                     */
/* ============================================================ */
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: any;
  accent: "cyan" | "green" | "blue";
}) {
  const accents = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      glow: "bg-cyan-500/10",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      glow: "bg-green-500/10",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      glow: "bg-blue-500/10",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
      {/* Accent glow on hover */}
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
