"use client";

import Link from "next/link";
import { useState } from "react";
import { register, signInWithGoogle } from "@/actions/auth";
import { toast } from "sonner";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    const result = await register(formData);
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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-serif font-bold tracking-widest">
            VYRA
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-gray-500">
            ACCESSORIES
          </p>
        </Link>
        <h2 className="text-2xl font-bold pt-6">Create Account</h2>
        <p className="text-sm text-gray-500">
          Join VYRA to track orders and save wishlists
        </p>
      </div>

      <form
        action={handleSubmit}
        className="bg-white p-8 rounded-lg border space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="fullName"
            required
            className="w-full border p-3 rounded-md"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border p-3 rounded-md"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full border p-3 rounded-md"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-500">OR</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border py-3 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-black underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
