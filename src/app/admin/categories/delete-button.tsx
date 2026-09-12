"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete");
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-600 hover:text-red-600"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
