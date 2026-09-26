import Image from "next/image";
import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-6xl">
        {/* Main Card */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {/* LEFT — Illustration */}
          <div className="relative hidden lg:flex min-h-[680px] items-center justify-center overflow-hidden border-r border-white/[0.07]">
            {/* Ambient glow */}
            <div className="absolute h-[420px] w-[420px] rounded-full bg-[#c9a46c]/10 blur-[100px]" />

            {/* Grid */}
            <div
              className="
                absolute inset-0
                opacity-[0.035]
                bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
                bg-[size:45px_45px]
              "
            />

            <div className="relative z-10 w-full max-w-[480px] px-10">
              <div className="mb-10">
                <Link href="/">
                  <Image
                    src="/assets/logo.png"
                    alt="VYRA Logo"
                    width={100}
                    height={40}
                  />
                </Link>

                <h2 className="text-4xl font-light leading-tight text-white">
                  Your account,
                  <br />
                  <span className="font-medium">safely within reach.</span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/45">
                  Enter your email address and we'll help you get back into your
                  VYRA account.
                </p>
              </div>

              {/* Illustration */}
              <div className="relative mx-auto aspect-square w-full max-w-100">
                <div className="absolute inset-8 rounded-full bg-[#c9a46c]/10 blur-[70px]" />

                <Image
                  src="/assets/forgot.png"
                  alt="Forgot password illustration"
                  fill
                  priority
                  className="relative z-10 object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
                  sizes="400px"
                />
              </div>

              {/* Bottom detail */}
              <div className="mt-8 flex items-center gap-3 text-xs text-white/30">
                <div className="h-px w-10 bg-white/10" />
                <span>SECURE ACCOUNT RECOVERY</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="flex min-h-[680px] items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
            <div className="w-full max-w-[390px]">
              {/* Mobile brand */}
              <div className="mb-12 lg:hidden">
                <Link
                  href="/"
                  className="text-lg font-semibold tracking-[0.3em]"
                >
                  VYRA
                </Link>
              </div>

              <ForgotPasswordForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 flex flex-col items-center justify-between gap-3 text-[11px] text-white/25 sm:flex-row">
          <p>© {new Date().getFullYear()} VYRA Accessories</p>

          <div className="flex gap-5">
            <Link href="/privacy" className="transition hover:text-white/60">
              Privacy
            </Link>

            <Link href="/terms" className="transition hover:text-white/60">
              Terms
            </Link>

            <Link href="/contact" className="transition hover:text-white/60">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
