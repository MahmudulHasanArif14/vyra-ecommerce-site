import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CouponForm from "@/components/admin/coupon-form";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (!coupon) notFound();

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/admin/coupons"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to coupons
      </Link>
      <div>
        <h1 className="text-3xl font-bold">Edit Coupon</h1>
        <p className="text-gray-500 mt-1 font-mono">{coupon.code}</p>
      </div>
      <CouponForm initialData={coupon} />
    </div>
  );
}
