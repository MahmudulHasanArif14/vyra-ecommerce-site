import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, ShoppingCart, ChevronRight, Sparkles } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status } = await searchParams;

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data: orders } = await query;

  // Count by status for badges
  const { data: allOrders } = await supabase.from("orders").select("status");

  const statusCounts: Record<string, number> = {
    all: allOrders?.length || 0,
  };
  allOrders?.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const statuses = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "dispatched", label: "Dispatched" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "processing":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "packed":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
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

  const paymentColor = (s: string) => {
    switch (s) {
      case "paid":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "pending":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "failed":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      case "refunded":
        return "bg-white/5 text-gray-300 border-white/10";
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
                Sales
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Orders
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage and track customer orders
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FILTER TABS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 md:-mx-8 px-6 md:px-8 scrollbar-hide">
            {statuses.map((s) => {
              const count = statusCounts[s.value] || 0;
              const isActive = (status || "all") === s.value;
              if (s.value !== "all" && count === 0) return null;

              return (
                <Link
                  key={s.value}
                  href={
                    s.value === "all"
                      ? "/admin/orders"
                      : `/admin/orders?status=${s.value}`
                  }
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/[0.05]"
                  }`}
                >
                  {s.label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded tabular-nums ${
                        isActive
                          ? "bg-black/10 text-black"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* ORDERS */}
        {/* ============================================================ */}
        {orders?.length ? (
          <>
            {/* ---------- Desktop Table ---------- */}
            <FadeIn y={20} delay={0.15}>
              <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5 bg-white/[0.02]">
                      <tr>
                        <Th>Order</Th>
                        <Th>Customer</Th>
                        <Th>Items</Th>
                        <Th>Total</Th>
                        <Th>Payment</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-white/[0.02] transition-colors duration-200 group"
                        >
                          <td className="p-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-mono font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition"
                            >
                              {order.order_number}
                            </Link>
                          </td>

                          <td className="p-4">
                            <p className="text-sm text-white truncate max-w-xs">
                              {order.guest_email}
                            </p>
                            {order.guest_phone && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {order.guest_phone}
                              </p>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                              <ShoppingCart className="w-3.5 h-3.5 text-gray-500" />
                              <span className="tabular-nums">
                                {order.order_items?.length || 0}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-white tabular-nums text-sm">
                              ৳{order.total}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium capitalize ${paymentColor(order.payment_status)}`}
                            >
                              {order.payment_status}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium capitalize ${statusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td className="p-4 text-xs text-gray-500 tabular-nums">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            {/* ---------- Mobile Cards ---------- */}
            <div className="md:hidden space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-medium text-sm text-white truncate">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {order.guest_email}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium capitalize ${statusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium capitalize ${paymentColor(order.payment_status)}`}
                    >
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ShoppingCart className="w-3 h-3" />
                      <span className="tabular-nums">
                        {order.order_items?.length || 0} items
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white text-sm tabular-nums">
                        ৳{order.total}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 tabular-nums">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <FadeIn y={20} delay={0.15}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <Package className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {status && status !== "all"
                  ? "No orders with this status"
                  : "No orders yet"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {status && status !== "all"
                  ? "Try a different filter, or view all orders."
                  : "Orders will appear here as customers check out."}
              </p>
              {status && status !== "all" && (
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition"
                >
                  VIEW ALL ORDERS
                </Link>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/* Header Cell                                                   */
/* ============================================================ */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 text-left">
      {children}
    </th>
  );
}
