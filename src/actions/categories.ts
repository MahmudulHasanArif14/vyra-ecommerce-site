"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      sort_order: formData.sort_order || 0,
      is_active: formData.is_active ?? true,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, categoryId: data.id };
}

export async function updateCategory(
  id: string,
  formData: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
    is_active?: boolean;
  },
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      sort_order: formData.sort_order || 0,
      is_active: formData.is_active ?? true,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Check if category has products
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete. ${count} products use this category.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function uploadCategoryImage(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, WEBP allowed" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be under 5MB" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `categories/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}
