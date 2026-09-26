"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get or create the current user's wishlist, return its ID.
 * Every logged-in user has exactly one wishlist.
 */
async function getOrCreateWishlistId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  // Try to find existing
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new
  const { data: created, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !created) {
    console.error("Failed to create wishlist:", error);
    return null;
  }
  return created.id;
}

/**
 * Add a product to the current user's wishlist.
 */
export async function addToWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to save items" };
  }

  const wishlistId = await getOrCreateWishlistId(supabase, user.id);
  if (!wishlistId)
    return { success: false, error: "Could not create wishlist" };

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    return { success: true, alreadyExists: true };
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ wishlist_id: wishlistId, product_id: productId });

  if (error) {
    console.error("Wishlist insert error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/wishlist");
  revalidatePath("/account");
  revalidatePath("/products");
  return { success: true };
}

/**
 * Remove a product from the current user's wishlist.
 */
export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) return { success: false, error: "No wishlist" };

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlist.id)
    .eq("product_id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/wishlist");
  revalidatePath("/account");
  revalidatePath("/products");
  return { success: true };
}

/**
 * Toggle a product in/out of the wishlist.
 * Returns { success: true, added: boolean } to indicate the new state.
 */
export async function toggleWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Please sign in to save items" };

  const wishlistId = await getOrCreateWishlistId(supabase, user.id);
  if (!wishlistId)
    return { success: false, error: "Could not access wishlist" };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/wishlist");
    revalidatePath("/account");
    revalidatePath("/products");
    return { success: true, added: false };
  } else {
    // Add
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ wishlist_id: wishlistId, product_id: productId });

    if (error) return { success: false, error: error.message };

    revalidatePath("/wishlist");
    revalidatePath("/account");
    revalidatePath("/products");
    return { success: true, added: true };
  }
}

/**
 * Fetch the current user's wishlist item product IDs.
 * Used to mark hearts as "filled" on product listings.
 */
export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) return [];

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("wishlist_id", wishlist.id);

  return items?.map((i) => i.product_id) || [];
}
