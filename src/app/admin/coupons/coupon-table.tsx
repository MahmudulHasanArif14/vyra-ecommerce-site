"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Copy,
  Check,
  Ticket,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============================================================
  // HELPERS
  // ============================================================
  const statusOf = (coupon: Coupon) => {
    const isExpired =
      coupon.expires_at && new Date(coupon.expires_at) < new Date();
    const isExhausted =
      coupon.usage_limit && coupon.used_count >= coupon.usage_limit;

    if (isExpired) {
      return {
        label: "Expired",
        className: "bg-white/5 text-gray-400 border-white/10",
      };
    }
    if (isExhausted) {
      return {
        label: "Used up",
        className: "bg-red-500/10 text-red-300 border-red-500/20",
      };
    }
    if (coupon.is_active) {
      return {
        label: "Active",
        className: "bg-green-500/10 text-green-300 border-green-500/20",
      };
    }
    return {
      label: "Disabled",
      className: "bg-white/5 text-gray-400 border-white/10",
    };
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCoupon(id);
      setDeletingId(null);
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

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (coupons.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <Ticket className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No coupons yet</h3>
        <p className="text-sm text-gray-400 mb-6">
          Create your first coupon and start driving sales.
        </p>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition"
        >
          CREATE COUPON
        </Link>
      </div>
    );
  }

  // ============================================================
  // MAIN TABLE / CARDS
  // ============================================================
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
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Uses</Th>
                <Th>Expires</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((coupon) => {
                const status = statusOf(coupon);
                return (
                  <tr
                    key={coupon.id}
                    className="hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    {/* Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition"
                          title="Copy code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="p-4 text-sm text-white tabular-nums">
                      {coupon.type === "percentage"
                        ? `${coupon.value}% off`
                        : `৳${coupon.value} off`}
                      {coupon.minimum_order_amount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Min: ৳{coupon.minimum_order_amount}
                        </p>
                      )}
                    </td>

                    {/* Uses */}
                    <td className="p-4 text-sm text-white tabular-nums">
                      {coupon.used_count}
                      {coupon.usage_limit && (
                        <span className="text-gray-500">
                          {" "}
                          / {coupon.usage_limit}
                        </span>
                      )}
                    </td>

                    {/* Expires */}
                    <td className="p-4 text-xs text-gray-500 tabular-nums">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "Never"}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggle(coupon.id, coupon.is_active)
                          }
                          disabled={isPending}
                          className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                            coupon.is_active
                              ? "border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5"
                              : "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                          } disabled:opacity-50`}
                        >
                          {coupon.is_active ? "Disable" : "Enable"}
                        </button>

                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(coupon.id)}
                          disabled={isPending || deletingId === coupon.id}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === coupon.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      {/* ============================================================ */}
      {/* MOBILE CARDS */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-3">
        {coupons.map((coupon) => {
          const status = statusOf(coupon);
          const isExpired =
            coupon.expires_at && new Date(coupon.expires_at) < new Date();

          return (
            <div
              key={coupon.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25"
            >
              {/* Code + status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1 rounded text-gray-500 hover:text-white transition"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {coupon.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/5 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Discount
                  </p>
                  <p className="text-white font-medium tabular-nums">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `৳${coupon.value}`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Uses
                  </p>
                  <p className="text-white font-medium tabular-nums">
                    {coupon.used_count}
                    {coupon.usage_limit && (
                      <span className="text-gray-500">
                        {" "}
                        / {coupon.usage_limit}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Expires
                  </p>
                  <p className="text-white font-medium tabular-nums truncate">
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "Never"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  onClick={() => handleToggle(coupon.id, coupon.is_active)}
                  disabled={isPending}
                  className={`flex-1 text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg border transition-all ${
                    coupon.is_active
                      ? "border-white/10 text-gray-400 hover:bg-white/5"
                      : "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                  } disabled:opacity-50`}
                >
                  {coupon.is_active ? "Disable" : "Enable"}
                </button>

                <Link
                  href={`/admin/coupons/${coupon.id}`}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                >
                  <Pencil className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(coupon.id)}
                  disabled={isPending || deletingId === coupon.id}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                >
                  {deletingId === coupon.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
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
