import ProductCard from "./product-card";
import { getWishlistProductIds } from "@/actions/wishlist";
import StaggerChildren from "@/components/animation/stagger-children";

export async function ProductGrid({ products }: { products: any[] }) {
  const wishlistIds = await getWishlistProductIds();
  const wishlistSet = new Set(wishlistIds);

  if (!products.length) {
    return (
      <div className="text-center py-24 text-gray-500">No products found</div>
    );
  }

  return (
    <StaggerChildren
      stagger={0.08}
      y={50}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {" "}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={wishlistSet.has(product.id)}
        />
      ))}
    </StaggerChildren>
  );
}
