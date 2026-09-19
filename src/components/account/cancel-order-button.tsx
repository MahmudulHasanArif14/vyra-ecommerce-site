"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { cancelOrder } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({
  orderId,
  orderNumber,
  redirectTo,
}: {
  orderId: string;
  orderNumber: string;
  redirectTo?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success(`${orderNumber} cancelled`);
        setConfirming(false);
        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        } else {
          router.refresh();
          setTimeout(() => router.refresh(), 100);
        }
      } else {
        toast.error(result.error || "Failed to cancel");
        setConfirming(false);
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Cancel this order?</span>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Cancelling..." : "Yes, cancel"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
    >
      <X className="w-3 h-3" />
      Cancel order
    </button>
  );
}
