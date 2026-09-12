"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "returned",
] as const;

export async function updateOrderStatus(orderId: string, newStatus: string) {
  console.log("[updateOrderStatus] called:", { orderId, newStatus });

  // 1. Validate status value
  if (!VALID_STATUSES.includes(newStatus as any)) {
    console.error("[updateOrderStatus] invalid status:", newStatus);
    return { success: false, error: `Invalid status: ${newStatus}` };
  }

  // 2. Require admin (redirects if not admin — will throw)
  try {
    await requireAdmin();
  } catch (err) {
    console.error("[updateOrderStatus] admin check failed:", err);
    return { success: false, error: "Not authorized" };
  }

  const supabase = await createClient();

  // 3. Update the order
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    console.error("[updateOrderStatus] Supabase error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { success: false, error: error.message };
  }

  if (!data) {
    console.error(
      "[updateOrderStatus] no data returned — RLS likely blocked the update",
    );
    return { success: false, error: "Update blocked. Check RLS policies." };
  }

  console.log("[updateOrderStatus] success:", data);

  // 4. Revalidate all relevant paths
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { success: true, newStatus: data.status };
}
