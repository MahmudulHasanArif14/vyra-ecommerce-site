"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/orders-admin";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
} from "lucide-react";

const STATUSES = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  {
    value: "processing",
    label: "Processing",
    icon: Package,
    className: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    dot: "bg-purple-400",
  },
  {
    value: "packed",
    label: "Packed",
    icon: PackageCheck,
    className: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    dot: "bg-indigo-400",
  },
  {
    value: "dispatched",
    label: "Dispatched",
    icon: Truck,
    className: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: Home,
    className: "bg-green-500/10 text-green-300 border-green-500/30",
    dot: "bg-green-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-500/10 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
  {
    value: "returned",
    label: "Returned",
    icon: RotateCcw,
    className: "bg-white/5 text-gray-300 border-white/10",
    dot: "bg-gray-400",
  },
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
  const [justUpdated, setJustUpdated] = useState(false);
  const router = useRouter();

  const handleChange = (newStatus: string) => {
    const previous = status;
    setStatus(newStatus); // optimistic update

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 1500);
        router.refresh();
      } else {
        setStatus(previous); // rollback
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const current = STATUSES.find((s) => s.value === status) || STATUSES[0];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-3">
      <label className="block text-[10px] text-gray-500 uppercase tracking-[0.25em]">
        Order Status
      </label>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Current status badge */}
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border font-medium transition-all duration-300 ${current.className}`}
        >
          <CurrentIcon className="w-3 h-3" />
          {current.label}
        </span>

        {/* Select dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isPending}
            className="appearance-none bg-white/5 border border-white/10 text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition disabled:opacity-50 cursor-pointer capitalize min-w-[160px]"
          >
            {STATUSES.map((s) => (
              <option
                key={s.value}
                value={s.value}
                className="bg-[#0f0f0f] text-white"
              >
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Loading / success indicator */}
        {isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Updating...
          </span>
        )}
        {justUpdated && !isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-400 animate-in fade-in duration-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Changes are saved immediately and reflected for the customer.
      </p>
    </div>
  );
}
