"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return { success: false, error: "Not authorized" } as const;
  }
}

export async function createCoupon(input: {
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minimum_order_amount?: number;
  maximum_discount?: number | null;
  usage_limit?: number | null;
  starts_at?: string;
  expires_at?: string | null;
  is_active: boolean;
}) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();

  const code = input.code.trim().toUpperCase();
  if (!code) return { success: false, error: "Coupon code is required" };

  const { error } = await supabase.from("coupons").insert({
    code,
    description: input.description || null,
    type: input.type,
    value: input.value,
    minimum_order_amount: input.minimum_order_amount || 0,
    maximum_discount: input.maximum_discount || null,
    usage_limit: input.usage_limit || null,
    starts_at: input.starts_at || new Date().toISOString(),
    expires_at: input.expires_at || null,
    is_active: input.is_active,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Coupon code already exists" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(
  id: string,
  input: {
    code: string;
    description?: string;
    type: "percentage" | "fixed";
    value: number;
    minimum_order_amount?: number;
    maximum_discount?: number | null;
    usage_limit?: number | null;
    starts_at?: string;
    expires_at?: string | null;
    is_active: boolean;
  },
) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("coupons")
    .update({
      code: input.code.trim().toUpperCase(),
      description: input.description || null,
      type: input.type,
      value: input.value,
      minimum_order_amount: input.minimum_order_amount || 0,
      maximum_discount: input.maximum_discount || null,
      usage_limit: input.usage_limit || null,
      starts_at: input.starts_at,
      expires_at: input.expires_at || null,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

/**
 * Validate a coupon code and calculate the discount.
 */
export async function validateCoupon(code: string, subtotal: number) {
  const supabase = await createClient();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  const now = new Date();

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: "Coupon is not yet active" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: "Coupon has expired" };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }

  if (subtotal < Number(coupon.minimum_order_amount || 0)) {
    return {
      valid: false,
      error: `Minimum order of ৳${coupon.minimum_order_amount} required`,
    };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (subtotal * Number(coupon.value)) / 100;
  } else {
    discount = Number(coupon.value);
  }

  if (coupon.maximum_discount) {
    discount = Math.min(discount, Number(coupon.maximum_discount));
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
      discount: Math.round(discount * 100) / 100,
    },
  };
}
