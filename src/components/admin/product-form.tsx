"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProduct, updateProduct } from "@/actions/admin";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "./image-uploader";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category_id: z.string().uuid(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().min(2),
  base_price: z.coerce.number().positive(),
  compare_at_price: z.coerce.number().optional().nullable(),
  cost_price: z.coerce.number().optional().nullable(),
  featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

type VariantInput = {
  id?: string;
  sku: string;
  color_name: string;
  color_hex: string;
  size_name: string;
  price: number | null;
  stock_quantity: number;
};

type ImageInput = {
  id?: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

export default function ProductForm({
  categories,
  initialData,
}: {
  categories: { id: string; name: string }[];
  initialData?: any; // product with product_images and product_variants
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build initial images
  const [images, setImages] = useState<ImageInput[]>(
    initialData?.product_images?.map((img: any, i: number) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order ?? i,
    })) || [],
  );

  // Build initial variants
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.product_variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku || "",
      color_name: v.color_name || "",
      color_hex: v.color_hex || "#000000",
      size_name: v.size_name || "",
      price: v.price,
      stock_quantity: v.stock_quantity || 0,
    })) || [
      {
        sku: "",
        color_name: "",
        color_hex: "#000000",
        size_name: "",
        price: null,
        stock_quantity: 0,
      },
    ],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      category_id: initialData?.category_id || "",
      short_description: initialData?.short_description || "",
      description: initialData?.description || "",
      brand: initialData?.brand || "",
      sku: initialData?.sku || "",
      base_price: initialData?.base_price || 0,
      compare_at_price: initialData?.compare_at_price || null,
      cost_price: initialData?.cost_price || null,
      featured: initialData?.featured ?? false,
      is_active: initialData?.is_active ?? true,
    },
  });

  // Auto-generate slug from name (only for new products)
  const name = watch("name");
  const handleNameBlur = () => {
    if (!isEdit && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        color_name: "",
        color_hex: "#000000",
        size_name: "",
        price: null,
        stock_quantity: 0,
      },
    ]);
  };

  const removeVariant = (i: number) => {
    if (variants.length === 1) {
      return toast.error("Product must have at least one variant");
    }
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof VariantInput, value: any) => {
    setVariants(
      variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (images.length === 0) return toast.error("Add at least one image");
    if (variants.length === 0) return toast.error("Add at least one variant");

    setIsSubmitting(true);

    const payload = {
      ...data,
      compare_at_price: data.compare_at_price || null,
      cost_price: data.cost_price || null,
      images,
      variants: variants.map((v) => ({
        ...v,
        color_name: v.color_name || null,
        size_name: v.size_name || null,
        price: v.price || null,
      })),
    };

    const result = isEdit
      ? await updateProduct(initialData.id, payload)
      : await createProduct(payload as any);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save product");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold text-lg">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              {...register("name")}
              onBlur={handleNameBlur}
              className="w-full border p-3 rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              {...register("slug")}
              className="w-full border p-3 rounded-md"
              placeholder="premium-leather-bag"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /products/your-slug
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              {...register("category_id")}
              className="w-full border p-3 rounded-md bg-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              {...register("brand")}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              {...register("sku")}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Short Description
            </label>
            <input
              {...register("short_description")}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Full Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full border p-3 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold text-lg">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Base Price (৳)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("base_price")}
              className="w-full border p-3 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Compare-at Price (৳)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("compare_at_price")}
              className="w-full border p-3 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Cost Price (৳)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("cost_price")}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal only — not shown to customers
            </p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold text-lg">Images</h2>
        <ImageUploader
          images={images}
          setImages={setImages}
          productId={initialData?.id || "temp"}
        />
      </div>

      {/* Variants */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Variants</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Each combination of color/size needs its own variant
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, i) => (
            <div
              key={variant.id || `new-${i}`}
              className="grid grid-cols-12 gap-2 items-end border-b pb-3"
            >
              <div className="col-span-3">
                <label className="block text-xs text-gray-500 mb-1">SKU</label>
                <input
                  value={variant.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  className="w-full border p-2 rounded-md text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Color
                </label>
                <input
                  value={variant.color_name}
                  onChange={(e) =>
                    updateVariant(i, "color_name", e.target.value)
                  }
                  className="w-full border p-2 rounded-md text-sm"
                  placeholder="Black"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="color"
                  value={variant.color_hex}
                  onChange={(e) =>
                    updateVariant(i, "color_hex", e.target.value)
                  }
                  className="w-full h-9 rounded-md cursor-pointer"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Size</label>
                <input
                  value={variant.size_name}
                  onChange={(e) =>
                    updateVariant(i, "size_name", e.target.value)
                  }
                  className="w-full border p-2 rounded-md text-sm"
                  placeholder="M"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={variant.price || ""}
                  onChange={(e) =>
                    updateVariant(
                      i,
                      "price",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full border p-2 rounded-md text-sm"
                  placeholder="Auto"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={variant.stock_quantity}
                  onChange={(e) =>
                    updateVariant(i, "stock_quantity", Number(e.target.value))
                  }
                  className="w-full border p-2 rounded-md text-sm"
                />
              </div>
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={variants.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    variants.length === 1
                      ? "At least one variant required"
                      : "Remove variant"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="bg-white p-6 rounded-lg border space-y-3">
        <h2 className="font-bold text-lg">Flags</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("featured")} />
          <span className="text-sm">
            Featured (show on homepage Best Sellers)
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} />
          <span className="text-sm">Active (visible to customers)</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white px-8 py-4 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSubmitting
            ? isEdit
              ? "UPDATING..."
              : "CREATING..."
            : isEdit
              ? "UPDATE PRODUCT"
              : "CREATE PRODUCT"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={isSubmitting}
          className="px-6 py-4 rounded-md text-sm border hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
