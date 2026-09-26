import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, FolderTree, Sparkles } from "lucide-react";
import CategoryDeleteButton from "./delete-button";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order", { ascending: true });

  const totalCategories = categories?.length || 0;
  const activeCategories =
    categories?.filter((c: any) => c.is_active).length || 0;
  const totalProducts =
    categories?.reduce(
      (sum: number, c: any) => sum + (c.products?.[0]?.count || 0),
      0,
    ) || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="flex justify-between items-start md:items-center gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                  Catalog
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Categories
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Organize your products into categories
              </p>
            </div>

            <Link
              href="/admin/categories/new"
              className="group inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              ADD CATEGORY
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.05}>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <StatMini label="Total" value={totalCategories} accent="cyan" />
            <StatMini label="Active" value={activeCategories} accent="green" />
            <StatMini label="Products" value={totalProducts} accent="blue" />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* MOBILE CARDS / DESKTOP TABLE */}
        {/* ============================================================ */}
        {categories?.length ? (
          <>
            {/* ---------- Desktop Table ---------- */}
            <FadeIn y={20} delay={0.1}>
              <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5 bg-white/[0.02]">
                      <tr>
                        <Th>Category</Th>
                        <Th>Slug</Th>
                        <Th>Products</Th>
                        <Th>Order</Th>
                        <Th>Status</Th>
                        <Th align="right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {categories.map((cat: any) => (
                        <tr
                          key={cat.id}
                          className="hover:bg-white/[0.02] transition-colors duration-200"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                                {cat.image_url ? (
                                  <Image
                                    src={cat.image_url}
                                    alt={cat.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FolderTree className="w-5 h-5 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-white truncate">
                                  {cat.name}
                                </p>
                                {cat.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                                    {cat.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-gray-500 font-mono">
                            {cat.slug}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-white tabular-nums">
                              {cat.products?.[0]?.count || 0}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-400 tabular-nums">
                            {cat.sort_order}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${
                                cat.is_active
                                  ? "bg-green-500/10 text-green-300 border-green-500/20"
                                  : "bg-white/5 text-gray-400 border-white/10"
                              }`}
                            >
                              {cat.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/categories/${cat.id}`}
                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <CategoryDeleteButton
                                id={cat.id}
                                name={cat.name}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            {/* ---------- Mobile Cards ---------- */}
            <div className="md:hidden">
              <StaggerChildren
                stagger={0.06}
                y={20}
                className="space-y-3"
                selector=":scope > div"
              >
                {categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderTree className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">
                          {cat.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                          {cat.slug}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium ${
                          cat.is_active
                            ? "bg-green-500/10 text-green-300 border-green-500/20"
                            : "bg-white/5 text-gray-400 border-white/10"
                        }`}
                      >
                        {cat.is_active ? "On" : "Off"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <span className="text-white font-medium tabular-nums">
                            {cat.products?.[0]?.count || 0}
                          </span>{" "}
                          products
                        </span>
                        <span>
                          Order{" "}
                          <span className="text-white font-medium tabular-nums">
                            {cat.sort_order}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/categories/${cat.id}`}
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <CategoryDeleteButton id={cat.id} name={cat.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </>
        ) : (
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <FolderTree className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                No categories yet
              </h2>

              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Start by creating your first category to organize your products.
              </p>

              <Link
                href="/admin/categories/new"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300 group"
              >
                <Plus className="w-4 h-4" />
                ADD YOUR FIRST CATEGORY
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/* Table Header Cell                                             */
/* ============================================================ */
function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`p-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 text-${align}`}
    >
      {children}
    </th>
  );
}

/* ============================================================ */
/* Stat Mini                                                     */
/* ============================================================ */
function StatMini({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "green" | "blue";
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
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${colors.text} bg-current`}
        />
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em]">
          {label}
        </p>
      </div>
      <p className="text-xl md:text-2xl font-bold text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}
