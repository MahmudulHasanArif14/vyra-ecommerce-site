"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Loader2, Check } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Please enter a valid email");
    }

    setLoading(true);

    // Simulate subscription (replace with real endpoint later)
    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.success("Thanks for subscribing!");
    setJustSubscribed(true);
    setEmail("");
    setLoading(false);

    setTimeout(() => setJustSubscribed(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:rounded-lg sm:overflow-hidden sm:border sm:border-white/10 focus-within:border-cyan-500/40 transition-colors duration-300">
        {/* Email input with icon */}
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading || justSubscribed}
            className="w-full h-12 bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 rounded-lg sm:rounded-none text-white placeholder-gray-600 pl-11 pr-4 text-sm focus:outline-none disabled:opacity-50 transition"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || justSubscribed}
          className={`h-12 px-6 rounded-lg sm:rounded-none text-xs tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            justSubscribed
              ? "bg-green-500 text-white"
              : "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">WAIT</span>
            </>
          ) : justSubscribed ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              DONE
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5 sm:hidden" />
              SUBSCRIBE
            </>
          )}
        </button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-500 mt-3 text-center sm:text-left">
        No spam, just the good stuff. Unsubscribe anytime.
      </p>
    </form>
  );
}
