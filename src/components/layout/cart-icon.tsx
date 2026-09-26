"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CartIcon() {
  const { cartCount } = useCart();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(cartCount);

  // Pulse the badge when count increases
  useEffect(() => {
    if (!badgeRef.current) return;
    if (cartCount > prevCount.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        {
          scale: 1.4,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        },
      );
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  // Gentle bounce on the whole icon
  useEffect(() => {
    if (!iconRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      iconRef.current,
      { rotate: 0 },
      {
        rotate: -8,
        duration: 0.12,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut",
      },
    );
  }, [cartCount]);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-1.5 -m-1.5 text-white hover:text-cyan-300 transition-colors duration-300"
      aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
    >
      <div ref={iconRef}>
        <ShoppingBag className="w-5 h-5" />
      </div>

      {cartCount > 0 && (
        <span
          ref={badgeRef}
          className="absolute -top-1 -right-1 bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold px-1 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        >
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}
