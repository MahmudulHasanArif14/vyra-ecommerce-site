import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CouponForm from "@/components/admin/coupon-form";

export default function NewCouponPage() {
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
        <h1 className="text-3xl font-bold">Create Coupon</h1>
        <p className="text-gray-500 mt-1">
          Set up a new discount code for your customers
        </p>
      </div>
      <CouponForm />
    </div>
  );
}
