import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import CouponTable from "./coupon-table";

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  // Stats
  const activeCoupons = (coupons || []).filter((c) => c.is_active).length;
  const totalRedemptions = (coupons || []).reduce(
    (s, c) => s + (c.used_count || 0),
    0,
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-500 mt-1">Create and manage discount codes</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-md text-sm tracking-wider hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          NEW COUPON
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <Ticket className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold">{coupons?.length || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Total Coupons
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <Ticket className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{activeCoupons}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Active
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <Ticket className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{totalRedemptions}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Total Uses
          </p>
        </div>
      </div>

      <CouponTable coupons={coupons || []} />
    </div>
  );
}
