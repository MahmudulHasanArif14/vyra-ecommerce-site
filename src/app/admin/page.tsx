import { createClient } from "@/lib/supabase/server";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";

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
      color: "text-green-600",
    },
    {
      label: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders || 0,
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      label: "Active Products",
      value: totalProducts || 0,
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Customers",
      value: totalCustomers || 0,
      icon: Users,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back to your store overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders?.map((order) => (
              <div
                key={order.order_number}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.guest_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">৳{order.total}</p>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {!recentOrders?.length && (
              <p className="text-gray-500 text-sm">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Low Stock Alert
          </h2>
          <div className="space-y-3">
            {lowStockVariants?.map((v: any) => (
              <div
                key={v.id}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{v.products?.name}</p>
                  <p className="text-xs text-gray-500">SKU: {v.sku}</p>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {v.stock_quantity} left
                </span>
              </div>
            ))}
            {!lowStockVariants?.length && (
              <p className="text-gray-500 text-sm">
                All products well-stocked ✓
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
