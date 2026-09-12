import ProductCard from "./product-card";

export function ProductGrid({ products }: { products: any[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-24 text-gray-500">No products found</div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
