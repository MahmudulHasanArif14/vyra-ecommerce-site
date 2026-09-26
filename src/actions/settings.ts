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

  // ============================================================
  // 1. Auth check
  // ============================================================
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized" };
  }

  // ============================================================
  // 2. Guard against empty updates
  // ============================================================
  const entries = Object.entries(updates);
  if (entries.length === 0) {
    return { success: false, error: "No settings to update" };
  }

  // ============================================================
  // 3. Update each setting
  // ============================================================
  const supabase = await createClient();

  const results = await Promise.all(
    entries.map(([key, value]) =>
      supabase
        .from("site_settings")
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("[updateSettings] error:", failed.error);
    return { success: false, error: failed.error.message };
  }

  // ============================================================
  // 4. Bust caches (after successful DB write)
  // ============================================================
  revalidateTag("settings", "max"); // ⭐ Busts unstable_cache("settings")
  revalidatePath("/", "layout"); // ⭐ Busts all pages in root layout
  revalidatePath("/admin/settings"); // ⭐ Busts the admin settings page

  console.log("[updateSettings] success — cache revalidated");
  return { success: true };
}
