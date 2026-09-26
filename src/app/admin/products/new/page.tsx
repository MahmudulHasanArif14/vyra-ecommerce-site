import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, PackagePlus } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import FadeIn from "@/components/animation/fade-in";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 max-w-5xl">
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
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                  New
                </p>
              </div>

              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Add New Product
              </h1>

              <p className="text-gray-400 mt-2 text-sm">
                Create a new product and add it to your store catalog.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <ProductForm categories={categories || []} />
        </FadeIn>
      </div>
    </div>
  );
}
