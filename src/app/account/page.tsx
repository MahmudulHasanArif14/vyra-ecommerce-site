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
  Home,
  LogOut,
  Phone,
  Mail,
  Star,
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

  const { count: reviewsCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isAdmin = profile?.role === "admin";

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Guest";

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "packed":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "dispatched":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "returned":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

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

  const uniqueAddresses = new Set(
    (addressRows || []).map((a) =>
      `${a.address_line1}|${a.city}|${a.postal_code || ""}`.toLowerCase(),
    ),
  );
  const addressCount = uniqueAddresses.size;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Breadcrumb / Home link */}
        <nav className="flex items-center gap-2 text-sm animate-fade-in">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span>Home</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-black dark:text-white font-medium">
            Account
          </span>
        </nav>

        {/* Admin Banner */}
        {isAdmin && (
          <div className="bg-black dark:bg-white text-white dark:text-black p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-slide-down shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 dark:bg-black/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  You&apos;re signed in as Admin
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                  Manage products, orders, and settings
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="bg-white dark:bg-black text-black dark:text-white px-4 py-2 rounded-lg text-xs tracking-wider font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 flex items-center gap-1.5 hover:gap-2.5 w-full sm:w-auto justify-center"
            >
              ADMIN PANEL
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-slide-up hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            <div className="animate-scale-in">
              <AvatarUploader
                currentUrl={profile?.avatar_url || null}
                userName={displayName}
              />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <h1 className="text-xl sm:text-2xl font-bold truncate text-black dark:text-white">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 mt-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile.phone}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/account/profile"
                  className="text-xs border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex items-center gap-1.5 text-black dark:text-white group"
                >
                  <UserIcon className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                  Edit profile
                </Link>

                <Link
                  href="/account/orders"
                  className="text-xs border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex items-center gap-1.5 text-black dark:text-white group"
                >
                  <Package className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                  All orders
                </Link>
              </div>
            </div>

            <form action={logout} className="w-full sm:w-auto">
              <button className="text-xs border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-1.5 group">
                <LogOut className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Link
            href="/account/orders"
            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 animate-slide-up group"
            style={{ animationDelay: "0ms" }}
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg w-fit group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-200">
              <Package className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200" />
            </div>
            <p className="text-2xl font-bold mt-3 text-black dark:text-white">
              {totalOrders || 0}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Orders
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 animate-slide-up group"
            style={{ animationDelay: "50ms" }}
          >
            <div className="p-2 bg-white/10 dark:bg-black/10 rounded-lg w-fit group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-200">
              <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
            </div>
            <p className="text-2xl font-bold mt-3 text-white dark:text-white">
              {wishlistCount || 0}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">
              Wishlist
            </p>
          </Link>

          {/* Cart Stat — now renders as a matching card */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CartStat />
          </div>

          <Link
            href="/account/addresses"
            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 animate-slide-up group"
            style={{ animationDelay: "150ms" }}
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg w-fit group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-200">
              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200" />
            </div>
            <p className="text-2xl font-bold mt-3 text-black dark:text-white">
              {addressCount}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Addresses
            </p>
          </Link>

          <Link
            href="/account/reviews"
            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 animate-slide-up group col-span-2 sm:col-span-1"
            style={{ animationDelay: "200ms" }}
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg w-fit group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-200">
              <Star className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
            </div>
            <p className="text-2xl font-bold mt-3 text-black dark:text-white">
              {reviewsCount || 0}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Reviews
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div
          className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-slide-up hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
          style={{ animationDelay: "250ms" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-black dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 group transition-colors duration-200"
            >
              View all{" "}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          {orders?.length ? (
            <div className="space-y-1">
              {orders.map((order, index) => {
                const canCancel = ["pending", "confirmed"].includes(
                  order.status,
                );
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-2 sm:px-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200 animate-fade-in gap-2 sm:gap-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="min-w-0 w-full sm:w-auto">
                      <Link
                        href={`/account/orders/${order.order_number}`}
                        className="font-medium text-sm hover:underline text-black dark:text-white"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="font-medium text-sm text-black dark:text-white">
                          ৳{order.total}
                        </p>
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium inline-block mt-0.5 ${statusColor(order.status)}`}
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
            <div className="text-center py-10 animate-fade-in">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No orders yet.
              </p>
              <Link
                href="/products"
                className="text-xs text-black dark:text-white underline mt-2 inline-flex items-center gap-1 justify-center mx-auto hover:no-underline transition-all duration-200"
              >
                <ShoppingBag className="w-3 h-3" />
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
        .animate-slide-up { animation: slide-up 0.5s ease-out both; }
        .animate-slide-down { animation: slide-down 0.4s ease-out both; }
        .animate-scale-in { animation: scale-in 0.4s ease-out both; }
      `}</style>
    </div>
  );
}
