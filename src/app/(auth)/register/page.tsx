"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, signInWithGoogle } from "@/actions/auth";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (result?.success) {
      toast.success("Account created successfully!");
      router.push("/account");
      router.refresh();
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);

    const result = await signInWithGoogle();

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-16">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-white">Create Account</h2>

        <p className="text-sm text-gray-300">
          Join VYRA to track orders and save wishlists
        </p>
      </div>

      <form
        action={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl space-y-4 text-white"
      >
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-1 text-gray-200"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            disabled={loading}
            className="w-full bg-black/10 border border-white/20 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#f3e5ab] focus:ring-1 focus:ring-[#f3e5ab]/20 transition-colors disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1 text-gray-200"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={loading}
            className="w-full bg-black/10 border border-white/20 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#f3e5ab] focus:ring-1 focus:ring-[#f3e5ab]/20 transition-colors disabled:opacity-50"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1 text-gray-200"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            disabled={loading}
            className="w-full bg-black/50 border border-white/20 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#f3e5ab] focus:ring-1 focus:ring-[#f3e5ab]/20 transition-colors disabled:opacity-50"
            placeholder="••••••••"
          />

          <p className="mt-1.5 text-xs text-gray-500">At least 6 characters</p>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Create Account */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4af37] text-black font-medium py-3 rounded-md text-sm tracking-widest hover:bg-[#c5a028] transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/15" />
          </div>

          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-3 text-gray-400">OR</span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-white/10 border border-white/20 py-3 rounded-md text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-gray-300">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#f3e5ab] underline underline-offset-2 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
