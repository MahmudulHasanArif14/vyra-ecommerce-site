"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

type MovementType = "purchase" | "adjustment" | "damage";

/**
 * Adjust a variant's stock and log the movement.
 */
export async function adjustStock(input: {
  variantId: string;
  type: MovementType;
  quantity: number; // positive = add, negative = remove
  reason?: string;
}) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Get current stock
  const { data: variant, error: fetchErr } = await supabase
    .from("product_variants")
    .select("id, sku, stock_quantity, product_id")
    .eq("id", input.variantId)
    .single();

  if (fetchErr || !variant) {
    return { success: false, error: "Variant not found" };
  }

  const stockBefore = variant.stock_quantity;
  const stockAfter = stockBefore + input.quantity;

  if (stockAfter < 0) {
    return { success: false, error: "Cannot reduce stock below zero" };
  }

  // 2. Update stock
  const { error: updateErr } = await supabase
    .from("product_variants")
    .update({ stock_quantity: stockAfter })
    .eq("id", input.variantId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 3. Log movement
  await supabase.from("inventory_movements").insert({
    variant_id: input.variantId,
    type: input.type,
    quantity: input.quantity,
    stock_before: stockBefore,
    stock_after: stockAfter,
    reason: input.reason || null,
    created_by: user?.id || null,
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${variant.product_id}`);
  return { success: true, stockBefore, stockAfter };
}

/**
 * Bulk adjust multiple variants at once (e.g. restock from supplier).
 */
export async function bulkAdjustStock(input: {
  adjustments: {
    variantId: string;
    quantity: number;
    type: MovementType;
    reason?: string;
  }[];
}) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const results = [];

  for (const adj of input.adjustments) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("id, stock_quantity")
      .eq("id", adj.variantId)
      .single();

    if (!variant) continue;

    const stockBefore = variant.stock_quantity;
    const stockAfter = stockBefore + adj.quantity;
    if (stockAfter < 0) continue;

    await supabase
      .from("product_variants")
      .update({ stock_quantity: stockAfter })
      .eq("id", adj.variantId);

    await supabase.from("inventory_movements").insert({
      variant_id: adj.variantId,
      type: adj.type,
      quantity: adj.quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reason: adj.reason || null,
      created_by: user?.id || null,
    });

    results.push({ variantId: adj.variantId, success: true });
  }

  revalidatePath("/admin/inventory");
  return { success: true, updated: results.length };
}

/**
 * Get movement history for a variant.
 */
export async function getVariantMovements(variantId: string, limit = 50) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized", data: [] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_movements")
    .select(
      `
      id, type, quantity, stock_before, stock_after, reason, created_at,
      profiles:created_by (full_name, email)
    `,
    )
    .eq("variant_id", variantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}
