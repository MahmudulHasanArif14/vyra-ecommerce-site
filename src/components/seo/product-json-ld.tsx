import { getProductRating } from "@/actions/reviews";

export default async function ProductJsonLd({ product }: { product: any }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vyra.com";
  const { average, count } = await getProductRating(product.id);

  const totalStock =
    product.product_variants?.reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0,
    ) || 0;

  const primaryImage =
    product.product_images?.find((i: any) => i.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  const data: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || "",
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "VYRA Accessories",
    },
    image: product.product_images?.map((img: any) => img.image_url) || [],
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "BDT",
      price: product.base_price,
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "VYRA Accessories",
      },
    },
  };

  // Only add aggregateRating if there are actual reviews
  if (count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: average,
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
