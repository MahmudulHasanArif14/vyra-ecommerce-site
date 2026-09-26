import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export const metadata = {
  title: "Reset Password | VYRA Accessories",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
  }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // ⭐ Handle Supabase error params (expired link, etc.)
  if (params.error) {
    return (
      <ResetLayout>
        <ResetPasswordForm
          initialError={params.error}
          errorDescription={params.error_description}
        />
      </ResetLayout>
    );
  }

  // ⭐ CRITICAL: Exchange the code for a session
  if (params.code) {
    console.log("[reset-password] exchanging code for session");

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );

    if (exchangeError) {
      console.error("[reset-password] exchange failed:", exchangeError.message);
      return (
        <ResetLayout>
          <ResetPasswordForm
            initialError="exchange_failed"
            errorDescription={exchangeError.message}
          />
        </ResetLayout>
      );
    }

    console.log("[reset-password] session established, redirecting clean URL");

    // Session is now in cookies. Redirect to clean URL so the form loads.
    redirect("/reset-password");
  }

  // ⭐ No code — check if a session already exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ResetLayout>
        <ResetPasswordForm initialError="no_session" />
      </ResetLayout>
    );
  }

  // ⭐ Session exists → show the form
  return (
    <ResetLayout>
      <ResetPasswordForm />
    </ResetLayout>
  );
}

function ResetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[130px]" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense
            fallback={<div className="text-white text-center">Loading…</div>}
          >
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
