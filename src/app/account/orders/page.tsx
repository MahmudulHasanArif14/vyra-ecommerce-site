import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, ArrowLeft } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account/orders");

  const { status } = await searchParams;

  let query = supabase
    .from("orders")
    .select(
      `
      id, order_number, status, total, created_at,
      order_items (id, product_name, quantity, product_image_url)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;

  const { data: allOrders } = await supabase
    .from("orders")
    .select("status")
    .eq("user_id", user.id);

  const statusCounts: Record<string, number> = { all: allOrders?.length || 0 };
  allOrders?.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
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
      case "returned":
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

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="border-b border-white/5 pb-8">
            <Link
              href="/account"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group mb-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              Back to account
            </Link>

            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Account
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Orders
            </h1>
            <p className="text-gray-400">
              {statusCounts.all} order{statusCounts.all !== 1 ? "s" : ""} total
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FILTER TABS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {filters.map((f) => {
              const count = statusCounts[f.value] || 0;
              const isActive = (status || "all") === f.value;
              if (f.value !== "all" && count === 0) return null;

              return (
                <Link
                  key={f.value}
                  href={
                    f.value === "all"
                      ? "/account/orders"
                      : `/account/orders?status=${f.value}`
                  }
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-white/[0.03] border border-white/10 text-gray-300 hover:border-white/25"
                  }`}
                >
                  {f.label}
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
        {/* ORDERS LIST */}
        {/* ============================================================ */}
        {orders?.length ? (
          <StaggerChildren
            stagger={0.06}
            y={20}
            className="space-y-3"
            selector=":scope > a"
          >
            {orders.map((order) => {
              const firstItem = order.order_items?.[0];
              const extraCount = (order.order_items?.length || 1) - 1;

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.order_number}`}
                  className="block bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    {/* Left: Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-mono font-bold text-white">
                          {order.order_number}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${statusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>

                      {firstItem && (
                        <p className="text-sm text-gray-400 mt-3 truncate">
                          {firstItem.product_name}
                          {extraCount > 0 && (
                            <span className="text-gray-600">
                              {" "}
                              + {extraCount} more item
                              {extraCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Right: Total + arrow */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                          Total
                        </p>
                        <p className="font-bold text-lg text-white tabular-nums">
                          ৳{order.total}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </StaggerChildren>
        ) : (
          <FadeIn y={20} delay={0.15}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-500" />
                </div>
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {status ? "No orders with this status" : "No orders yet"}
              </h2>

              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {status
                  ? "Try a different filter, or view all orders."
                  : "Start shopping and your orders will appear here."}
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                {status && (
                  <Link
                    href="/account/orders"
                    className="text-xs border border-white/10 text-gray-300 px-5 py-3 rounded-xl hover:bg-white/5 transition"
                  >
                    Clear filter
                  </Link>
                )}
                <Link
                  href="/products"
                  className="text-xs bg-white text-black px-6 py-3 rounded-xl tracking-[0.2em] font-medium hover:bg-gray-200 transition"
                >
                  START SHOPPING
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
