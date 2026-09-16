import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, ShoppingBag, TrendingUp, Search } from "lucide-react";
import CustomerTable from "./customer-table";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { q } = await searchParams;

  // Fetch all profiles with customer role
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  // Fetch all orders (for stats)
  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, guest_email, total, status, created_at");

  // Build customer stats
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

  // Enrich profiles
  const customers = (profiles || [])
    .filter((p) => p.role === "customer")
    .map((p) => ({
      ...p,
      stats: statsMap.get(p.id) || { orders: 0, spent: 0, lastOrder: null },
    }));

  // Apply search filter
  const filtered = q
    ? customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          c.email?.toLowerCase().includes(q.toLowerCase()) ||
          c.phone?.includes(q),
      )
    : customers;

  // Stats
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-gray-500 mt-1">
          Manage your customers and view their order history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <Users className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{totalCustomers}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Total Customers
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <ShoppingBag className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{activeCustomers}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            With Orders
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <TrendingUp className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Total Revenue
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <TrendingUp className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">
            ৳{Math.round(avgOrderValue).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Avg Order Value
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, or phone..."
            className="w-full border p-3 pl-10 rounded-md"
          />
        </div>
      </form>

      <CustomerTable customers={filtered} />
    </div>
  );
}
