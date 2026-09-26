"use client";

import { useState, useTransition } from "react";
import { X, AlertTriangle, Loader2, Check } from "lucide-react";
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
  const [justCancelled, setJustCancelled] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success(`${orderNumber} cancelled`);
        setJustCancelled(true);
        setConfirming(false);

        // Give the toast time to render before navigating
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo);
            router.refresh();
          } else {
            router.refresh();
          }
        }, 300);
      } else {
        toast.error(result.error || "Failed to cancel");
        setConfirming(false);
      }
    });
  };

  // ============================================================
  // CONFIRMING STATE
  // ============================================================
  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-2.5 py-1.5 animate-in fade-in slide-in-from-right-2 duration-200 flex-wrap">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />

        <span className="text-xs text-red-300 whitespace-nowrap">Cancel?</span>

        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium bg-red-500 text-white px-2.5 py-1 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              ...
            </>
          ) : (
            "Yes"
          )}
        </button>

        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
          title="Cancel"
          aria-label="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ============================================================
  // SUCCESS STATE (brief)
  // ============================================================
  if (justCancelled) {
    return (
      <div className="inline-flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-1.5 animate-in fade-in duration-200">
        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
        <span className="text-xs text-green-300 whitespace-nowrap font-medium">
          Cancelled
        </span>
      </div>
    );
  }

  // ============================================================
  // DEFAULT STATE
  // ============================================================
  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all duration-300"
      title={`Cancel ${orderNumber}`}
    >
      <X className="w-3 h-3" />
      Cancel order
    </button>
  );
}
