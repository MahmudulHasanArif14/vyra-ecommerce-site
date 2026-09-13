"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProduct } from "@/actions/admin";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "./image-uploader";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category_id: z.string().uuid(),
  short_description: z.string().default(""),
  description: z.string().default(""),
  brand: z.string().default(""),
  sku: z.string().min(2),
  base_price: z.coerce.number().positive(),
  compare_at_price: z.coerce.number().optional().nullable(),
  cost_price: z.coerce.number().optional().nullable(),
  featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormValues = z.output<typeof productSchema>;

type Variant = {
  sku: string;
  color_name: string;
  color_hex: string;
  size_name: string;
  price: number | null;
  stock_quantity: number;
};

export default function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    {
      sku: "",
      color_name: "",
      color_hex: "#000000",
      size_name: "",
      price: null,
      stock_quantity: 0,
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { featured: false, is_active: true },
  });

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
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof Variant, value: any) => {
    setVariants(
      variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (images.length === 0) return toast.error("Add at least one image");
    if (variants.length === 0) return toast.error("Add at least one variant");

    setIsSubmitting(true);
    const result = await createProduct({
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
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Product created!");
      router.push("/admin/products");
    } else {
      toast.error(result.error || "Failed to create product");
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              {...register("category_id")}
              className="w-full border p-3 rounded-md"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              {...register("cost_price")}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal only - not shown to customers
            </p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="font-bold text-lg">Images</h2>
        <ImageUploader images={images} setImages={setImages} />
      </div>

      {/* Variants */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Variants</h2>
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
              key={i}
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
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white px-8 py-4 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isSubmitting ? "CREATING..." : "CREATE PRODUCT"}
      </button>
    </form>
  );
}
