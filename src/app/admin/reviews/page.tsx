import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import ReviewModerationTable from "./review-table";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { filter } = await searchParams;

  let query = supabase
    .from("reviews")
    .select(
      `
      id, rating, title, comment, is_approved, is_verified_purchase,
      created_at, user_id, product_id,
      products (id, name, slug)
    `,
    )
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("is_approved", false);
  if (filter === "approved") query = query.eq("is_approved", true);

  const { data: reviewsBase, error } = await query;

  if (error) {
    console.error("[AdminReviews] query error:", error);
  }

  const reviewIds = (reviewsBase || []).map((r) => r.id);
  const userIds = Array.from(
    new Set((reviewsBase || []).map((r) => r.user_id)),
  );

  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);
    profiles = data || [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  let replies: any[] = [];
  if (reviewIds.length > 0) {
    const { data } = await supabase
      .from("review_replies")
      .select(
        "id, review_id, reply, is_admin_reply, is_visible, created_at, user_id",
      )
      .in("review_id", reviewIds)
      .order("created_at", { ascending: true });
    replies = data || [];
  }

  const reviews = (reviewsBase || []).map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) || null,
    review_replies: replies.filter((rp) => rp.review_id === r.id),
  }));

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

  const stats = [
    {
      label: "All Reviews",
      value: totalCount || 0,
      icon: Star,
      href: "/admin/reviews",
      isActive: !filter,
      accent: "cyan" as const,
    },
    {
      label: "Pending",
      value: pendingCount || 0,
      icon: Clock,
      href: "/admin/reviews?filter=pending",
      isActive: filter === "pending",
      accent: "amber" as const,
    },
    {
      label: "Approved",
      value: approvedCount || 0,
      icon: CheckCircle2,
      href: "/admin/reviews?filter=approved",
      isActive: filter === "approved",
      accent: "green" as const,
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-yellow-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Moderation
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Reviews
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Moderate reviews and reply publicly as VYRA Team
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* STATS / FILTERS */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isActive = stat.isActive;

              const accents = {
                cyan: {
                  bg: "bg-cyan-500/10",
                  border: "border-cyan-500/20",
                  text: "text-cyan-400",
                  glow: "bg-cyan-500/10",
                  activeBg: "bg-cyan-500/10",
                  activeBorder: "border-cyan-500/30",
                },
                amber: {
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                  text: "text-amber-400",
                  glow: "bg-amber-500/10",
                  activeBg: "bg-amber-500/10",
                  activeBorder: "border-amber-500/30",
                },
                green: {
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                  text: "text-green-400",
                  glow: "bg-green-500/10",
                  activeBg: "bg-green-500/10",
                  activeBorder: "border-green-500/30",
                },
              };
              const colors = accents[stat.accent];

              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? `${colors.activeBg} border ${colors.activeBorder}`
                      : "bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                        {stat.label}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* TABLE */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <ReviewModerationTable reviews={reviews as any} />
        </FadeIn>
      </div>
    </div>
  );
}
