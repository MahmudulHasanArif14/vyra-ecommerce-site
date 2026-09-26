import { requireAdmin } from "@/lib/auth/admin";
import AdminSidebar from "./admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Ambient glow behind everything */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[130px]" />
      </div>

      <div className="relative flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
