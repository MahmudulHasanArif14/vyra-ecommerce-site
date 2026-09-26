import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

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
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* ============================================================ */}
        {/* EMPTY STATE HERO */}
        {/* ============================================================ */}
        <FadeIn y={30}>
          <div className="text-center mb-16 md:mb-24 max-w-lg mx-auto">
            {/* Icon */}
            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your Cart is Empty
            </h1>

            {/* Body */}
            <p className="text-gray-400 leading-relaxed mb-8">
              Looks like you haven&apos;t added anything yet. Explore our best
              sellers and find something you&apos;ll love.
            </p>

            {/* CTA */}
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
            >
              SHOP ALL PRODUCTS
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* RECOMMENDED PRODUCTS */}
        {/* ============================================================ */}
        {products.length > 0 && (
          <div>
            {/* Section header */}
            <FadeIn y={20}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-4">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                    Recommended
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  You May Also Like
                </h2>
              </div>
            </FadeIn>

            {/* Product grid */}
            <StaggerChildren
              stagger={0.08}
              y={30}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              selector=":scope > a"
            >
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
                        (1 - product.base_price / product.compare_at_price) *
                          100,
                      )
                    : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    {/* Image container */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 mb-3 transition-colors duration-300 group-hover:border-white/25">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}

                      {/* Discount badge */}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-white text-black text-[10px] px-2 py-1 rounded-md font-semibold tracking-wider">
                          -{discount}%
                        </span>
                      )}

                      {/* Out of stock overlay */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-xs font-semibold tracking-[0.2em] text-white/90 border border-white/20 px-3 py-1.5 rounded-full">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="font-medium text-sm text-white line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-semibold text-white tabular-nums">
                        ৳{product.base_price}
                      </span>
                      {product.compare_at_price &&
                        product.compare_at_price > product.base_price && (
                          <span className="text-gray-500 line-through text-sm tabular-nums">
                            ৳{product.compare_at_price}
                          </span>
                        )}
                    </div>
                  </Link>
                );
              })}
            </StaggerChildren>
          </div>
        )}
      </div>
    </div>
  );
}
