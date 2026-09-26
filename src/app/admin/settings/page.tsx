import { createClient } from "@/lib/supabase/server";
import { Sparkles, Settings2, Zap } from "lucide-react";
import SettingsForm from "./settings-form";
import FadeIn from "@/components/animation/fade-in";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .order("category")
    .order("key");

  const settingCount = settings?.length || 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative p-6 md:p-8 space-y-6 md:space-y-8 max-w-4xl">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <FadeIn y={20}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Configuration
              </span>
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Site Settings
            </h1>

            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              Manage your store details. Changes are visible on the storefront
              immediately.
            </p>

            <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                <span className="text-white font-medium tabular-nums">
                  {settingCount}
                </span>{" "}
                settings
              </span>
              <span className="w-6 h-px bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Live on save
              </span>
            </div>
          </div>
        </FadeIn>

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <FadeIn y={20} delay={0.1}>
          <SettingsForm initialSettings={settings || []} />
        </FadeIn>
      </div>
    </div>
  );
}
