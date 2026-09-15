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

  // Validate variants have SKUs
  for (const v of formData.variants) {
    if (!v.sku || v.sku.trim() === "") {
      return {
        success: false,
        error: "Every variant must have a unique SKU",
      };
    }
  }

  // Check for duplicate SKUs within the form
  const skus = formData.variants.map((v) => v.sku.trim());
  const duplicateSkus = skus.filter((sku, i) => skus.indexOf(sku) !== i);
  if (duplicateSkus.length > 0) {
    return {
      success: false,
      error: `Duplicate SKU in form: ${duplicateSkus[0]}`,
    };
  }

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

/**
 * Update an existing product with images and variants.
 * Handles adding new items, updating existing, and removing deleted.
 */
export async function updateProduct(
  productId: string,
  formData: {
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
    images: {
      id?: string;
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[];
    variants: {
      id?: string;
      sku: string;
      color_name: string | null;
      color_hex: string | null;
      size_name: string | null;
      price: number | null;
      stock_quantity: number;
    }[];
  },
) {
  await requireAdmin();
  const supabase = await createClient();

  console.log("===== updateProduct called =====");
  console.log("Product ID:", productId);
  console.log("Variants received:", JSON.stringify(formData.variants, null, 2));

  // Validate variants have SKUs
  for (const v of formData.variants) {
    if (!v.sku || v.sku.trim() === "") {
      return {
        success: false,
        error: "Every variant must have a unique SKU",
      };
    }
  }

  // Check for duplicate SKUs within the form
  const skus = formData.variants.map((v) => v.sku.trim());
  const duplicateSkus = skus.filter((sku, i) => skus.indexOf(sku) !== i);
  if (duplicateSkus.length > 0) {
    return {
      success: false,
      error: `Duplicate SKU in form: ${duplicateSkus[0]}`,
    };
  }

  // 1. Update product row
  const { error: productError } = await supabase
    .from("products")
    .update({
      name: formData.name,
      slug: formData.slug,
      category_id: formData.category_id,
      short_description: formData.short_description || null,
      description: formData.description || null,
      brand: formData.brand || null,
      sku: formData.sku,
      base_price: formData.base_price,
      compare_at_price: formData.compare_at_price,
      cost_price: formData.cost_price,
      featured: formData.featured,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (productError) {
    console.error("Product update error:", productError);
    return { success: false, error: productError.message };
  }

  // 2. Sync images (unchanged)
  const { data: existingImages } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId);

  const existingImageIds = new Set((existingImages || []).map((i) => i.id));
  const keptImageIds = new Set(
    formData.images.filter((i) => i.id).map((i) => i.id!),
  );

  const imagesToDelete = Array.from(existingImageIds).filter(
    (id) => !keptImageIds.has(id),
  );
  if (imagesToDelete.length > 0) {
    await supabase.from("product_images").delete().in("id", imagesToDelete);
  }

  for (const img of formData.images) {
    if (img.id) {
      await supabase
        .from("product_images")
        .update({
          image_url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        })
        .eq("id", img.id);
    } else {
      await supabase.from("product_images").insert({
        product_id: productId,
        image_url: img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      });
    }
  }

  // ============================================================
  // 3. Sync variants — NOW WITH FULL ERROR LOGGING
  // ============================================================
  const { data: existingVariants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  const existingVariantIds = new Set((existingVariants || []).map((v) => v.id));
  const keptVariantIds = new Set(
    formData.variants.filter((v) => v.id).map((v) => v.id!),
  );

  const variantsToDelete = Array.from(existingVariantIds).filter(
    (id) => !keptVariantIds.has(id),
  );

  console.log("Existing variant IDs:", Array.from(existingVariantIds));
  console.log("Kept variant IDs:", Array.from(keptVariantIds));
  console.log("Variants to delete:", variantsToDelete);

  if (variantsToDelete.length > 0) {
    const { error: deleteErr } = await supabase
      .from("product_variants")
      .delete()
      .in("id", variantsToDelete);
    if (deleteErr) console.error("Variant delete error:", deleteErr);
  }

  for (const v of formData.variants) {
    console.log("Processing variant:", {
      id: v.id,
      sku: v.sku,
      stock: v.stock_quantity,
    });

    if (v.id) {
      // UPDATE
      const { data, error: updateErr } = await supabase
        .from("product_variants")
        .update({
          sku: v.sku,
          color_name: v.color_name,
          color_hex: v.color_hex,
          size_name: v.size_name,
          price: v.price,
          stock_quantity: v.stock_quantity,
        })
        .eq("id", v.id)
        .select();

      if (updateErr) {
        console.error("❌ Variant UPDATE error for", v.id, ":", updateErr);
      } else {
        console.log("✅ Variant updated:", data);
      }
    } else {
      // INSERT
      const { data, error: insertErr } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          sku: v.sku,
          color_name: v.color_name,
          color_hex: v.color_hex,
          size_name: v.size_name,
          price: v.price,
          stock_quantity: v.stock_quantity,
        })
        .select();

      if (insertErr) {
        console.error("❌ Variant INSERT error:", insertErr);
      } else {
        console.log("✅ Variant inserted:", data);
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${formData.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/inventory");

  console.log("===== updateProduct finished =====");
  return { success: true, productId };
}
/**
 * Delete a product and all its images/variants (cascades).
 */
export async function deleteProduct(productId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
