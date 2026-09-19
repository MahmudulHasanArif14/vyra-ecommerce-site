export default function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vyra.com";

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
