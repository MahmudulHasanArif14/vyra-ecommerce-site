import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Star, CheckCircle, XCircle } from "lucide-react";
import ReviewModerationTable from "./review-table";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { filter } = await searchParams;

  let query = await supabase
    .from("reviews")
    .select(
      `
    *,
    products (id, name, slug),
    profiles:user_id (full_name, email, avatar_url),
    review_replies (
      id, reply, is_admin_reply, is_visible, created_at,
      profiles:user_id (full_name)
    )
  `,
    )
    .order("created_at", { ascending: false });

  const { data: reviews } = await query;

  // Stats
  const { count: totalCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const { count: pendingCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false);

  const { count: approvedCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", true);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-gray-500 mt-1">
          Moderate customer reviews before they appear on the storefront
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/admin/reviews"
          className={`p-5 rounded-lg border transition ${
            !filter ? "bg-black text-white" : "bg-white hover:border-black"
          }`}
        >
          <Star className="w-5 h-5 mb-2 opacity-70" />
          <p className="text-2xl font-bold">{totalCount || 0}</p>
          <p className="text-xs uppercase tracking-wider mt-1 opacity-70">
            All Reviews
          </p>
        </Link>

        <Link
          href="/admin/reviews?filter=pending"
          className={`p-5 rounded-lg border transition ${
            filter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-white hover:border-yellow-300"
          }`}
        >
          <XCircle className="w-5 h-5 mb-2 opacity-70" />
          <p className="text-2xl font-bold">{pendingCount || 0}</p>
          <p className="text-xs uppercase tracking-wider mt-1 opacity-70">
            Pending
          </p>
        </Link>

        <Link
          href="/admin/reviews?filter=approved"
          className={`p-5 rounded-lg border transition ${
            filter === "approved"
              ? "bg-green-600 text-white"
              : "bg-white hover:border-green-300"
          }`}
        >
          <CheckCircle className="w-5 h-5 mb-2 opacity-70" />
          <p className="text-2xl font-bold">{approvedCount || 0}</p>
          <p className="text-xs uppercase tracking-wider mt-1 opacity-70">
            Approved
          </p>
        </Link>
      </div>

      <ReviewModerationTable reviews={reviews || []} />
    </div>
  );
}
