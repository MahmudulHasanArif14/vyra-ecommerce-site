import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Package, Plus } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

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
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-8">
        {/* Back link */}
        <FadeIn y={10}>
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to account
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="border-b border-white/5 pb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Account
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Addresses
            </h1>
            <p className="text-gray-400">
              {uniqueAddresses.length} unique address
              {uniqueAddresses.length !== 1 ? "es" : ""} from your orders
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* ADDRESS LIST */}
        {/* ============================================================ */}
        <StaggerChildren
          stagger={0.08}
          y={20}
          className="space-y-4"
          selector=":scope > div"
        >
          {uniqueAddresses.map((addr, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
            >
              {/* Header row */}
              <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{addr.full_name}</p>
                    {addr.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {addr.phone}
                      </p>
                    )}
                  </div>
                </div>

                {addr.order_count > 1 && (
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Used in {addr.order_count} orders
                  </span>
                )}
              </div>

              {/* Address body */}
              <div className="ml-13 space-y-1.5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {addr.address_line1}
                </p>
                <p className="text-sm text-gray-400">
                  {addr.city}
                  {addr.postal_code && `, ${addr.postal_code}`}
                </p>
              </div>

              {/* Notes */}
              {addr.delivery_notes && (
                <div className="mt-4 ml-13 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    Note: {addr.delivery_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </StaggerChildren>

        {/* ============================================================ */}
        {/* ACTION HINT */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.3}>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">
                Addresses are saved automatically
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Whenever you place an order, the delivery address is added here.
                You can reuse it on your next checkout.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Empty State                                                   */
/* ============================================================ */
function EmptyState() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-24 md:py-32 text-center">
        <FadeIn y={20}>
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <MapPin className="w-9 h-9 md:w-10 md:h-10 text-cyan-400" />
            </div>
          </div>

          <h1
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No Addresses Yet
          </h1>

          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Addresses you use at checkout will appear here automatically. Start
            shopping and save time on your next order.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              START SHOPPING
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center border border-white/10 text-gray-300 px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
            >
              BACK TO ACCOUNT
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
