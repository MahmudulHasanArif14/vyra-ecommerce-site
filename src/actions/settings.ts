"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateSettings(updates: Record<string, string>) {
  console.log(
    "[updateSettings] called with",
    Object.keys(updates).length,
    "keys",
  );

  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized" };
  }

  const supabase = await createClient();

  // Update each setting individually
  const results = await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("[updateSettings] error:", failed.error);
    return { success: false, error: failed.error.message };
  }

  // Bust the cache

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  console.log("[updateSettings] success");
  return { success: true };
}
