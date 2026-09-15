"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
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

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
        <span className="text-xs text-red-700">Delete permanently?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
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
          className="text-xs bg-white border px-3 py-1.5 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs border border-red-200 text-red-600 px-4 py-2.5 rounded-md hover:bg-red-50 flex items-center gap-1"
    >
      <Trash2 className="w-3 h-3" />
      Delete
    </button>
  );
}
