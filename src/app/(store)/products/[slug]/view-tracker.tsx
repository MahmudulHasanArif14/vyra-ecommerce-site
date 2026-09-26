"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

export default function ProductViewTracker({
  productId,
  productName,
  price,
}: {
  productId: string;
  productName: string;
  price: number;
}) {
  useEffect(() => {
    // ⭐ Skip in admin/staff sessions (detect via URL)
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/admin")) return;

      // ⭐ Skip bots (very lightweight check)
      const ua = navigator.userAgent.toLowerCase();
      const isBot =
        ua.includes("bot") ||
        ua.includes("crawler") ||
        ua.includes("spider") ||
        ua.includes("headless");
      if (isBot) return;
    }

    trackEvent("product_view", {
      product_id: productId,
      product_name: productName,
      price,
    });
  }, [productId, productName, price]);

  return null;
}
