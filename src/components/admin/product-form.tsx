"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProduct, updateProduct } from "@/actions/admin";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Package,
  Tag,
  DollarSign,
  ImageIcon,
  Layers,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import ImageUploader from "./image-uploader";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category_id: z.string().uuid(),
  gender: z.enum(["men", "women", "unisex"]).default("unisex"),
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
  color_name?: string | null;
};

export default function ProductForm({
  categories,
  initialData,
}: {
  categories: { id: string; name: string }[];
  initialData?: any;
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [images, setImages] = useState<ImageInput[]>(
    initialData?.product_images?.map((img: any, i: number) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order ?? i,
      color_name: img.color_name || null,
    })) || [],
  );

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.product_variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku || "",
      color_name: v.color_name || "",
      color_hex: v.color_hex || "#000000",
      size_name: v.size_name || "",
      price: v.price ?? null,
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
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      category_id: initialData?.category_id ?? "",
      gender: initialData?.gender ?? "unisex",
      short_description: initialData?.short_description ?? "",
      description: initialData?.description ?? "",
      brand: initialData?.brand ?? "",
      sku: initialData?.sku ?? "",
      base_price: initialData?.base_price ?? 0,
      compare_at_price: initialData?.compare_at_price ?? null,
      cost_price: initialData?.cost_price ?? null,
      featured: initialData?.featured ?? false,
      is_active: initialData?.is_active ?? true,
    },
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
    if (variants.length === 1) {
      return toast.error("Product must have at least one variant");
    }
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

    const missingSku = variants.find((v) => !v.sku || !v.sku.trim());
    if (missingSku) {
      return toast.error("Every variant must have a SKU");
    }

    const skuSet = new Set<string>();
    for (const v of variants) {
      if (skuSet.has(v.sku.trim())) {
        return toast.error(`Duplicate SKU: ${v.sku}`);
      }
      skuSet.add(v.sku.trim());
    }

    setIsSubmitting(true);

    const payload = {
      ...data,
      compare_at_price: data.compare_at_price || null,
      cost_price: data.cost_price || null,
      images: images.map((img, i) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        sort_order: i,
        color_name: img.color_name || null,
      })),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        color_name: v.color_name || null,
        color_hex: v.color_hex || null,
        size_name: v.size_name || null,
        price: v.price || null,
        stock_quantity: v.stock_quantity,
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

  const nameValue = watch("name");
  const slugValue = watch("slug");

  const handleNameBlur = () => {
    if (!isEdit && nameValue && !slugValue) {
      const newSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", newSlug);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition";
  const labelClass =
    "block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2";

  const currentVariantColors = Array.from(
    new Set(variants.map((v) => v.color_name).filter(Boolean)),
  ) as string[];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ============================================================ */}
      {/* BASIC INFO */}
      {/* ============================================================ */}
      <SectionCard
        icon={Package}
        accent="cyan"
        title="Basic Information"
        subtitle="Product name, category, and description"
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("name")}
              onBlur={handleNameBlur}
              className={inputClass}
              placeholder="Premium Leather Bag"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <input
              {...register("slug")}
              className={`${inputClass} font-mono`}
              placeholder="premium-leather-bag"
            />
            {slugValue && (
              <p className="text-xs text-gray-500 mt-1.5">
                URL:{" "}
                <span className="font-mono text-gray-400">
                  /products/{slugValue}
                </span>
              </p>
            )}
            {errors.slug && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Category <span className="text-red-400">*</span>
            </label>
            <select
              {...register("category_id")}
              className={`${inputClass} bg-[#0f0f0f]`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select
              {...register("gender")}
              className={`${inputClass} bg-[#0f0f0f]`}
            >
              <option value="unisex">Unisex (show in all)</option>
              <option value="men">Men only</option>
              <option value="women">Women only</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Unisex products appear in both MEN and WOMEN collections
            </p>
          </div>

          <div>
            <label className={labelClass}>Brand</label>
            <input
              {...register("brand")}
              className={inputClass}
              placeholder="VYRA"
            />
          </div>

          <div>
            <label className={labelClass}>SKU</label>
            <input
              {...register("sku")}
              className={`${inputClass} font-mono`}
              placeholder="PROD-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Short Description</label>
            <input
              {...register("short_description")}
              className={inputClass}
              placeholder="A premium everyday bag"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Full Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Detailed description of the product..."
            />
          </div>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* PRICING */}
      {/* ============================================================ */}
      <SectionCard
        icon={DollarSign}
        accent="green"
        title="Pricing"
        subtitle="Base price, discount, and cost"
      >
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>
              Base Price (৳) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("base_price")}
              className={`${inputClass} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelClass}>Compare-at Price (৳)</label>
            <input
              type="number"
              step="0.01"
              {...register("compare_at_price")}
              className={`${inputClass} tabular-nums`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Shows original price crossed out
            </p>
          </div>

          <div>
            <label className={labelClass}>Cost Price (৳)</label>
            <input
              type="number"
              step="0.01"
              {...register("cost_price")}
              className={`${inputClass} tabular-nums`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Internal only — never shown to customers
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* IMAGES */}
      {/* ============================================================ */}
      <SectionCard
        icon={ImageIcon}
        accent="purple"
        title="Images"
        subtitle="First image is the primary thumbnail"
      >
        <ImageUploader
          images={images}
          setImages={setImages}
          productId={initialData?.id || "temp"}
          availableColors={currentVariantColors}
        />
      </SectionCard>

      {/* ============================================================ */}
      {/* VARIANTS */}
      {/* ============================================================ */}
      <SectionCard
        icon={Layers}
        accent="amber"
        title="Variants"
        subtitle="Every variant needs a unique SKU"
      >
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg hover:bg-white/[0.07] hover:border-white/25 transition-all duration-300"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Variant
          </button>
        </div>

        {/* Warning banner for edit-mode products with no variants */}
        {isEdit &&
          (!initialData?.product_variants ||
            initialData.product_variants.length === 0) && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3.5 flex items-start gap-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-300">
                  This product has no variants yet
                </p>
                <p className="text-amber-400/80 mt-0.5">
                  Add at least one variant with a unique SKU below and save.
                </p>
              </div>
            </div>
          )}

        <div className="space-y-3">
          {variants.map((variant, i) => (
            <div
              key={variant.id || `new-${i}`}
              className="grid grid-cols-12 gap-2 items-end pb-3 border-b border-white/5 last:border-0"
            >
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  SKU <span className="text-red-400">*</span>
                </label>
                <input
                  value={variant.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  placeholder="PROD-001-BLK"
                  className={`${inputClass} py-2 font-mono text-xs`}
                />
                {!variant.sku.trim() && (
                  <p className="text-red-400 text-[10px] mt-1">Required</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  Color
                </label>
                <input
                  value={variant.color_name}
                  onChange={(e) =>
                    updateVariant(i, "color_name", e.target.value)
                  }
                  className={`${inputClass} py-2 text-xs`}
                  placeholder="Black"
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <input
                  type="color"
                  value={variant.color_hex}
                  onChange={(e) =>
                    updateVariant(i, "color_hex", e.target.value)
                  }
                  className="w-full h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                />
              </div>

              <div className="col-span-3 sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  Size
                </label>
                <input
                  value={variant.size_name}
                  onChange={(e) =>
                    updateVariant(i, "size_name", e.target.value)
                  }
                  className={`${inputClass} py-2 text-xs`}
                  placeholder="M"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
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
                  className={`${inputClass} py-2 text-xs tabular-nums`}
                  placeholder="Auto"
                />
              </div>

              <div className="col-span-6 sm:col-span-1">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  Stock
                </label>
                <input
                  type="number"
                  value={variant.stock_quantity}
                  onChange={(e) =>
                    updateVariant(i, "stock_quantity", Number(e.target.value))
                  }
                  className={`${inputClass} py-2 text-xs tabular-nums`}
                />
              </div>

              <div className="col-span-3 sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={variants.length === 1}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
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
      </SectionCard>

      {/* ============================================================ */}
      {/* FLAGS */}
      {/* ============================================================ */}
      <SectionCard
        icon={Sparkles}
        accent="pink"
        title="Flags"
        subtitle="Control visibility across the store"
      >
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-4 h-4 mt-0.5 rounded accent-cyan-500"
            />
            <div>
              <p className="text-sm text-white font-medium group-hover:text-cyan-300 transition">
                Featured
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Show this product on the homepage Best Sellers section
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("is_active")}
              className="w-4 h-4 mt-0.5 rounded accent-cyan-500"
            />
            <div>
              <p className="text-sm text-white font-medium group-hover:text-cyan-300 transition">
                Active
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Visible and purchasable by customers
              </p>
            </div>
          </label>
        </div>
      </SectionCard>

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
              {isEdit ? "UPDATING..." : "CREATING..."}
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={isSubmitting}
          className="border border-white/10 text-gray-300 px-6 py-3.5 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

/* ============================================================ */
/* Section Card Wrapper                                          */
/* ============================================================ */
function SectionCard({
  icon: Icon,
  accent,
  title,
  subtitle,
  children,
}: {
  icon: any;
  accent: "cyan" | "green" | "purple" | "amber" | "pink" | "blue";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const accents = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      text: "text-pink-400",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 transition-all duration-300 hover:border-white/15">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div
          className={`w-9 h-9 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
