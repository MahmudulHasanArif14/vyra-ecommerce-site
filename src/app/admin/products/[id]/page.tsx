import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import DeleteProductButton from "./delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  // Fetch product with relations
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (id, image_url, alt_text, is_primary, sort_order),
      product_variants (id, sku, color_name, color_hex, size_name, price, stock_quantity, low_stock_threshold)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  const totalStock =
    product.product_variants?.reduce(
      (s: number, v: any) => s + (v.stock_quantity || 0),
      0,
    ) || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <Link
        href="/admin/products"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="font-mono">{product.sku}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {totalStock} in stock
            </span>
            <span>·</span>
            <span
              className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                product.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.is_active ? "Active" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="text-xs border px-4 py-2.5 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View on store
          </Link>
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
          />
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories || []} initialData={product} />
    </div>
  );
}
