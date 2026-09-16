"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
import { deleteCoupon, toggleCouponActive } from "@/actions/coupons";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
};

export default function CouponTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    startTransition(async () => {
      const result = await deleteCoupon(id);
      if (result.success) {
        toast.success("Coupon deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      const result = await toggleCouponActive(id, !isActive);
      if (result.success) {
        toast.success(isActive ? "Coupon disabled" : "Coupon enabled");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update");
      }
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (coupons.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
        No coupons yet.{" "}
        <Link href="/admin/coupons/new" className="text-black underline">
          Create your first coupon
        </Link>
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
                Code
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Discount
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Uses
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Expires
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="text-right p-4 text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => {
              const isExpired =
                coupon.expires_at && new Date(coupon.expires_at) < new Date();
              const isExhausted =
                coupon.usage_limit && coupon.used_count >= coupon.usage_limit;

              return (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-gray-400 hover:text-black"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {coupon.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {coupon.description}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-sm">
                    {coupon.type === "percentage"
                      ? `${coupon.value}% off`
                      : `৳${coupon.value} off`}
                    {coupon.minimum_order_amount > 0 && (
                      <p className="text-xs text-gray-500">
                        Min: ৳{coupon.minimum_order_amount}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-sm">
                    {coupon.used_count}
                    {coupon.usage_limit && (
                      <span className="text-gray-400">
                        {" "}
                        / {coupon.usage_limit}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-xs text-gray-500">
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString()
                      : "Never"}
                  </td>

                  <td className="p-4">
                    {isExpired ? (
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    ) : isExhausted ? (
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-red-100 text-red-800">
                        Used up
                      </span>
                    ) : coupon.is_active ? (
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-gray-100 text-gray-800">
                        Disabled
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggle(coupon.id, coupon.is_active)
                        }
                        disabled={isPending}
                        className="text-xs border px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        {coupon.is_active ? "Disable" : "Enable"}
                      </button>
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="p-2 text-gray-500 hover:text-black"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        disabled={isPending}
                        className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
