"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartStat() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="bg-white p-4 rounded-lg border hover:border-black transition"
    >
      <ShoppingBag className="w-5 h-5 text-gray-400 mb-2" />
      <p className="text-2xl font-bold">{cartCount}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
        Cart
      </p>
    </Link>
  );
}
