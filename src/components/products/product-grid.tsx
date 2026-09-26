import ProductCard from "./product-card";
import { getWishlistProductIds } from "@/actions/wishlist";
import StaggerChildren from "@/components/animation/stagger-children";
import { Package } from "lucide-react";

export async function ProductGrid({
  products,
  emptyMessage,
}: {
  products: any[];
  emptyMessage?: string;
}) {
  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (!products.length) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {emptyMessage || "No products found"}
        </h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Try adjusting your filters, or browse our other collections.
        </p>
      </div>
    );
  }

  // ============================================================
  // FETCH WISHLIST STATE (server-side)
  // ============================================================
  const wishlistIds = await getWishlistProductIds();
  const wishlistSet = new Set(wishlistIds);

  // ============================================================
  // GRID
  // ============================================================
  return (
    <StaggerChildren
      stagger={0.08}
      y={30}
      className="
        grid
        grid-cols-2
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
        md:gap-6
      "
      selector=":scope > div"
    >
      {products.map((product) => (
        <div key={product.id}>
          <ProductCard
            product={product}
            isInWishlist={wishlistSet.has(product.id)}
          />
        </div>
      ))}
    </StaggerChildren>
  );
}
