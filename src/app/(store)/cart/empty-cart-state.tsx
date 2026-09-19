import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  product_images: { image_url: string; is_primary: boolean }[];
  product_variants: {
    id: string;
    price: number | null;
    stock_quantity: number;
    color_hex: string | null;
    color_name: string | null;
  }[];
};

export default function EmptyCartState({ products }: { products: Product[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Empty cart hero */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added anything yet. Explore our best
          sellers and find something you&apos;ll love.
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-8 py-4 text-xs tracking-[0.2em] hover:bg-gray-800 transition"
        >
          SHOP ALL PRODUCTS
        </Link>
      </div>

      {/* Recommended products */}
      {products.length > 0 && (
        <div>
          <h2 className="text-center text-xl md:text-2xl font-bold mb-10 tracking-widest">
            YOU MAY ALSO LIKE
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage =
                product.product_images.find((i) => i.is_primary)?.image_url ||
                product.product_images[0]?.image_url;

              const totalStock =
                product.product_variants.reduce(
                  (sum, v) => sum + (v.stock_quantity || 0),
                  0,
                ) || 0;
              const inStock = totalStock > 0;

              const discount =
                product.compare_at_price &&
                product.compare_at_price > product.base_price
                  ? Math.round(
                      (1 - product.base_price / product.compare_at_price) * 100,
                    )
                  : 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}

                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}

                    {!inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-sm font-semibold tracking-widest">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">৳{product.base_price}</span>
                    {product.compare_at_price &&
                      product.compare_at_price > product.base_price && (
                        <span className="text-gray-400 line-through text-sm">
                          ৳{product.compare_at_price}
                        </span>
                      )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
