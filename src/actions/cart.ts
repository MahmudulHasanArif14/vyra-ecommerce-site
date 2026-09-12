"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get current cart from cookie
  const cartCookie = cookieStore.get("vyra_cart")?.value;
  let cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

  // Verify variant exists and get real price
  const { data: variant, error } = await supabase
    .from("product_variants")
    .select("*, products(base_price)")
    .eq("id", variantId)
    .single();

  if (error || !variant) throw new Error("Product not found");

  // Check stock
  if (variant.stock_quantity < quantity) throw new Error("Insufficient stock");

  // Add to cart
  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.variantId === variantId,
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ variantId, quantity });
  }

  // Save cookie
  cookieStore.set("vyra_cart", JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true, count: cart.items.length };
}

export async function getCart() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("vyra_cart")?.value;
  return cartCookie ? JSON.parse(cartCookie) : { items: [] };
}
