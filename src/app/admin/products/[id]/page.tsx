import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Boxes,
  Sparkles,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import DeleteProductButton from "./delete-product-button";
import FadeIn from "@/components/animation/fade-in";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

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

  const variantCount = product.product_variants?.length || 0;
  const imageCount = product.product_images?.length || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8">
        {/* ============================================================ */}
        {/* BACK LINK */}
        {/* ============================================================ */}
        <FadeIn y={10}>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to products
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-start gap-6 flex-wrap">
              {/* Left: product info */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                      Editing Product
                    </p>
                  </div>

                  <h1
                    className="text-2xl md:text-3xl font-bold tracking-tight text-white truncate"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {product.name}
                  </h1>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                    {product.sku && (
                      <span className="font-mono text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                        {product.sku}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <Boxes className="w-3.5 h-3.5 text-gray-500" />
                      <span className="tabular-nums font-medium text-white">
                        {totalStock}
                      </span>
                      in stock
                    </span>

                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <span className="text-white font-medium tabular-nums">
                        {variantCount}
                      </span>
                      {variantCount === 1 ? "variant" : "variants"}
                    </span>

                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <span className="text-white font-medium tabular-nums">
                        {imageCount}
                      </span>
                      {imageCount === 1 ? "image" : "images"}
                    </span>

                    {/* Status badge */}
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-green-500/10 text-green-300 border-green-500/20 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 text-gray-400 border-white/10 font-medium">
                        <PauseCircle className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all duration-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on store
                </Link>

                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <ProductForm categories={categories || []} initialData={product} />
        </FadeIn>
      </div>
    </div>
  );
}
