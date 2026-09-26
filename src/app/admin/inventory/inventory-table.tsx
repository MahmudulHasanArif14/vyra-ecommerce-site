"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  XCircle,
  Pencil,
  ExternalLink,
  Boxes,
} from "lucide-react";
import AdjustStockModal from "./adjust-stock-modal";

type Variant = {
  id: string;
  sku: string | null;
  color_name: string | null;
  color_hex: string | null;
  size_name: string | null;
  price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  products: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    categories: { name: string } | null;
  };
};

export default function InventoryTable({ variants }: { variants: Variant[] }) {
  const [editing, setEditing] = useState<Variant | null>(null);

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (variants.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <Boxes className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          No variants match your filter
        </h3>
        <p className="text-sm text-gray-400">
          Try adjusting your search or filter
        </p>
      </div>
    );
  }

  const statusFor = (v: Variant) => {
    const threshold = v.low_stock_threshold || 5;
    const isOut = v.stock_quantity === 0;
    const isLow = !isOut && v.stock_quantity <= threshold;

    if (isOut) {
      return {
        label: "Out of stock",
        icon: XCircle,
        className: "bg-red-500/10 text-red-300 border-red-500/30",
        stockColor: "text-red-400",
      };
    }
    if (isLow) {
      return {
        label: "Low stock",
        icon: AlertTriangle,
        className: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
        stockColor: "text-yellow-400",
      };
    }
    return {
      label: "In stock",
      icon: Package,
      className: "bg-green-500/10 text-green-300 border-green-500/30",
      stockColor: "text-green-400",
    };
  };

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP TABLE */}
      {/* ============================================================ */}
      <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr>
                <Th>Product</Th>
                <Th>Variant</Th>
                <Th>SKU</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {variants.map((v) => {
                const status = statusFor(v);
                const StatusIcon = status.icon;
                const threshold = v.low_stock_threshold || 5;

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    {/* Product */}
                    <td className="p-4">
                      <Link
                        href={`/products/${v.products.slug}`}
                        target="_blank"
                        className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition"
                      >
                        {v.products.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.products.categories?.name || "—"}
                      </p>
                    </td>

                    {/* Variant */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        {v.color_hex && (
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: v.color_hex }}
                          />
                        )}
                        <span className="truncate">
                          {v.color_name || ""}
                          {v.color_name && v.size_name && " / "}
                          {v.size_name || ""}
                          {!v.color_name && !v.size_name && "—"}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="p-4 text-xs font-mono text-gray-500">
                      {v.sku || "—"}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <span
                        className={`font-bold tabular-nums ${status.stockColor}`}
                      >
                        {v.stock_quantity}
                      </span>
                      <span className="text-xs text-gray-600 ml-1.5">
                        min {threshold}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${status.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditing(v)}
                        className="inline-flex items-center gap-1.5 text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-300"
                      >
                        <Pencil className="w-3 h-3" />
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE CARDS */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-3">
        {variants.map((v) => {
          const status = statusFor(v);
          const StatusIcon = status.icon;
          const threshold = v.low_stock_threshold || 5;

          return (
            <div
              key={v.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25"
            >
              {/* Header: product + status */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${v.products.slug}`}
                    target="_blank"
                    className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition line-clamp-2"
                  >
                    {v.products.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {v.products.categories?.name || "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium ${status.className}`}
                >
                  <StatusIcon className="w-2.5 h-2.5" />
                  {status.label.replace(" stock", "")}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/5 text-xs">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Variant
                  </p>
                  <div className="flex items-center gap-1.5">
                    {v.color_hex && (
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: v.color_hex }}
                      />
                    )}
                    <span className="text-white truncate">
                      {v.color_name || ""}
                      {v.color_name && v.size_name && "/"}
                      {v.size_name || ""}
                      {!v.color_name && !v.size_name && "—"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Stock
                  </p>
                  <p className={`font-bold tabular-nums ${status.stockColor}`}>
                    {v.stock_quantity}
                    <span className="text-gray-600 font-normal">
                      {" "}
                      / {threshold}
                    </span>
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    SKU
                  </p>
                  <p className="font-mono text-gray-400 truncate">
                    {v.sku || "—"}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 pt-3">
                <Link
                  href={`/products/${v.products.slug}`}
                  target="_blank"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </Link>
                <button
                  onClick={() => setEditing(v)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-black hover:bg-gray-200 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300"
                >
                  <Pencil className="w-3 h-3" />
                  Adjust
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* MODAL */}
      {/* ============================================================ */}
      {editing && (
        <AdjustStockModal variant={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

/* ============================================================ */
/* Header Cell                                                   */
/* ============================================================ */
function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`p-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 text-${align}`}
    >
      {children}
    </th>
  );
}
