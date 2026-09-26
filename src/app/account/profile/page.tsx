import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Lock,
  AlertTriangle,
} from "lucide-react";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";
import FadeIn from "@/components/animation/fade-in";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isGoogleUser =
    user.app_metadata?.provider === "google" ||
    user.app_metadata?.providers?.includes("google");

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-6">
        {/* ============================================================ */}
        {/* BACK LINK */}
        {/* ============================================================ */}
        <FadeIn y={10}>
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to account
          </Link>
        </FadeIn>

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div className="border-b border-white/5 pb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              Account
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Profile Settings
            </h1>
            <p className="text-gray-400">Update your personal information</p>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* BASIC INFO */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <SectionHeading
            icon={User}
            accent="cyan"
            title="Personal Information"
          />
          <ProfileForm
            profile={{
              full_name: profile?.full_name || "",
              email: user.email || "",
              phone: profile?.phone || "",
            }}
          />
        </FadeIn>

        {/* ============================================================ */}
        {/* PASSWORD */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.2}>
          <SectionHeading icon={Lock} accent="blue" title="Password" />
          {!isGoogleUser ? (
            <PasswordForm />
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">
                    Password managed by Google
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    You signed in with Google. Password changes are handled
                    through your Google account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </FadeIn>

        {/* ============================================================ */}
        {/* DANGER ZONE */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.3}>
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-red-300">Danger Zone</h2>
              </div>

              <p className="text-sm text-red-400/80 mb-5 leading-relaxed">
                Deleting your account is permanent and cannot be undone. All
                your data will be removed from our servers.
              </p>

              <button
                type="button"
                disabled
                className="text-xs bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-2.5 rounded-lg opacity-60 cursor-not-allowed"
                title="Contact support to delete your account"
              >
                DELETE ACCOUNT
              </button>

              <p className="text-xs text-red-400/60 mt-3">
                To delete your account, please contact support.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Section Heading                                               */
/* ============================================================ */
function SectionHeading({
  icon: Icon,
  accent,
  title,
}: {
  icon: any;
  accent: "cyan" | "blue";
  title: string;
}) {
  const accents = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
  };
  const colors = accents[accent];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`w-10 h-10 shrink-0 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}
      >
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
    </div>
  );
}
