import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle,
  Clock,
  ArrowLeft,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import FadeIn from "@/components/animation/fade-in";
import StaggerChildren from "@/components/animation/stagger-children";

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/reviews");

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, title, comment, is_approved, created_at,
      products (name, slug)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reviewCount = reviews?.length || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-8">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="border-b border-white/5 pb-8">
            <Link
              href="/account"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group mb-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              Back to account
            </Link>

            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Account
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Reviews
            </h1>
            <p className="text-gray-400">
              {reviewCount} review{reviewCount !== 1 ? "s" : ""} you&apos;ve
              written
            </p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* REVIEWS LIST */}
        {/* ============================================================ */}
        {reviewCount > 0 ? (
          <StaggerChildren
            stagger={0.08}
            y={20}
            className="space-y-4"
            selector=":scope > div"
          >
            {reviews?.map((review: any) => (
              <div
                key={review.id}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
              >
                {/* Header row */}
                <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                  <Link
                    href={`/products/${review.products?.slug}`}
                    className="font-medium text-sm text-white hover:underline underline-offset-4 decoration-white/40 hover:decoration-white transition"
                  >
                    {review.products?.name}
                  </Link>

                  {review.is_approved ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                {review.title && (
                  <p className="font-semibold text-sm text-white mt-4">
                    {review.title}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                  Written on{" "}
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </StaggerChildren>
        ) : (
          <FadeIn y={20} delay={0.1}>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                No reviews yet
              </h2>

              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Share your experience with products you&apos;ve purchased and
                help other shoppers decide.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/account/orders"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-white/5 transition-all duration-300"
                >
                  VIEW ORDERS
                </Link>
                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  BROWSE PRODUCTS
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
