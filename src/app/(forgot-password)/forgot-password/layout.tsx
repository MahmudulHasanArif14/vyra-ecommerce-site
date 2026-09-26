import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | VYRA Accessories",
  description: "Reset your VYRA account password",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#c9a46c]/[0.06] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#080808_75%)]" />
      </div>

      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  );
}
