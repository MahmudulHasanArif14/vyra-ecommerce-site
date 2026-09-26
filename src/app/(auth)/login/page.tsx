"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signInWithGoogle } from "@/actions/auth";
import { toast } from "sonner";
import Header from "@/components/layout/header";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result?.error) toast.error(result.error);
    setLoading(false);
  };

  return (
    <>
      <div className="space-y-6 pt-16">
        {/* Title section only (since background image handles the main logo header) */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
          <p className="text-sm text-gray-300">Sign in to your account</p>
        </div>

        {/* Glassmorphism Form Card */}
        <form
          action={handleSubmit}
          className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl space-y-4 text-white"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-black/10 border border-white/20 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#f3e5ab]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-black/50 border border-white/20 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#f3e5ab]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-300 hover:text-[#f3e5ab] transition-colors cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-black font-medium py-3 rounded-md text-sm tracking-widest hover:bg-[#c5a028] transition-colors disabled:bg-gray-600 disabled:text-gray-400 shadow-md"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-gray-400">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white/10 border border-white/20 py-3 rounded-md text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-300">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#f3e5ab] underline hover:text-white"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
