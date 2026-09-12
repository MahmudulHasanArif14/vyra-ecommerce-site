import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Eye,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";
import AnalyticsCharts from "./charts";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const supabase = await createClient();
  const { range = "30" } = await searchParams;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(range));

  // Fetch all data in parallel
  const [
    { data: events },
    { data: orders },
    { data: topProducts },
    { data: topCategories },
  ] = await Promise.all([
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
    supabase.from("products").select("category_id, categories(name)"),
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

  // Group events by day for chart
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

  // Top categories
  const categorySales: Record<string, { name: string; count: number }> = {};
  topProducts?.forEach((item) => {
    const product = topProducts.find((p) => p.product_id === item.product_id);
    // Simple category grouping would need a proper join, using placeholder here
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex gap-2">
          {["7", "30", "90"].map((d) => (
            <a
              key={d}
              href={`/admin/analytics?range=${d}`}
              className={`px-4 py-2 rounded-md text-sm ${
                range === d ? "bg-black text-white" : "bg-white border"
              }`}
            >
              {d}d
            </a>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Unique Visitors"
          value={uniqueVisitors}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          label="Page Views"
          value={pageViews}
          icon={Eye}
          color="text-purple-600"
        />
        <StatCard
          label="Product Views"
          value={productViews}
          icon={Eye}
          color="text-indigo-600"
        />
        <StatCard
          label="Add to Cart"
          value={addToCarts}
          icon={ShoppingCart}
          color="text-pink-600"
        />
        <StatCard
          label="Checkout Started"
          value={checkouts}
          icon={TrendingUp}
          color="text-orange-600"
        />
        <StatCard
          label="Orders"
          value={completedOrders}
          icon={ShoppingCart}
          color="text-green-600"
        />
        <StatCard
          label="Revenue"
          value={`৳${revenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-700"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate.toFixed(2)}%`}
          icon={Percent}
          color="text-yellow-600"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts data={chartData} />

      {/* Top Products */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-bold text-lg mb-4">Top Selling Products</h2>
        <div className="space-y-3">
          {topSellingProducts.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">
                  #{i + 1}
                </span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  ৳{p.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{p.quantity} sold</p>
              </div>
            </div>
          ))}
          {!topSellingProducts.length && (
            <p className="text-sm text-gray-500">No sales yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
}
