"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CartIcon() {
  const { cartCount } = useCart();
  const ref = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (!ref.current) return;
    if (cartCount > prevCount.current) {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        },
      );
    }
    prevCount.current = cartCount;
  }, [cartCount]);
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
