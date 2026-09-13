"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createCategory,
  updateCategory,
  uploadCategoryImage,
} from "@/actions/categories";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, X } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormValues = z.output<typeof categorySchema>;

type Props = {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    sort_order?: number | null;
    is_active?: boolean | null;
  };
};

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(
    initialData?.image_url || "",
  );
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      sort_order: initialData?.sort_order || 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  // Auto-generate slug from name
  const name = watch("name");
  const handleNameBlur = () => {
    if (!initialData && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadCategoryImage(formData);
    setUploading(false);
    if (result.success && result.url) {
      setImageUrl(result.url);
      toast.success("Image uploaded");
    } else {
      toast.error(result.error || "Upload failed");
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    const payload = { ...data, image_url: imageUrl };

    const result = initialData
      ? await updateCategory(initialData.id, payload)
      : await createCategory(payload);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(initialData ? "Category updated!" : "Category created!");
      router.push("/admin/categories");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>
          <input
            {...register("name")}
            onBlur={handleNameBlur}
            className="w-full border p-3 rounded-md"
            placeholder="Bags"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input
            {...register("slug")}
            className="w-full border p-3 rounded-md"
            placeholder="bags"
          />
          {errors.slug && (
            <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Will appear as /category/your-slug
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full border p-3 rounded-md"
            placeholder="Premium bags and totes for everyday use"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          {imageUrl ? (
            <div className="relative w-32 h-32 rounded-md overflow-hidden border">
              <Image
                src={imageUrl}
                alt="Category"
                fill
                sizes="128px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-1 right-1 bg-white rounded-full p-1 hover:bg-red-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="w-32 h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-black">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">
                {uploading ? "Uploading..." : "Upload"}
              </span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input
              type="number"
              {...register("sort_order")}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Lower = appears first</p>
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input type="checkbox" {...register("is_active")} id="is_active" />
            <label htmlFor="is_active" className="text-sm">
              Active
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white px-8 py-4 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isSubmitting
          ? "SAVING..."
          : initialData
            ? "UPDATE CATEGORY"
            : "CREATE CATEGORY"}
      </button>
    </form>
  );
}
