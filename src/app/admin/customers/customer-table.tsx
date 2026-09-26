import Link from "next/link";
import { Mail, Phone, ExternalLink, Users, ArrowRight } from "lucide-react";

type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  stats: {
    orders: number;
    spent: number;
    lastOrder: string | null;
  };
};

export default function CustomerTable({
  customers,
}: {
  customers: Customer[];
}) {
  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (customers.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          No customers found
        </h3>
        <p className="text-sm text-gray-400">
          Customers will appear here once they create accounts.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP TABLE */}
      {/* ============================================================ */}
      <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr>
                <Th>Customer</Th>
                <Th>Contact</Th>
                <Th>Orders</Th>
                <Th>Total Spent</Th>
                <Th>Joined</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => {
                const initials = (customer.full_name || customer.email || "?")
                  .charAt(0)
                  .toUpperCase();

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-white/[0.02] transition-colors duration-200 group"
                  >
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || ""}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-300 shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition truncate block"
                          >
                            {customer.full_name || "Unnamed"}
                          </Link>
                          {customer.stats.lastOrder && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Last order:{" "}
                              {new Date(
                                customer.stats.lastOrder,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      <div className="space-y-1.5 text-xs">
                        {customer.email && (
                          <p className="flex items-center gap-1.5 text-gray-400 truncate">
                            <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                            {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="p-4">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          customer.stats.orders > 0
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {customer.stats.orders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="p-4">
                      <span className="text-sm font-semibold text-white tabular-nums">
                        ৳{customer.stats.spent.toLocaleString()}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="p-4 text-xs text-gray-500 tabular-nums">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1.5 text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE CARDS */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-3">
        {customers.map((customer) => {
          const initials = (customer.full_name || customer.email || "?")
            .charAt(0)
            .toUpperCase();

          return (
            <Link
              key={customer.id}
              href={`/admin/customers/${customer.id}`}
              className="block bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                {customer.avatar_url ? (
                  <img
                    src={customer.avatar_url}
                    alt={customer.full_name || ""}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-base font-bold text-cyan-300 shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">
                    {customer.full_name || "Unnamed"}
                  </p>
                  {customer.stats.lastOrder && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Last order{" "}
                      {new Date(customer.stats.lastOrder).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
              </div>

              {/* Contact */}
              <div className="space-y-1.5 text-xs mb-4">
                {customer.email && (
                  <p className="flex items-center gap-1.5 text-gray-400 truncate">
                    <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                    {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="flex items-center gap-1.5 text-gray-400">
                    <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                    {customer.phone}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                    Orders
                  </p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      customer.stats.orders > 0 ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {customer.stats.orders}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                    Spent
                  </p>
                  <p className="text-sm font-semibold text-white tabular-nums truncate">
                    ৳{customer.stats.spent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                    Joined
                  </p>
                  <p className="text-sm font-semibold text-white tabular-nums">
                    {new Date(customer.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================ */
/* Header Cell                                                   */
/* ============================================================ */
function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`p-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 text-${align}`}
    >
      {children}
    </th>
  );
}
