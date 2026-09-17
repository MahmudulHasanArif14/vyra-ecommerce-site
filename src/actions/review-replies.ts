"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const replySchema = z.object({
  review_id: z.string().uuid(),
  reply: z.string().min(2, "Reply is too short").max(2000),
});

async function checkAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return { success: false, error: "Not authorized" } as const;
  }
}

/**
 * Admin posts a reply to a review.
 */
export async function createReply(formData: FormData) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = replySchema.safeParse({
    review_id: formData.get("review_id"),
    reply: formData.get("reply"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("review_replies").insert({
    review_id: parsed.data.review_id,
    user_id: user.id,
    reply: parsed.data.reply,
    is_admin_reply: true,
    is_visible: true,
  });

  if (error) {
    console.error("Reply insert error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Admin edits a reply.
 */
export async function updateReply(replyId: string, reply: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();

  if (!reply.trim() || reply.length < 2) {
    return { success: false, error: "Reply is too short" };
  }

  const { error } = await supabase
    .from("review_replies")
    .update({
      reply,
      updated_at: new Date().toISOString(),
    })
    .eq("id", replyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Admin toggles reply visibility (hide/show without deleting).
 */
export async function toggleReplyVisibility(
  replyId: string,
  isVisible: boolean,
) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase
    .from("review_replies")
    .update({
      is_visible: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq("id", replyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Admin deletes a reply.
 */
export async function deleteReply(replyId: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase
    .from("review_replies")
    .delete()
    .eq("id", replyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}
