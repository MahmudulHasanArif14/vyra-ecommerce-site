"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { requestPasswordReset } from "@/actions/password-reset";
import { toast } from "sonner";
import { gsap } from "gsap";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 25,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      },
    );
  }, []);

  useEffect(() => {
    if (!success || !successRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      successRef.current,
      {
        opacity: 0,
        y: 15,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      },
    );
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    try {
      const result = await requestPasswordReset(formData);

      if (result.success) {
        setSuccess(true);
        toast.success("Reset link sent");
      } else {
        setError(result.error || "Something went wrong");
        toast.error(result.error || "Failed to send reset email");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     SUCCESS
  ============================================================ */

  if (success) {
    return (
      <div ref={successRef} className="w-full">
        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.08]">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>

        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#c9a46c]">
          EMAIL SENT
        </p>

        <h1 className="text-3xl font-light tracking-tight text-white">
          Check your inbox
        </h1>

        <p className="mt-4 text-sm leading-7 text-white/45">
          We've sent a password reset link to:
        </p>

        <p className="mt-2 break-all text-sm font-medium text-white">{email}</p>

        <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-xs leading-6 text-white/35">
            If you don't see the email within a few minutes, check your spam or
            junk folder.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="
              w-full rounded-xl
              border border-white/[0.08]
              bg-white/[0.025]
              py-3.5
              text-sm text-white/70
              transition
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            Try another email
          </button>

          <Link
            href="/login"
            className="
              flex w-full items-center justify-center
              rounded-xl
              bg-white
              py-3.5
              text-xs font-semibold
              tracking-[0.18em]
              text-black
              transition
              hover:bg-white/90
            "
          >
            BACK TO SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  /* ============================================================
     FORM
  ============================================================ */

  return (
    <div ref={cardRef}>
      {/* Header */}
      <div className="mb-10">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
          <Mail className="h-5 w-5 text-[#c9a46c]" />
        </div>

        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#c9a46c]">
          ACCOUNT RECOVERY
        </p>

        <h1 className="text-3xl font-light tracking-tight text-white">
          Forgot your password?
        </h1>

        <p className="mt-4 text-sm leading-7 text-white/40">
          No worries. Enter the email associated with your account and we'll
          send you a secure reset link.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/40"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              className="
                pointer-events-none
                absolute left-4 top-1/2
                h-4 w-4
                -translate-y-1/2
                text-white/25
              "
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
              className="
                w-full
                rounded-xl
                border border-white/[0.08]
                bg-white/[0.035]
                px-11 py-4
                text-sm text-white
                outline-none
                placeholder:text-white/20
                transition-all

                focus:border-[#c9a46c]/50
                focus:bg-white/[0.05]
                focus:ring-2
                focus:ring-[#c9a46c]/10

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3">
            <p className="text-xs leading-5 text-red-300">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email}
          className="
            flex w-full
            items-center justify-center
            gap-2
            rounded-xl
            bg-white
            py-4
            text-xs font-semibold
            tracking-[0.18em]
            text-black

            transition-all duration-200

            hover:bg-white/90
            active:scale-[0.99]

            disabled:cursor-not-allowed
            disabled:bg-white/10
            disabled:text-white/30
          "
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              SENDING...
            </>
          ) : (
            "SEND RESET LINK"
          )}
        </button>
      </form>

      {/* Back */}
      <div className="mt-8 border-t border-white/[0.06] pt-7">
        <Link
          href="/login"
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            text-white/35
            transition
            hover:text-white
          "
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
