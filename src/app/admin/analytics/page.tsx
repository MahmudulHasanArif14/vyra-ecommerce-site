import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Eye,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Percent,
  Sparkles,
} from "lucide-react";
import AnalyticsCharts from "./charts";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";
import Link from "next/link";

const RANGES = [
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const supabase = await createClient();
  const { range = "30" } = await searchParams;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(range));

  const [{ data: events }, { data: orders }, { data: topProducts }] =
    await Promise.all([
      supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("orders")
        .select("id, total, status, created_at")
        .gte("created_at", daysAgo.toISOString()),
      supabase
        .from("order_items")
        .select("product_id, product_name, quantity, line_total")
        .gte("created_at", daysAgo.toISOString()),
    ]);

  // Calculate metrics
  const uniqueVisitors = new Set(
    events?.map((e) => e.session_id).filter(Boolean),
  ).size;
  const pageViews =
    events?.filter((e) => e.event_name === "page_view").length || 0;
  const productViews =
    events?.filter((e) => e.event_name === "product_view").length || 0;
  const addToCarts =
    events?.filter((e) => e.event_name === "add_to_cart").length || 0;
  const checkouts =
    events?.filter((e) => e.event_name === "checkout_started").length || 0;
  const completedOrders =
    orders?.filter((o) => o.status !== "cancelled").length || 0;
  const revenue =
    orders
      ?.filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const conversionRate =
    uniqueVisitors > 0 ? (completedOrders / uniqueVisitors) * 100 : 0;

  // Group events by day
  const dailyData: Record<
    string,
    {
      date: string;
      visitors: Set<string>;
      pageViews: number;
      orders: number;
      revenue: number;
    }
  > = {};

  events?.forEach((event) => {
    const day = new Date(event.created_at).toISOString().split("T")[0];
    if (!dailyData[day]) {
      dailyData[day] = {
        date: day,
        visitors: new Set(),
        pageViews: 0,
        orders: 0,
        revenue: 0,
      };
    }
    if (event.session_id) dailyData[day].visitors.add(event.session_id);
    if (event.event_name === "page_view") dailyData[day].pageViews++;
  });

  orders?.forEach((order) => {
    const day = new Date(order.created_at).toISOString().split("T")[0];
    if (!dailyData[day]) {
      dailyData[day] = {
        date: day,
        visitors: new Set(),
        pageViews: 0,
        orders: 0,
        revenue: 0,
      };
    }
    dailyData[day].orders++;
    dailyData[day].revenue += Number(order.total);
  });

  const chartData = Object.values(dailyData)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      visitors: d.visitors.size,
      pageViews: d.pageViews,
      orders: d.orders,
      revenue: d.revenue,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Top products
  const productSales: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};
  topProducts?.forEach((item) => {
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };
    }
    productSales[item.product_id].quantity += item.quantity;
    productSales[item.product_id].revenue += Number(item.line_total);
  });
  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const stats = [
    {
      label: "Unique Visitors",
      value: uniqueVisitors,
      icon: Users,
      accent: "cyan",
    },
    { label: "Page Views", value: pageViews, icon: Eye, accent: "purple" },
    {
      label: "Product Views",
      value: productViews,
      icon: Eye,
      accent: "indigo",
    },
    {
      label: "Add to Cart",
      value: addToCarts,
      icon: ShoppingCart,
      accent: "pink",
    },
    {
      label: "Checkout Started",
      value: checkouts,
      icon: TrendingUp,
      accent: "orange",
    },
    {
      label: "Orders",
      value: completedOrders,
      icon: ShoppingCart,
      accent: "green",
    },
    {
      label: "Revenue",
      value: `৳${revenue.toLocaleString()}`,
      icon: DollarSign,
      accent: "emerald",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate.toFixed(2)}%`,
      icon: Percent,
      accent: "amber",
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
                  {range} Day Overview
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Analytics
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Track your store performance
              </p>
            </div>

            {/* Range filter */}
            <div className="flex gap-2 bg-white/[0.03] border border-white/10 rounded-lg p-1">
              {RANGES.map((r) => {
                const isActive = range === r.value;
                return (
                  <Link
                    key={r.value}
                    href={`/admin/analytics?range=${r.value}`}
                    className={`px-3 md:px-4 py-2 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {r.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STAT CARDS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.05}
          y={20}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          selector=":scope > div"
        >
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* CHARTS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.15}>
          <AnalyticsCharts data={chartData} />
        </FadeIn>

        {/* ============================================================ */}
        {/* TOP SELLING PRODUCTS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.25}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <h2 className="text-lg font-bold tracking-tight text-white">
                      Top Selling Products
                    </h2>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3.5">
                    Last {range} days
                  </p>
                </div>
              </div>

              {topSellingProducts.length > 0 ? (
                <div className="space-y-3">
                  {topSellingProducts.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums ${
                            i === 0
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : i === 1
                                ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                                : i === 2
                                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                  : "bg-white/5 text-gray-500 border border-white/10"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          {p.name}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          ৳{p.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.quantity} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    No sales data yet for this period
                  </p>
                </div>
              )}
            </div>
          </div>
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
  accent: string;
}) {
  const accents: Record<
    string,
    { bg: string; border: string; text: string; glow: string }
  > = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      glow: "bg-cyan-500/10",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      glow: "bg-purple-500/10",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      text: "text-indigo-400",
      glow: "bg-indigo-500/10",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
      glow: "bg-pink-500/10",
    },
    orange: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400",
      glow: "bg-orange-500/10",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      glow: "bg-green-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      glow: "bg-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      glow: "bg-amber-500/10",
    },
  };

  const colors = accents[accent] || accents.cyan;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
      {/* Accent glow */}
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2 truncate">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-bold text-white tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`w-9 h-9 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
