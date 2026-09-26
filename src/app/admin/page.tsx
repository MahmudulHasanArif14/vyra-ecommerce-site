import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Boxes,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Stats in parallel
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
    { data: revenueData },
    { data: lowStockVariants },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("orders")
      .select("order_number, guest_email, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("orders").select("total").eq("status", "delivered"),
    supabase
      .from("product_variants")
      .select("id, sku, stock_quantity, low_stock_threshold, products(name)")
      .lt("stock_quantity", 5)
      .limit(5),
  ]);

  const totalRevenue =
    revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  const stats = [
    {
      label: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      accent: "green" as const,
      href: "/admin/analytics",
    },
    {
      label: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingCart,
      accent: "cyan" as const,
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders || 0,
      icon: Clock,
      accent: "amber" as const,
      href: "/admin/orders?status=pending",
    },
    {
      label: "Active Products",
      value: totalProducts || 0,
      icon: Package,
      accent: "purple" as const,
      href: "/admin/products",
    },
    {
      label: "Customers",
      value: totalCustomers || 0,
      icon: Users,
      accent: "pink" as const,
      href: "/admin/customers",
    },
  ];

  const accentColors = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      glow: "bg-green-500/10",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      glow: "bg-cyan-500/10",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      glow: "bg-amber-500/10",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      glow: "bg-purple-500/10",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
      glow: "bg-pink-500/10",
    },
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "processing":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "dispatched":
        return "bg-orange-500/10 text-orange-300 border-orange-500/30";
      case "delivered":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      default:
        return "bg-white/5 text-gray-300 border-white/10";
    }
  };

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
                Overview
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Welcome back to your store overview
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.06}
          y={20}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
          selector=":scope > a"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colors = accentColors[stat.accent];

            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group"
              >
                <div
                  className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 truncate">
                      {stat.label}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white tabular-nums truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* TWO-COLUMN LAYOUT */}
        {/* ============================================================ */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* ---------- Recent Orders ---------- */}
          <FadeIn y={20} delay={0.15}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h2
                    className="text-lg md:text-xl font-bold tracking-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Recent Orders
                  </h2>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-xs text-gray-500 hover:text-white flex items-center gap-1 group transition"
                >
                  View all
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </Link>
              </div>

              {recentOrders?.length ? (
                <div className="space-y-1">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.order_number}
                      href={`/admin/orders`}
                      className="flex justify-between items-center py-3.5 px-3 -mx-3 rounded-lg border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors duration-200 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-medium text-sm text-white group-hover:underline underline-offset-4 decoration-white/40 transition truncate">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {order.guest_email}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-semibold text-sm text-white tabular-nums">
                          ৳{order.total}
                        </p>
                        <span
                          className={`inline-block mt-0.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${statusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </Link>
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
                  <p className="text-sm text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* ---------- Low Stock Alert ---------- */}
          <FadeIn y={20} delay={0.2}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 h-full relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <h2
                      className="text-lg md:text-xl font-bold tracking-tight"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Low Stock Alert
                    </h2>
                  </div>
                  <Link
                    href="/admin/inventory?filter=low"
                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 group transition"
                  >
                    Manage
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </Link>
                </div>

                {lowStockVariants?.length ? (
                  <div className="space-y-1">
                    {lowStockVariants.map((v: any) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center py-3.5 px-3 -mx-3 rounded-lg border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors duration-200"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-white truncate">
                            {v.products?.name}
                          </p>
                          {v.sku && (
                            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                              {v.sku}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 ml-3 inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full border ${
                            v.stock_quantity === 0
                              ? "bg-red-500/10 text-red-300 border-red-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          {v.stock_quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative inline-flex mb-4">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                      <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      All products well-stocked
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      No items below the low-stock threshold
                    </p>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ============================================================ */}
        {/* QUICK ACTIONS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <QuickAction
              href="/admin/products/new"
              icon={Package}
              label="Add Product"
              accent="cyan"
            />
            <QuickAction
              href="/admin/orders?status=pending"
              icon={Clock}
              label="Pending Orders"
              accent="amber"
            />
            <QuickAction
              href="/admin/coupons/new"
              icon={TrendingUp}
              label="New Coupon"
              accent="purple"
            />
            <QuickAction
              href="/admin/analytics"
              icon={TrendingUp}
              label="View Analytics"
              accent="green"
            />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Quick Action Card                                             */
/* ============================================================ */
function QuickAction({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: any;
  label: string;
  accent: "cyan" | "amber" | "purple" | "green";
}) {
  const accents = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
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
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
    },
  };
  const colors = accents[accent];

  return (
    <Link
      href={href}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 flex items-center gap-3 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group"
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{label}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
    </Link>
  );
}
