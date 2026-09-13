import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account/addresses");

  // Step 1: Get user's order IDs
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at, order_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  console.log("[Addresses] user orders:", orders?.length, ordersError?.message);

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  const orderIds = orders.map((o) => o.id);

  // Step 2: Get addresses for those orders
  const { data: addresses, error: addrError } = await supabase
    .from("order_addresses")
    .select("*")
    .in("order_id", orderIds);

  console.log(
    "[Addresses] addresses found:",
    addresses?.length,
    addrError?.message,
  );

  if (!addresses || addresses.length === 0) {
    return <EmptyState />;
  }

  // Attach order info to each address for display
  const orderMap = new Map(orders.map((o) => [o.id, o]));

  // Deduplicate by address signature
  const addressMap = new Map<string, any>();
  addresses.forEach((addr) => {
    const key =
      `${addr.address_line1}|${addr.city}|${addr.postal_code || ""}`.toLowerCase();
    if (!addressMap.has(key)) {
      const order = orderMap.get(addr.order_id);
      addressMap.set(key, {
        ...addr,
        order_number: order?.order_number,
        order_created_at: order?.created_at,
        order_count: 0,
      });
    }
    addressMap.get(key).order_count++;
  });

  const uniqueAddresses = Array.from(addressMap.values());

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <Link
        href="/account"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to account
      </Link>

      <div>
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <p className="text-gray-500 mt-1">
          {uniqueAddresses.length} unique address
          {uniqueAddresses.length !== 1 ? "es" : ""} from your orders
        </p>
      </div>

      <div className="space-y-4">
        {uniqueAddresses.map((addr, i) => (
          <div key={i} className="bg-white border rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{addr.full_name}</p>
              </div>
              {addr.order_count > 1 && (
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  Used in {addr.order_count} orders
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1 ml-6">
              {addr.phone && <p>{addr.phone}</p>}
              <p>{addr.address_line1}</p>
              <p>
                {addr.city}
                {addr.postal_code && `, ${addr.postal_code}`}
              </p>
            </div>

            {addr.delivery_notes && (
              <p className="text-xs text-gray-500 italic mt-3 ml-6">
                Note: {addr.delivery_notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">No addresses yet</h1>
      <p className="text-gray-500 mb-8">
        Addresses you use at checkout will appear here automatically.
      </p>
      <Link
        href="/products"
        className="inline-block bg-black text-white px-8 py-4 text-xs tracking-widest hover:bg-gray-800 transition"
      >
        START SHOPPING
      </Link>
    </div>
  );
}
