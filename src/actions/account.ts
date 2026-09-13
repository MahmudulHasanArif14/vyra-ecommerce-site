"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Upload or replace the user's avatar.
 * The image is stored at avatars/{userId}/{uuid}.{ext}
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  // Validate
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, WEBP allowed" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "File must be under 2MB" };
  }

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/account");
  return { success: true, url: urlData.publicUrl };
}

/**
 * Update basic profile fields (full_name, phone).
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!fullName) {
    return { success: false, error: "Full name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { success: true };
}

/**
 * Change password using the current session.
 * Requires the user to be logged in (does not require old password).
 */

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Password update error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cancel an order. Only the order owner can cancel.
 * Only allowed if the order status is 'pending' or 'confirmed'.
 */
export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Fetch order and verify ownership + status
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) return { success: false, error: "Order not found" };
  if (order.user_id !== user.id)
    return { success: false, error: "Not your order" };
  if (!["pending", "confirmed"].includes(order.status)) {
    return {
      success: false,
      error: `Cannot cancel an order that is ${order.status}`,
    };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) return { success: false, error: updateError.message };

  // Restore stock for each order item
  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  if (items) {
    for (const item of items) {
      await supabase.rpc("increment_stock", {
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    }
  }

  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}
