"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordForm({
  initialError,
  errorDescription,
}: {
  initialError?: string;
  errorDescription?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ Error state (expired link, no session, exchange failed)
  if (initialError) {
    const isExpired =
      initialError === "access_denied" ||
      initialError === "otp_expired" ||
      initialError === "exchange_failed";
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {isExpired ? "Link Expired" : "Invalid Reset Link"}
        </h1>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {isExpired
            ? "This link has expired or was already used. Reset links are valid for 1 hour."
            : "This reset link is invalid. Please request a new one."}
        </p>

        {errorDescription && (
          <p className="text-xs text-gray-500 italic mb-6">
            {decodeURIComponent(errorDescription.replace(/\+/g, " "))}
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="block w-full py-3.5 rounded-lg bg-white text-black text-sm font-medium tracking-widest text-center hover:bg-gray-200 transition"
          >
            REQUEST NEW LINK
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 rounded-lg border border-white/10 text-sm text-gray-300 text-center hover:bg-white/5 transition"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      console.error("[reset-password] update error:", error);
      toast.error(error.message);
      return;
    }

    toast.success("Password updated! Signing you in...");
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 800);
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Set a new password
        </h1>
        <p className="text-sm text-gray-400">Choose something strong</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              placeholder="At least 6 characters"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3.5 pr-11 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              placeholder="Re-enter password"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3.5 pr-11 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full bg-white text-black py-3.5 rounded-lg text-sm font-medium tracking-widest hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              UPDATING...
            </>
          ) : (
            "UPDATE PASSWORD"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5">
        <Link
          href="/login"
          className="text-xs text-gray-500 hover:text-white inline-flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
