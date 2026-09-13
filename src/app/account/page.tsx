import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/auth";
import {
  Package,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Heart,
  MapPin,
} from "lucide-react";
import AvatarUploader from "@/components/account/avatar-uploader";
import CancelOrderButton from "@/components/account/cancel-order-button";
import CartStat from "@/components/account/cart-stat";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  // Get wishlist count in two queries
  const { data: userWishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { count: wishlistCount } = userWishlist
    ? await supabase
        .from("wishlist_items")
        .select("*", { count: "exact", head: true })
        .eq("wishlist_id", userWishlist.id)
    : { count: 0 };

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isAdmin = profile?.role === "admin";

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Guest";

  // Status color helper
  const statusColor = (status: string) => {
    switch (status) {
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

  // Fetch distinct delivery addresses from past orders
  const { data: addressRows } = await supabase
    .from("order_addresses")
    .select(
      `
    address_line1,
    city,
    postal_code,
    orders!inner (user_id)
  `,
    )
    .eq("orders.user_id", user.id);

  // Count unique combinations
  const uniqueAddresses = new Set(
    (addressRows || []).map((a) =>
      `${a.address_line1}|${a.city}|${a.postal_code || ""}`.toLowerCase(),
    ),
  );
  const addressCount = uniqueAddresses.size;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-black text-white p-5 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">
                You&apos;re signed in as Admin
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                Manage products, orders, and settings
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="bg-white text-black px-4 py-2 rounded-md text-xs tracking-wider font-medium hover:bg-gray-100 transition flex items-center gap-1"
          >
            ADMIN PANEL
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start gap-6">
          <AvatarUploader
            currentUrl={profile?.avatar_url || null}
            userName={displayName}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{displayName}</h1>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {profile?.phone && (
              <p className="text-sm text-gray-500 mt-1">📞 {profile.phone}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/account/profile"
                className="text-xs border px-3 py-1.5 rounded hover:bg-gray-50 transition flex items-center gap-1"
              >
                <UserIcon className="w-3 h-3" />
                Edit profile
              </Link>

              <Link
                href="/account/orders"
                className="text-xs border px-3 py-1.5 rounded hover:bg-gray-50 transition flex items-center gap-1"
              >
                <Package className="w-3 h-3" />
                All orders
              </Link>
            </div>
          </div>

          <form action={logout}>
            <button className="text-xs border px-3 py-2 rounded hover:bg-gray-50 transition whitespace-nowrap">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-4 rounded-lg border hover:border-black transition"
        >
          <Package className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{totalOrders || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Orders
          </p>
        </Link>

        <Link
          href="/wishlist"
          className="bg-white p-4 rounded-lg border hover:border-black transition"
        >
          <Heart className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{wishlistCount || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Wishlist
          </p>
        </Link>

        <CartStat />

        <Link
          href="/account/addresses"
          className="bg-white p-4 rounded-lg border hover:border-black transition"
        >
          <MapPin className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{addressCount}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Addresses
          </p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders?.length ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const canCancel = ["pending", "confirmed"].includes(order.status);
              return (
                <div
                  key={order.id}
                  className="flex justify-between items-center py-3 border-b last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-sm">৳{order.total}</p>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium ${statusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {canCancel && (
                      <CancelOrderButton
                        orderId={order.id}
                        orderNumber={order.order_number}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <Link
              href="/products"
              className="text-xs text-black underline mt-2 inline-block"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
