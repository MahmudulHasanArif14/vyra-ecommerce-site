import ProductJsonLd from "@/components/seo/product-json-ld";
import BreadcrumbJsonLd from "@/components/seo/breadcrumb-json-ld";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductViewTracker from "./view-tracker";
import ProductDetailView from "@/components/products/product-detail-view";
import ReviewSection from "@/components/products/review-section";
import RelatedProducts from "@/components/products/related-products";

// ⭐ Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      "name, short_description, description, base_price, product_images(image_url, is_primary)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    return { title: "Product not found" };
  }

  const primaryImage =
    product.product_images?.find((i: any) => i.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  const description =
    product.short_description ||
    product.description?.substring(0, 160) ||
    `Buy ${product.name} at VYRA Accessories. Premium quality with delivery across Bangladesh.`;

  return {
    title: `${product.name} | VYRA Accessories`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const normalized = slug.toLowerCase().trim().replace(/\s+/g, "-");
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      gender,
      category_id,
      categories(name, slug),
      product_images(id, image_url, alt_text, is_primary, sort_order, color_name),
      product_variants(id, price, stock_quantity, color_hex, color_name, size_name, sku)
    `,
    )
    .or(`slug.eq.${slug},slug.eq.${normalized}`)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) notFound();

  // Sort images: primary first, then by sort_order
  const sortedImages = [...(product.product_images || [])].sort(
    (a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    },
  );

  const colors = Array.from(
    new Set(product.product_variants.map((v: any) => v.color_name)),
  ).filter(Boolean) as string[];

  const sizes = Array.from(
    new Set(product.product_variants.map((v: any) => v.size_name)),
  ).filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* ⭐ Structured data */}
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          {
            name: product.categories?.name || "Products",
            url: `/category/${product.categories?.slug}`,
          },
          { name: product.name, url: `/products/${product.slug}` },
        ]}
      />

      <ProductViewTracker
        productId={product.id}
        productName={product.name}
        price={product.base_price}
      />

      {/* Grid wrapper that holds gallery + detail view */}
      <div className="grid md:grid-cols-2 gap-12">
        <ProductDetailView
          product={product}
          images={sortedImages}
          colors={colors}
          sizes={sizes}
          variants={product.product_variants}
        />
      </div>

      <ReviewSection productId={product.id} productSlug={product.slug} />

      {product.category_id && (
        <RelatedProducts
          productId={product.id}
          categoryId={product.category_id}
          gender={product.gender}
          limit={4}
        />
      )}
    </div>
  );
}
