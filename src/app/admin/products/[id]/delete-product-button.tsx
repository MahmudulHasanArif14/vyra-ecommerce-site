"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { deleteProduct } from "@/actions/admin";
import { toast } from "sonner";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success("Product deleted");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
        setConfirming(false);
      }
    });
  };

  // ============================================================
  // CONFIRMING STATE — full-width bar with icons + actions
  // ============================================================
  if (confirming) {
    return (
      <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-right-2 duration-200 flex-wrap">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-sm text-red-300 flex-1 min-w-0">
          Delete{" "}
          <span className="font-medium text-red-200 truncate">
            &ldquo;{productName}&rdquo;
          </span>
          ?
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-500 text-white px-3.5 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete"
            )}
          </button>

          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
            title="Cancel"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // DEFAULT STATE — outline button
  // ============================================================
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-2 text-xs font-medium border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-300"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  );
}
