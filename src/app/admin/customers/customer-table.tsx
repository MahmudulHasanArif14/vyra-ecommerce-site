import Link from "next/link";
import { Mail, Phone, ExternalLink } from "lucide-react";

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
  if (customers.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
        No customers found
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Customer
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Contact
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Orders
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Total Spent
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Joined
              </th>
              <th className="text-right p-4 text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {customer.avatar_url ? (
                      <img
                        src={customer.avatar_url}
                        alt={customer.full_name || ""}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                        {(customer.full_name || customer.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {customer.full_name || "Unnamed"}
                      </p>
                      {customer.stats.lastOrder && (
                        <p className="text-xs text-gray-500">
                          Last order:{" "}
                          {new Date(
                            customer.stats.lastOrder,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="space-y-1 text-xs">
                    {customer.email && (
                      <p className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`text-sm font-medium ${
                      customer.stats.orders > 0 ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {customer.stats.orders}
                  </span>
                </td>

                <td className="p-4">
                  <span className="text-sm font-bold">
                    ৳{customer.stats.spent.toLocaleString()}
                  </span>
                </td>

                <td className="p-4 text-xs text-gray-500">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>

                <td className="p-4 text-right">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-xs border px-3 py-1.5 rounded hover:bg-gray-100 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
