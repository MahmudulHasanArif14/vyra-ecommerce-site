"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartStat() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="block h-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group"
    >
      {/* Accent glow on hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-green-500/10 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
          <ShoppingBag className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white tabular-nums">
          {cartCount}
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">
          Cart
        </p>
      </div>
    </Link>
  );
}
