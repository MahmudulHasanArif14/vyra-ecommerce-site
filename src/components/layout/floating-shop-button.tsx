"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingShopButton() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after 600px of scroll, hide near the bottom (to not cover footer)
      const nearBottom =
        window.scrollY + window.innerHeight > document.body.scrollHeight - 400;
      setVisible(window.scrollY > 600 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <Link
      href="/products?sort=popular"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30  md:bottom-6 md:right-6 md:z-40 group bg-[#0f0f0f]/95 backdrop-blur border border-white/15 text-white rounded-full pl-1.5 pr-5 md:pr-6 py-1.5 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/30 hover:bg-[#0f0f0f] transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      {/* Icon badge */}
      <span className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.4)] transition-transform duration-500 group-hover:scale-110">
        <Sparkles className="w-4 h-4 text-white" />
        {/* Subtle pulse ring */}
        <span className="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping opacity-30" />
      </span>

      {/* Text */}
      <span className="text-xs md:text-sm font-medium tracking-wide whitespace-nowrap">
        Shop Best Sellers
      </span>
    </Link>
  );
}
