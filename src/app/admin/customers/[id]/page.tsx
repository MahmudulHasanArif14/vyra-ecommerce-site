import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, MapPin } from "lucide-react";

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

  // Fetch orders
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

  // Fetch addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", id);

  // Compute stats
  const validOrders = orders?.filter((o) => o.status !== "cancelled") || [];
  const totalSpent = validOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = validOrders.length > 0 ? totalSpent / validOrders.length : 0;

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "dispatched":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <Link
        href="/admin/customers"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      {/* Profile Header */}
      <div className="bg-white border rounded-lg p-6 flex items-start gap-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || ""}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
            {(profile.full_name || profile.email || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {profile.full_name || "Unnamed Customer"}
          </h1>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            {profile.email && (
              <p className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {profile.email}
              </p>
            )}
            {profile.phone && (
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {profile.phone}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Total Orders
          </p>
          <p className="text-2xl font-bold mt-2">{orders?.length || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Total Spent
          </p>
          <p className="text-2xl font-bold mt-2">
            ৳{totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Avg Order
          </p>
          <p className="text-2xl font-bold mt-2">
            ৳{Math.round(avgOrder).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">
          Order History ({orders?.length || 0})
        </h2>
        {orders?.length ? (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2"
              >
                <div>
                  <p className="font-mono font-medium text-sm">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.order_items?.length || 0} items ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-medium">৳{order.total}</span>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium ${statusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No orders yet</p>
        )}
      </div>

      {/* Saved Addresses */}
      {addresses && addresses.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-bold mb-4">
            Saved Addresses ({addresses.length})
          </h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border-b last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <p className="font-medium text-sm">{addr.full_name}</p>
                  {addr.is_default && (
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 ml-5">
                  {addr.phone} · {addr.address_line1}, {addr.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
