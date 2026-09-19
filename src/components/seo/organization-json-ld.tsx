import { getSettings } from "@/lib/settings";

export default async function OrganizationJsonLd() {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vyra.com";

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.store_name || "VYRA Accessories",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: settings.store_email || "hello@vyra.com",
    telephone: settings.store_phone || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.store_address || "",
      addressLocality: "Sylhet",
      addressCountry: "BD",
    },
    sameAs: [
      settings.facebook_url,
      settings.instagram_url,
      settings.youtube_url,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
