import { getSettings } from "@/lib/settings";
import Link from "next/link";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CartIcon from "./cart-icon"; // we'll create this
import Image from "next/image";

export default async function Header() {
  const settings = await getSettings();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order")
    .limit(5);

  const storeName = settings.store_name || "VYRA";
  const logoUrl = settings.store_logo_url;

  return (
    <header className="border-b border-gray-200 bg-[#FDFBF7] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        {/* Left: Nav links */}
        <nav className="hidden md:flex gap-6 text-xs font-medium tracking-wider">
          {categories?.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="hover:text-gray-500 uppercase"
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/track-order" className="hover:underline">
            Track Order
          </Link>
        </nav>

        {/* Center: Logo */}
        <Link href="/" className="text-center">
          {logoUrl ? (
            <div className="relative h-12 w-32">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-serif tracking-widest font-bold">
                {storeName.split(" ")[0]}
              </h1>
              {storeName.split(" ")[1] && (
                <p className="text-[10px] tracking-[0.3em] font-light">
                  {storeName.split(" ").slice(1).join(" ")}
                </p>
              )}
            </>
          )}
        </Link>

        {/* Right: Icons */}
        <div className="flex gap-5 items-center">
          <Link href="/search" aria-label="Search">
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:block"
          >
            <Heart className="w-5 h-5" />
          </Link>
          <CartIcon />
          <Link
            href="/account"
            aria-label="Account"
            className="hidden sm:block"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
