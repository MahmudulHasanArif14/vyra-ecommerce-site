import { getSettings } from "@/lib/settings";
import SplitHeroClient from "./split-hero-client";

export default async function SplitHero() {
  const settings = await getSettings();

  const menImage =
    settings.hero_men_image ||
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200&auto=format&fit=crop";
  const womenImage =
    settings.hero_women_image ||
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop";

  return (
    <SplitHeroClient
      menImage={menImage}
      womenImage={womenImage}
      menLabel={settings.hero_men_label || "MEN"}
      menCta={settings.hero_men_cta || "SHOP NEW COLLECTION"}
      menUrl={settings.hero_men_url || "/men"}
      womenLabel={settings.hero_women_label || "WOMEN"}
      womenCta={settings.hero_women_cta || "SHOP NEW COLLECTION"}
      womenUrl={settings.hero_women_url || "/women"}
    />
  );
}
