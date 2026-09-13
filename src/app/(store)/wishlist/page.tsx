import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart"; // Won't work here — Server Component
import WishlistCard from "./wishlist-card";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/wishlist");
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    return <EmptyWishlist />;
  }

  const { data: items } = await supabase
    .from("wishlist_items")
    .select(
      `
      id, created_at, product_id,
      products (
        id, name, slug, base_price, compare_at_price, is_active,
        product_images (image_url, is_primary),
        product_variants (id, price, stock_quantity, color_hex, color_name)
      )
    `,
    )
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  // Filter out inactive products
  const validItems =
    items?.filter((i: any) => i.products && i.products.is_active) || [];

  if (validItems.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-500 mt-1">
            {validItems.length} saved item{validItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs text-gray-500 hover:text-black underline"
        >
          Continue shopping →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {validItems.map((item: any) => (
          <WishlistCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
      <p className="text-gray-500 mb-8">
        Save items you love and come back to them later.
      </p>
      <Link
        href="/products"
        className="inline-block bg-black text-white px-8 py-4 text-xs tracking-widest hover:bg-gray-800 transition"
      >
        START SHOPPING
      </Link>
    </div>
  );
}
