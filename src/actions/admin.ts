"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: {
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  brand: string;
  sku: string;
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  featured: boolean;
  is_active: boolean;
  images: { image_url: string; is_primary: boolean; sort_order: number }[];
  variants: {
    sku: string;
    color_name: string | null;
    color_hex: string | null;
    size_name: string | null;
    price: number | null;
    stock_quantity: number;
  }[];
}) {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Insert Product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: formData.name,
      slug: formData.slug,
      category_id: formData.category_id,
      short_description: formData.short_description,
      description: formData.description,
      brand: formData.brand,
      sku: formData.sku,
      base_price: formData.base_price,
      compare_at_price: formData.compare_at_price,
      cost_price: formData.cost_price,
      featured: formData.featured,
      is_active: formData.is_active,
    })
    .select()
    .single();

  if (productError) return { success: false, error: productError.message };

  // 2. Insert Images
  if (formData.images.length > 0) {
    const { error: imgError } = await supabase
      .from("product_images")
      .insert(
        formData.images.map((img) => ({ ...img, product_id: product.id })),
      );
    if (imgError) return { success: false, error: imgError.message };
  }

  // 3. Insert Variants
  if (formData.variants.length > 0) {
    const { error: varError } = await supabase
      .from("product_variants")
      .insert(formData.variants.map((v) => ({ ...v, product_id: product.id })));
    if (varError) return { success: false, error: varError.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, productId: product.id };
}

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const file = formData.get("file") as File;
  const productId = formData.get("productId") as string;

  if (!file) return { success: false, error: "No file provided" };

  // Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, WEBP allowed" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be under 5MB" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${productId || "temp"}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}
