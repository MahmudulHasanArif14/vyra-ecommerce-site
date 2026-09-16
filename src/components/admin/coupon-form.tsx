"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, updateCoupon } from "@/actions/coupons";
import { toast } from "sonner";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold">Coupon Details</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="SAVE10"
            required
            className="w-full border p-3 rounded-md font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Customers will enter this at checkout
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            value={formData.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="10% off first order"
            className="w-full border p-3 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full border p-3 rounded-md bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (৳)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => update("value", Number(e.target.value))}
              required
              className="w-full border p-3 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Order (৳)
            </label>
            <input
              type="number"
              value={formData.minimum_order_amount}
              onChange={(e) =>
                update("minimum_order_amount", Number(e.target.value))
              }
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">0 for no minimum</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Discount (৳)
            </label>
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
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Cap for % discounts</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold">Schedule & Limits</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Total Usage Limit
          </label>
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
            className="w-full border p-3 rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of times this coupon can be used
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starts At</label>
            <input
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => update("starts_at", e.target.value)}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expires At</label>
            <input
              type="datetime-local"
              value={formData.expires_at || ""}
              onChange={(e) => update("expires_at", e.target.value || null)}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no expiry
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          <span className="text-sm">
            Active (visible and usable at checkout)
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white px-8 py-4 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSubmitting
            ? "SAVING..."
            : isEdit
              ? "UPDATE COUPON"
              : "CREATE COUPON"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="px-6 py-4 rounded-md text-sm border hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
