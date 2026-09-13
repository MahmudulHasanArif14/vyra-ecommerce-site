import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";

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
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      {/* Back link */}
      <Link
        href="/account"
        className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to account
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Update your personal information</p>
      </div>

      {/* Basic Info */}
      <ProfileForm
        profile={{
          full_name: profile?.full_name || "",
          email: user.email || "",
          phone: profile?.phone || "",
        }}
      />

      {/* Password (only for email/password users) */}
      {!isGoogleUser ? (
        <PasswordForm />
      ) : (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h2 className="font-bold mb-2">Password</h2>
          <p className="text-sm text-gray-500">
            You signed in with Google. Password management is handled by Google.
          </p>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="font-bold text-red-800 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          type="button"
          disabled
          className="text-xs bg-red-600 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
          title="Contact support to delete your account"
        >
          DELETE ACCOUNT
        </button>
        <p className="text-xs text-red-500 mt-2">
          To delete your account, please contact support.
        </p>
      </div>
    </div>
  );
}
