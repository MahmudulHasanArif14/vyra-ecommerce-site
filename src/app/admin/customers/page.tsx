import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  Sparkles,
  DollarSign,
} from "lucide-react";
import CustomerTable from "./customer-table";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { q } = await searchParams;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, guest_email, total, status, created_at");

  const statsMap = new Map<
    string,
    { orders: number; spent: number; lastOrder: string | null }
  >();

  orders?.forEach((order) => {
    const key = order.user_id || `guest:${order.guest_email}`;
    if (!statsMap.has(key)) {
      statsMap.set(key, { orders: 0, spent: 0, lastOrder: null });
    }
    const s = statsMap.get(key)!;
    if (order.status !== "cancelled") {
      s.orders++;
      s.spent += Number(order.total);
    }
    if (!s.lastOrder || order.created_at > s.lastOrder) {
      s.lastOrder = order.created_at;
    }
  });

  const customers = (profiles || [])
    .filter((p) => p.role === "customer")
    .map((p) => ({
      ...p,
      stats: statsMap.get(p.id) || { orders: 0, spent: 0, lastOrder: null },
    }));

  const filtered = q
    ? customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          c.email?.toLowerCase().includes(q.toLowerCase()) ||
          c.phone?.includes(q),
      )
    : customers;

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.stats.spent, 0);
  const avgOrderValue =
    totalCustomers > 0
      ? totalRevenue /
        Math.max(
          1,
          customers.reduce((sum, c) => sum + c.stats.orders, 0),
        )
      : 0;
  const activeCustomers = customers.filter((c) => c.stats.orders > 0).length;

  const stats = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      accent: "cyan" as const,
    },
    {
      label: "With Orders",
      value: activeCustomers,
      icon: ShoppingBag,
      accent: "green" as const,
    },
    {
      label: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      accent: "blue" as const,
    },
    {
      label: "Avg Order",
      value: `৳${Math.round(avgOrderValue).toLocaleString()}`,
      icon: TrendingUp,
      accent: "purple" as const,
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
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                People
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Customers
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage your customers and view their order history
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
        {/* SEARCH */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.15}>
          <form method="GET">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name, email, or phone..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
              />
            </div>
          </form>
        </FadeIn>

        {/* ============================================================ */}
        {/* TABLE */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <CustomerTable customers={filtered} />
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
  value: string | number;
  icon: any;
  accent: "cyan" | "green" | "blue" | "purple";
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
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      glow: "bg-purple-500/10",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative">
        <div
          className={`w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <p className="text-xl md:text-2xl font-bold text-white tabular-nums truncate">
          {value}
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">
          {label}
        </p>
      </div>
    </div>
  );
}
