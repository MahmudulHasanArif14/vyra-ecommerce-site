import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Eye,
  Package,
  Sparkles,
  Star,
  ExternalLink,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, is_active, featured, created_at,
      categories(name),
      product_images(image_url, is_primary),
      product_variants(stock_quantity)
    `,
    )
    .order("created_at", { ascending: false });

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p: any) => p.is_active).length || 0;
  const featuredProducts = products?.filter((p: any) => p.featured).length || 0;

  // Compute stock status helper
  const stockInfo = (product: any) => {
    const totalStock =
      product.product_variants?.reduce(
        (sum: number, v: any) => sum + (v.stock_quantity || 0),
        0,
      ) || 0;

    if (totalStock === 0) {
      return {
        label: "Out",
        className: "text-red-400",
      };
    }
    if (totalStock < 10) {
      return {
        label: "Low",
        className: "text-yellow-400",
      };
    }
    return {
      label: "In stock",
      className: "text-green-400",
    };
  };

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
                Products
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Manage your product catalog
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="group inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              ADD PRODUCT
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.05}>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <StatMini
              label="Total"
              value={totalProducts}
              accent="cyan"
              icon={Package}
            />
            <StatMini
              label="Active"
              value={activeProducts}
              accent="green"
              icon={Sparkles}
            />
            <StatMini
              label="Featured"
              value={featuredProducts}
              accent="amber"
              icon={Star}
            />
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* PRODUCTS */}
        {/* ============================================================ */}
        {totalProducts > 0 ? (
          <>
            {/* ---------- Desktop Table ---------- */}
            <FadeIn y={20} delay={0.1}>
              <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5 bg-white/[0.02]">
                      <tr>
                        <Th>Product</Th>
                        <Th>Category</Th>
                        <Th>Price</Th>
                        <Th>Stock</Th>
                        <Th>Status</Th>
                        <Th align="right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products?.map((product: any) => {
                        const primaryImage =
                          product.product_images?.find((i: any) => i.is_primary)
                            ?.image_url ||
                          product.product_images?.[0]?.image_url;

                        const totalStock =
                          product.product_variants?.reduce(
                            (sum: number, v: any) =>
                              sum + (v.stock_quantity || 0),
                            0,
                          ) || 0;

                        const stock = stockInfo(product);

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-white/[0.02] transition-colors duration-200 group"
                          >
                            {/* Product */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                  {primaryImage ? (
                                    <Image
                                      src={primaryImage}
                                      alt={product.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-5 h-5 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/admin/products/${product.id}`}
                                    className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition truncate block max-w-[200px]"
                                  >
                                    {product.name}
                                  </Link>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-[200px]">
                                    {product.slug}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4 text-sm text-gray-400">
                              {product.categories?.name || "—"}
                            </td>

                            {/* Price */}
                            <td className="p-4 text-sm font-semibold text-white tabular-nums">
                              ৳{product.base_price}
                            </td>

                            {/* Stock */}
                            <td className="p-4">
                              <span
                                className={`text-sm font-bold tabular-nums ${stock.className}`}
                              >
                                {totalStock}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {product.is_active ? (
                                  <span className="inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-green-500/10 text-green-300 border-green-500/20 font-medium">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/5 text-gray-400 border-white/10 font-medium">
                                    Draft
                                  </span>
                                )}
                                {product.featured && (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20 font-medium">
                                    <Star className="w-2.5 h-2.5" />
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/products/${product.id}`}
                                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/products/${product.slug}`}
                                  target="_blank"
                                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                                  title="View on store"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            {/* ---------- Mobile Cards ---------- */}
            <div className="md:hidden space-y-3">
              {products?.map((product: any) => {
                const primaryImage =
                  product.product_images?.find((i: any) => i.is_primary)
                    ?.image_url || product.product_images?.[0]?.image_url;

                const totalStock =
                  product.product_variants?.reduce(
                    (sum: number, v: any) => sum + (v.stock_quantity || 0),
                    0,
                  ) || 0;

                const stock = stockInfo(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 transition line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product.categories?.name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                          Price
                        </p>
                        <p className="text-white font-semibold tabular-nums">
                          ৳{product.base_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                          Stock
                        </p>
                        <p
                          className={`font-bold tabular-nums ${stock.className}`}
                        >
                          {totalStock}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap py-3">
                      {product.is_active ? (
                        <span className="inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-green-500/10 text-green-300 border-green-500/20 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/5 text-gray-400 border-white/10 font-medium">
                          Draft
                        </span>
                      )}
                      {product.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20 font-medium">
                          <Star className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-black hover:bg-gray-200 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                No products yet
              </h2>

              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Start building your catalog by adding your first product.
              </p>

              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                ADD YOUR FIRST PRODUCT
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
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: "cyan" | "green" | "amber";
  icon: any;
}) {
  const accents = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      glow: "bg-cyan-500/10",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      glow: "bg-green-500/10",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      glow: "bg-amber-500/10",
    },
  };
  const colors = accents[accent];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] relative overflow-hidden group">
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <div className="relative">
        <div
          className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
        </div>
        <p className="text-xl md:text-2xl font-bold text-white tabular-nums">
          {value}
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
