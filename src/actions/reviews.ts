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
 * ⭐ NEW: Upload a review image to storage.
 * Returns the public URL for the uploaded file.
 */
export async function uploadReviewImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to upload images" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, WEBP allowed" };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be under 5MB" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("review-images")
    .upload(path, file);

  if (uploadError) {
    console.error("Review image upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("review-images")
    .getPublicUrl(path);

  return { success: true, url: urlData.publicUrl, path };
}

/**
 * ⭐ UPDATED: Submit a review with optional images.
 */
export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to write a review" };
  }

  const parsed = reviewSchema.safeParse({
    product_id: formData.get("product_id"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // ⭐ Parse uploaded image URLs from FormData
  const imageUrls: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("image_url_") && typeof value === "string" && value) {
      imageUrls.push(value);
    }
  }

  console.log("[submitReview] received", imageUrls.length, "images");

  // 1. Insert the review
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: parsed.data.product_id,
      user_id: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment,
      is_approved: true,
    })
    .select()
    .single();

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

  // 2. ⭐ Insert review images (if any)
  if (imageUrls.length > 0) {
    const { error: imgError } = await supabase.from("review_images").insert(
      imageUrls.map((url, i) => ({
        review_id: review.id,
        image_url: url,
        sort_order: i,
      })),
    );

    if (imgError) {
      console.error("Review image insert error:", imgError);
      // Don't fail the whole submission — the review is already saved
      // The images just won't be attached
    } else {
      console.log("[submitReview] inserted", imageUrls.length, "images");
    }
  }

  revalidatePath("/account/reviews");
  revalidatePath(`/products/${formData.get("product_slug")}`);
  return { success: true };
}

/**
 * Update a user's own review.
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
      is_approved: true,
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
 * Admin: unapprove a review.
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
 * Admin: delete a review.
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
 * Get aggregate rating + count for a product.
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
