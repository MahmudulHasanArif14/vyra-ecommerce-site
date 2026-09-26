"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, updateCoupon } from "@/actions/coupons";
import { toast } from "sonner";
import {
  Ticket,
  Calendar,
  Save,
  Loader2,
  Percent,
  DollarSign,
  Tag,
} from "lucide-react";

type CouponFormData = {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  usage_limit: number | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
};

export default function CouponForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState<CouponFormData>({
    code: initialData?.code || "",
    description: initialData?.description || "",
    type: initialData?.type || "percentage",
    value: initialData?.value || 0,
    minimum_order_amount: initialData?.minimum_order_amount || 0,
    maximum_discount: initialData?.maximum_discount || null,
    usage_limit: initialData?.usage_limit || null,
    starts_at: initialData?.starts_at
      ? new Date(initialData.starts_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    expires_at: initialData?.expires_at
      ? new Date(initialData.expires_at).toISOString().slice(0, 16)
      : null,
    is_active: initialData?.is_active ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof CouponFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      return toast.error("Coupon code is required");
    }
    if (formData.value <= 0) {
      return toast.error("Discount value must be greater than 0");
    }
    if (formData.type === "percentage" && formData.value > 100) {
      return toast.error("Percentage cannot exceed 100");
    }

    setIsSubmitting(true);

    const result = isEdit
      ? await updateCoupon(initialData.id, formData)
      : await createCoupon(formData);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEdit ? "Coupon updated" : "Coupon created");
      router.push("/admin/coupons");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save");
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition";
  const labelClass =
    "block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ============================================================ */}
      {/* COUPON DETAILS */}
      {/* ============================================================ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Coupon Details</h2>
        </div>

        {/* Code */}
        <div>
          <label className={labelClass}>
            Code <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="SAVE10"
            required
            className={`${inputClass} font-mono tracking-wider uppercase`}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Customers will enter this at checkout
          </p>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <input
            value={formData.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="10% off first order"
            className={inputClass}
          />
        </div>

        {/* Type + Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => update("type", "percentage")}
                className={`py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  formData.type === "percentage"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />%
              </button>
              <button
                type="button"
                onClick={() => update("type", "fixed")}
                className={`py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  formData.type === "fixed"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />৳
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Discount Value <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => update("value", Number(e.target.value))}
              required
              className={`${inputClass} tabular-nums`}
            />
          </div>
        </div>

        {/* Min order + Max discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Minimum Order (৳)</label>
            <input
              type="number"
              value={formData.minimum_order_amount}
              onChange={(e) =>
                update("minimum_order_amount", Number(e.target.value))
              }
              className={`${inputClass} tabular-nums`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Set to 0 for no minimum
            </p>
          </div>

          <div>
            <label className={labelClass}>Max Discount (৳)</label>
            <input
              type="number"
              value={formData.maximum_discount || ""}
              onChange={(e) =>
                update(
                  "maximum_discount",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="Unlimited"
              className={`${inputClass} tabular-nums`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Cap for % based discounts
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCHEDULE & LIMITS */}
      {/* ============================================================ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white">
            Schedule &amp; Limits
          </h2>
        </div>

        {/* Usage limit */}
        <div>
          <label className={labelClass}>Total Usage Limit</label>
          <input
            type="number"
            value={formData.usage_limit || ""}
            onChange={(e) =>
              update(
                "usage_limit",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            placeholder="Unlimited"
            className={`${inputClass} tabular-nums`}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Maximum times this coupon can be used
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Starts At</label>
            <input
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => update("starts_at", e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label className={labelClass}>Expires At</label>
            <input
              type="datetime-local"
              value={formData.expires_at || ""}
              onChange={(e) => update("expires_at", e.target.value || null)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Leave empty for no expiry
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ACTIVE TOGGLE */}
      {/* ============================================================ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded accent-cyan-500"
          />
          <div>
            <p className="text-sm text-white font-medium group-hover:text-cyan-300 transition">
              Active
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Visible and usable at checkout
            </p>
          </div>
        </label>
      </div>

      {/* ============================================================ */}
      {/* SUBMIT */}
      {/* ============================================================ */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {isEdit ? "UPDATE COUPON" : "CREATE COUPON"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          disabled={isSubmitting}
          className="border border-white/10 text-gray-300 px-6 py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
