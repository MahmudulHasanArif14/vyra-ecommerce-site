"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/orders-admin";
import { toast } from "sonner";

const STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "packed", label: "Packed", color: "bg-indigo-100 text-indigo-800" },
  {
    value: "dispatched",
    label: "Dispatched",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "returned", label: "Returned", color: "bg-gray-100 text-gray-800" },
] as const;

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (newStatus: string) => {
    const previous = status;
    setStatus(newStatus); // optimistic update

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success(`Status updated to "${newStatus}"`);
        // Refresh server data so any list pages reflect the change
        router.refresh();
      } else {
        // Rollback
        setStatus(previous);
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const current = STATUSES.find((s) => s.value === status);

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-500 uppercase tracking-wider">
        Order Status
      </label>

      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] uppercase px-2 py-1 rounded font-medium ${
            current?.color || "bg-gray-100"
          }`}
        >
          {current?.label || status}
        </span>

        <select
          value={status}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending}
          className="border rounded-md px-3 py-2 text-sm bg-white capitalize disabled:opacity-50 cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {isPending && (
          <span className="text-xs text-gray-500">Updating...</span>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Changes are saved immediately and reflected for the customer.
      </p>
    </div>
  );
}
