import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  TrendingUp,
  User,
  CheckCircle2,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, total, created_at,
      order_items (id, product_name, quantity)
    `,
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", id);

  const validOrders = orders?.filter((o) => o.status !== "cancelled") || [];
  const totalSpent = validOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = validOrders.length > 0 ? totalSpent / validOrders.length : 0;
  const deliveredCount =
    orders?.filter((o) => o.status === "delivered").length || 0;

  const displayName = profile.full_name || "Unnamed Customer";

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

  const initials = displayName
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8 max-w-4xl">
        {/* ============================================================ */}
        {/* BACK LINK */}
        {/* ============================================================ */}
        <FadeIn y={10}>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to customers
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* PROFILE HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold text-cyan-300 shrink-0">
                {initials || "?"}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight truncate"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {displayName}
              </h1>

              <div className="mt-4 space-y-2 text-sm">
                {profile.email && (
                  <p className="flex items-center gap-2 text-gray-400 break-all">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {profile.email}
                  </p>
                )}
                {profile.phone && (
                  <p className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {profile.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <StatCard
              label="Total Orders"
              value={orders?.length || 0}
              icon={Package}
              accent="cyan"
            />
            <StatCard
              label="Total Spent"
              value={`৳${totalSpent.toLocaleString()}`}
              icon={DollarSign}
              accent="green"
            />
            <StatCard
              label="Avg Order"
              value={`৳${Math.round(avgOrder).toLocaleString()}`}
              icon={TrendingUp}
              accent="blue"
            />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* ORDER HISTORY */}
        <FadeIn y={20} delay={0.2}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Package className="w-4 h-4 text-cyan-400" />
                </div>
                <h2
                  className="text-lg md:text-xl font-bold tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Order History
                </h2>
              </div>
              <span className="text-xs text-gray-500">
                {orders?.length || 0} total
              </span>
            </div>

            {orders?.length ? (
              <div className="space-y-2">
                {orders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block py-4 px-3 -mx-3 border-b border-white/5 last:border-0 rounded-lg hover:bg-white/[0.03] transition-colors duration-200 group"
                  >
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-medium text-sm text-white group-hover:underline underline-offset-4 decoration-white/40 transition">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.order_items?.length || 0} items ·{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold text-sm text-white tabular-nums">
                          ৳{order.total}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${statusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="relative inline-flex mb-4">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
                  <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* SAVED ADDRESSES */}
        {/* ============================================================ */}
        {addresses && addresses.length > 0 && (
          <FadeIn y={20} delay={0.3}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2
                    className="text-lg md:text-xl font-bold tracking-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Saved Addresses
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  {addresses.length} total
                </span>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm text-white">
                          {addr.full_name}
                        </p>
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {addr.phone} · {addr.address_line1}, {addr.city}
                        {addr.postal_code && `, ${addr.postal_code}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
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
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <div className="relative flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
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
