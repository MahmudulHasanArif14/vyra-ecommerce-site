"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackOrder(orderNumber: string) {
  if (!orderNumber || orderNumber.trim().length < 6) {
    return { success: false, error: "Enter a valid order number" };
  }

  const cleanNumber = orderNumber.trim().toUpperCase();
  const supabase = await createClient();

  const { data: order, error } = await supabase.rpc("get_order_by_number", {
    p_order_number: cleanNumber,
  });

  if (error) {
    console.error("Track order error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found. Check the order number and try again.",
    };
  }

  return { success: true, order };
}
