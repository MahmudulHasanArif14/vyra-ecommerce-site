"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Minus,
  Package,
  AlertTriangle,
  Loader2,
  History,
  CheckCircle2,
} from "lucide-react";
import { adjustStock, getVariantMovements } from "@/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

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
  const [justUpdated, setJustUpdated] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!modalRef.current || !backdropRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25 },
    );
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" },
    );
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 1500);
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
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-[#0f0f0f] border border-white/10 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col relative"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <div className="relative sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 p-5 flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base">Adjust Stock</h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {variant.products.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                {variant.color_hex && (
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: variant.color_hex }}
                  />
                )}
                <span className="truncate">
                  {variant.color_name || ""}
                  {variant.color_name && variant.size_name && " / "}
                  {variant.size_name || ""}
                </span>
                {variant.sku && (
                  <span className="font-mono truncate">· {variant.sku}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 -m-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* BODY */}
        {/* ============================================================ */}
        <div className="relative p-5 md:p-6 space-y-6 overflow-y-auto">
          {/* CURRENT → NEW STOCK */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex justify-between items-center gap-4 relative overflow-hidden">
            <div className="relative">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                Current
              </p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {variant.stock_quantity}
              </p>
            </div>

            <div className="w-8 h-px bg-white/10 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>
            </div>

            <div className="text-right relative">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                After
              </p>
              <p
                className={`text-2xl font-bold tabular-nums transition-colors duration-300 ${
                  newStock < 0
                    ? "text-red-400"
                    : newStock === 0
                      ? "text-amber-400"
                      : "text-green-400"
                }`}
              >
                {newStock}
              </p>
            </div>

            {/* Update flash */}
            {justUpdated && (
              <div className="absolute inset-0 bg-green-500/10 pointer-events-none animate-pulse" />
            )}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Add / Remove toggle */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Action
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={`py-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                    mode === "add"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setMode("remove")}
                  className={`py-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                    mode === "remove"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Remove Stock
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition tabular-nums"
              />
            </div>

            {/* Reason type */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Reason
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition bg-[#0f0f0f]"
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
              <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Note (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Received shipment #12345"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition resize-none"
              />
            </div>

            {/* Negative warning */}
            {newStock < 0 && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">
                  Cannot reduce stock below zero
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || newStock < 0}
              className={`w-full py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                justUpdated
                  ? "bg-green-500 text-white"
                  : "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  UPDATING...
                </>
              ) : justUpdated ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  UPDATED
                </>
              ) : (
                "CONFIRM ADJUSTMENT"
              )}
            </button>
          </form>

          {/* ============================================================ */}
          {/* HISTORY */}
          {/* ============================================================ */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-white">
                Recent Movements
              </h3>
              {movements.length > 0 && (
                <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {movements.length}
                </span>
              )}
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">
                  No movements yet for this variant
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {movements.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <div
                      key={m.id}
                      className="py-3 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-200 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {m.quantity}
                        </span>
                        <span className="text-gray-500 text-xs tabular-nums">
                          {m.stock_before} → {m.stock_after}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${
                            m.type === "purchase"
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : m.type === "damage"
                                ? "bg-red-500/10 text-red-300 border-red-500/20"
                                : m.type === "sale"
                                  ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                  : "bg-white/5 text-gray-400 border-white/10"
                          }`}
                        >
                          {m.type}
                        </span>
                      </div>
                      {m.reason && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {m.reason}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(m.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {m.profiles?.full_name && ` · ${m.profiles.full_name}`}
                      </p>
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
