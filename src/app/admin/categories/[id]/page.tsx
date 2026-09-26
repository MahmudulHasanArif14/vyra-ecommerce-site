import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderTree, ExternalLink } from "lucide-react";
import CategoryForm from "@/components/admin/category-form";
import FadeIn from "@/components/animation/fade-in";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 max-w-3xl">
        {/* ============================================================ */}
        {/* BACK LINK */}
        {/* ============================================================ */}
        <FadeIn y={10}>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to categories
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                  Category
                </p>
                <h1
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Edit Category
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                  Editing{" "}
                  <span className="text-white font-medium">
                    {category.name}
                  </span>
                </p>
              </div>
            </div>

            {/* View on storefront */}
            <Link
              href={`/category/${category.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-3.5 py-2 rounded-lg transition"
            >
              <ExternalLink className="w-3 h-3" />
              View on store
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <CategoryForm initialData={category} />
        </FadeIn>
      </div>
    </div>
  );
}
