import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import HeaderNav from "./header-nav";

export default async function Header() {
  const settings = await getSettings();
  const supabase = await createClient();

  // Fetch top-level categories for the nav
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order")
    .limit(5);

  const storeName = settings.store_name || "VYRA";
  const logoUrl = settings.store_logo_url || null;

  // Build nav items — Home + 5 categories + About + Track Order
  const navItems = [
    { href: "/", label: "Home" },
    ...(categories || []).map((c) => ({
      href: `/category/${c.slug}`,
      label: c.name,
    })),
    { href: "/about", label: "About Us" },
    { href: "/track-order", label: "Track Order" },
  ];

  return <HeaderNav items={navItems} storeName={storeName} logoUrl={logoUrl} />;
}
