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
    trackEvent("product_view", {
      product_id: productId,
      product_name: productName,
      price,
    });
  }, [productId, productName, price]);

  return null;
}
