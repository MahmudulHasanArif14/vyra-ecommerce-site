import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createClient();
  const { status } = await searchParams;

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  const statuses = [
    "all",
    "pending",
    "confirmed",
    "processing",
    "packed",
    "dispatched",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-md text-sm uppercase tracking-wider transition ${
              status === s || (!status && s === "all")
                ? "bg-black text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Order
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Customer
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Items
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Total
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Payment
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{order.guest_email}</p>
                  <p className="text-xs text-gray-500">{order.guest_phone}</p>
                </td>
                <td className="p-4 text-sm">
                  {order.order_items?.length || 0}
                </td>
                <td className="p-4 text-sm font-bold">৳{order.total}</td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase px-2 py-1 rounded ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase px-2 py-1 rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
