import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, Filter } from "lucide-react";

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

  // Count by status
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
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "packed":
        return "bg-indigo-100 text-indigo-800";
      case "dispatched":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500 mt-1">
            {statusCounts.all} order{statusCounts.all !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/account"
          className="text-xs text-gray-500 hover:text-black underline"
        >
          ← Back to account
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
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
              className={`whitespace-nowrap px-4 py-2 rounded-md text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                isActive
                  ? "bg-black text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Orders list */}
      {orders?.length ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const firstItem = order.order_items?.[0];
            const extraCount = (order.order_items?.length || 1) - 1;

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className="block bg-white border rounded-lg p-5 hover:border-black transition group"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  {/* Left: Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-mono font-bold">
                        {order.order_number}
                      </p>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium ${statusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {firstItem && (
                      <p className="text-sm text-gray-600 mt-3 truncate">
                        {firstItem.product_name}
                        {extraCount > 0 && (
                          <span className="text-gray-400">
                            {" "}
                            + {extraCount} more item{extraCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Right: Total + arrow */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Total
                      </p>
                      <p className="font-bold text-lg">৳{order.total}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">
            {status ? "No orders with this status" : "No orders yet"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {status
              ? "Try a different filter, or view all orders."
              : "Start shopping and your orders will appear here."}
          </p>
          <div className="flex gap-3 justify-center">
            {status && (
              <Link
                href="/account/orders"
                className="text-xs border px-4 py-2 rounded hover:bg-gray-50"
              >
                Clear filter
              </Link>
            )}
            <Link
              href="/products"
              className="text-xs bg-black text-white px-6 py-3 rounded tracking-widest hover:bg-gray-800"
            >
              START SHOPPING
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
