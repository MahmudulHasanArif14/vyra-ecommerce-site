"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { deleteCategory } from "@/actions/categories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CategoryDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteCategory(id);
    setLoading(false);

    if (result.success) {
      toast.success(`"${name}" deleted`);
      setConfirming(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete");
      setConfirming(false);
    }
  };

  // ============================================================
  // CONFIRM MODE
  // ============================================================
  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-2.5 py-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span className="text-xs text-red-300 whitespace-nowrap">Delete?</span>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium bg-red-500 text-white px-2.5 py-1 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              ...
            </>
          ) : (
            "Confirm"
          )}
        </button>

        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ============================================================
  // DEFAULT MODE
  // ============================================================
  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
      title={`Delete "${name}"`}
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
