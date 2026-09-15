"use client";

import { useState, useTransition, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Package,
  AlertTriangle,
  Loader2,
  History,
} from "lucide-react";
import { adjustStock, getVariantMovements } from "@/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  sku: string | null;
  color_name: string | null;
  color_hex: string | null;
  size_name: string | null;
  stock_quantity: number;
  products: { name: string };
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default function AdjustStockModal({
  variant,
  onClose,
}: {
  variant: Variant;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<"purchase" | "adjustment" | "damage">(
    "purchase",
  );
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load movement history
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const result = await getVariantMovements(variant.id, 20);
    if (result.success) {
      setMovements(result.data as Movement[]);
    }
    setLoadingHistory(false);
  };

  const signedQuantity = mode === "add" ? quantity : -quantity;
  const newStock = variant.stock_quantity + signedQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newStock < 0) {
      return toast.error("Stock cannot go below zero");
    }
    if (quantity === 0) {
      return toast.error("Quantity must be greater than 0");
    }

    startTransition(async () => {
      const result = await adjustStock({
        variantId: variant.id,
        type,
        quantity: signedQuantity,
        reason: reason || undefined,
      });

      if (result.success) {
        toast.success(
          `Stock updated: ${result.stockBefore} → ${result.stockAfter}`,
        );
        router.refresh();
        setReason("");
        setQuantity(1);
        await loadHistory();
      } else {
        toast.error(result.error || "Failed to adjust stock");
      }
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-start z-10">
          <div>
            <h2 className="font-bold">Adjust Stock</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {variant.products.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {variant.color_hex && (
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: variant.color_hex }}
                />
              )}
              <span>
                {variant.color_name || ""}
                {variant.color_name && variant.size_name && " / "}
                {variant.size_name || ""}
              </span>
              {variant.sku && (
                <span className="font-mono">· {variant.sku}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Stock */}
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Current Stock
              </p>
              <p className="text-2xl font-bold">{variant.stock_quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                After Adjustment
              </p>
              <p
                className={`text-2xl font-bold ${
                  newStock < 0
                    ? "text-red-600"
                    : newStock === 0
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {newStock}
              </p>
            </div>
          </div>

          {/* Adjustment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Add / Remove Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={`py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition ${
                    mode === "add"
                      ? "bg-green-600 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setMode("remove")}
                  className={`py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition ${
                    mode === "remove"
                      ? "bg-red-600 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Remove Stock
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className="w-full border p-3 rounded-md"
              />
            </div>

            {/* Type / Reason */}
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border p-3 rounded-md bg-white"
              >
                {mode === "add" ? (
                  <>
                    <option value="purchase">Restock from supplier</option>
                    <option value="adjustment">Inventory correction</option>
                  </>
                ) : (
                  <>
                    <option value="adjustment">Inventory correction</option>
                    <option value="damage">Damaged / written off</option>
                  </>
                )}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Note (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Received shipment #12345"
                className="w-full border p-3 rounded-md"
              />
            </div>

            {newStock < 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Cannot reduce stock below zero</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || newStock < 0}
              className="w-full bg-black text-white py-3 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isPending ? "UPDATING..." : "CONFIRM ADJUSTMENT"}
            </button>
          </form>

          {/* History */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold">Recent Movements</h3>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : movements.length === 0 ? (
              <p className="text-xs text-gray-500 py-3">No movements yet</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {movements.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <div
                      key={m.id}
                      className="flex justify-between items-start text-xs py-2 border-b last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {m.quantity}
                          </span>
                          <span className="text-gray-400">
                            {m.stock_before} → {m.stock_after}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {m.type}
                          </span>
                        </div>
                        {m.reason && (
                          <p className="text-gray-500 mt-0.5">{m.reason}</p>
                        )}
                        <p className="text-gray-400 mt-0.5">
                          {new Date(m.created_at).toLocaleString()}
                          {m.profiles?.full_name &&
                            ` · ${m.profiles.full_name}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
