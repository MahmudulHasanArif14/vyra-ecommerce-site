"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");

function getSiteUrl(): string {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.trim().toLowerCase();
  const siteUrl = getSiteUrl();

  console.log("[requestPasswordReset] siteUrl:", siteUrl);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // ⭐ Redirect DIRECTLY to the reset-password page.
    // Supabase handles the code exchange via the ?code= param.
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error("[requestPasswordReset] Supabase error:", error);
  }

  return { success: true };
}
