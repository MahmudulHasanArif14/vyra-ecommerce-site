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
import { Upload, X, Save, Loader2, FolderTree } from "lucide-react";

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
    resolver: zodResolver(categorySchema) as any,
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

    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

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

    e.target.value = "";
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

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition";
  const labelClass =
    "block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* ============================================================ */}
      {/* DETAILS CARD */}
      {/* ============================================================ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        {/* Section header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <FolderTree className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Category Details</h2>
        </div>

        {/* Name */}
        <div>
          <label className={labelClass}>
            Category Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            onBlur={handleNameBlur}
            className={inputClass}
            placeholder="Bags"
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            {...register("slug")}
            className={`${inputClass} font-mono`}
            placeholder="bags"
          />
          {errors.slug && (
            <p className="text-red-400 text-xs mt-1.5">{errors.slug.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1.5">
            Will appear as{" "}
            <span className="font-mono text-gray-400">/category/your-slug</span>
          </p>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Premium bags and totes for everyday use"
          />
        </div>

        {/* Image */}
        <div>
          <label className={labelClass}>Image</label>

          {imageUrl ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 group">
              <Image
                src={imageUrl}
                alt="Category"
                fill
                sizes="128px"
                className="object-cover"
              />
              {/* Hover overlay with remove */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-red-100 transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <label className="w-32 h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500 mb-1.5" />
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    Upload
                  </span>
                </>
              )}
            </label>
          )}
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, or WEBP. Max 5MB.
          </p>
        </div>

        {/* Sort order + Active */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              type="number"
              {...register("sort_order")}
              className={`${inputClass} tabular-nums`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Lower numbers appear first
            </p>
          </div>

          <div className="flex items-center pt-6 md:pt-7">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <div>
                <p className="text-sm text-white font-medium">Active</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visible on the storefront
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUBMIT */}
      {/* ============================================================ */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {initialData ? "UPDATE CATEGORY" : "CREATE CATEGORY"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          disabled={isSubmitting}
          className="border border-white/10 text-gray-300 px-6 py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
