import { createClient } from "@/lib/supabase/server";
import CartClient from "./cart-client";
import EmptyCartState from "./empty-cart-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart | VYRA Accessories",
  description: "Review your cart and proceed to checkout.",
};

export default async function CartPage() {
  const supabase = await createClient();

  // Fetch best sellers + featured for the empty state
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, compare_at_price, featured, gender,
      product_images(image_url, is_primary),
      product_variants(id, price, stock_quantity, color_hex, color_name)
    `,
    )
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <CartClient emptyState={<EmptyCartState products={products || []} />} />
  );
}
