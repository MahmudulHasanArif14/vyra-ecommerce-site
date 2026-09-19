"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { useRouter } from "next/navigation";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Please enter a valid email");
    }
    setLoading(true);

    // Simulate subscription (wire up to a real endpoint later)
    await new Promise((resolve) => setTimeout(resolve, 600));
    const result = await subscribeToNewsletter(email);

    if (result.success) {
      toast.success(result.message || "Thanks for subscribing!");
      setEmail("");
      setLoading(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="flex-1 border border-r-0 px-4 py-3 text-sm focus:outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-3 text-xs tracking-[0.2em] font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
      >
        {loading ? "..." : "SUBSCRIBE"}
      </button>
    </form>
  );
}
