"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingShopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/products?sort=popular"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-black text-black rounded-full pl-1 pr-6 py-1 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
        <Sparkles className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium tracking-wide">
        Shop Best Sellers
      </span>
    </Link>
  );
}
