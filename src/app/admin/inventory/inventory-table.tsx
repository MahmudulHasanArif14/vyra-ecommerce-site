"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, AlertTriangle, XCircle, Pencil } from "lucide-react";
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

  if (variants.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
        No variants match your filter
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                  Variant
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                  SKU
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                  Stock
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
                <th className="text-right p-4 text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((v) => {
                const threshold = v.low_stock_threshold || 5;
                const isOut = v.stock_quantity === 0;
                const isLow = !isOut && v.stock_quantity <= threshold;

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/products/${v.products.slug}`}
                        target="_blank"
                        className="font-medium text-sm hover:underline"
                      >
                        {v.products.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {v.products.categories?.name || "—"}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        {v.color_hex && (
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: v.color_hex }}
                          />
                        )}
                        <span>
                          {v.color_name || ""}
                          {v.color_name && v.size_name && " / "}
                          {v.size_name || ""}
                          {!v.color_name && !v.size_name && "—"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-xs font-mono text-gray-500">
                      {v.sku || "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          isOut
                            ? "text-red-600"
                            : isLow
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {v.stock_quantity}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        (min {threshold})
                      </span>
                    </td>

                    <td className="p-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-1 rounded bg-red-100 text-red-800 font-medium">
                          <XCircle className="w-3 h-3" />
                          Out of stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                          <Package className="w-3 h-3" />
                          In stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditing(v)}
                        className="text-xs border px-3 py-1.5 rounded hover:bg-gray-100 inline-flex items-center gap-1"
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

      {editing && (
        <AdjustStockModal variant={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
