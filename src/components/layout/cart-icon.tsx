"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartIcon() {
  const { cartCount } = useCart();
  return (
    <Link href="/cart" className="relative" aria-label="Cart">
      <ShoppingBag className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
