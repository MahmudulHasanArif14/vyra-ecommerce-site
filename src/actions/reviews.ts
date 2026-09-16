"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function checkAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return { success: false, error: "Not authorized" } as const;
  }
}

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000),
});

/**
 * Submit a review for a product. Users must be signed in.
 * If they've purchased the product, `is_verified_purchase` is set automatically by a DB trigger.
 */
export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, error: "Please sign in to write a review" };

  const parsed = reviewSchema.safeParse({
    product_id: formData.get("product_id"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.product_id,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    comment: parsed.data.comment,
    is_approved: false, // requires admin approval
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "You have already reviewed this product",
      };
    }
    console.error("Review insert error:", error);
    return { success: false, error: "Failed to submit review" };
  }

  revalidatePath("/account/reviews");
  revalidatePath(`/products/${formData.get("product_slug")}`);
  return { success: true };
}

/**
 * Update a user's own review (edits put it back into pending state).
 */
export async function updateMyReview(
  reviewId: string,
  formData: {
    rating: number;
    title?: string;
    comment: string;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = reviewSchema.partial().safeParse({
    rating: formData.rating,
    title: formData.title,
    comment: formData.comment,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: formData.rating,
      title: formData.title || null,
      comment: formData.comment,
      is_approved: false, // re-moderate after edit
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account/reviews");
  return { success: true };
}

/**
 * Delete a user's own review.
 */
export async function deleteMyReview(reviewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account/reviews");
  return { success: true };
}

/**
 * Admin: approve a review.
 */
export async function approveReview(reviewId: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({
      is_approved: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Admin: unapprove a review (hide it from storefront).
 */
export async function unapproveReview(reviewId: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: false, updated_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Admin: delete a review entirely.
 */
export async function deleteReview(reviewId: string) {
  const authError = await checkAdmin();
  if (authError) return authError;

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/products", "layout");
  return { success: true };
}

/**
 * Get aggregate rating + count for a product (approved reviews only).
 */
export async function getProductRating(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  }

  const ratings = data.map((r) => r.rating);
  const sum = ratings.reduce((a, b) => a + b, 0);
  const average = sum / ratings.length;

  // Distribution: index 0 = 1 star, index 4 = 5 stars
  const distribution = [0, 0, 0, 0, 0];
  ratings.forEach((r) => {
    distribution[r - 1]++;
  });

  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length,
    distribution,
  };
}
