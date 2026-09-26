"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

type Setting = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  category: string;
  description: string | null;
};

const CATEGORY_META: Record<
  string,
  { label: string; accent: "cyan" | "blue" | "purple" | "green" | "amber" }
> = {
  general: { label: "General", accent: "cyan" },
  shipping: { label: "Shipping & Delivery", accent: "blue" },
  social: { label: "Social Links", accent: "purple" },
  seo: { label: "SEO", accent: "green" },
};

const ACCENT_COLORS = {
  cyan: { dot: "bg-cyan-400", border: "border-cyan-500/30" },
  blue: { dot: "bg-blue-400", border: "border-blue-500/30" },
  purple: { dot: "bg-purple-400", border: "border-purple-500/30" },
  green: { dot: "bg-green-400", border: "border-green-500/30" },
  amber: { dot: "bg-amber-400", border: "border-amber-500/30" },
};

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: Setting[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const initialValues = initialSettings.reduce<Record<string, string>>(
    (acc, s) => {
      acc[s.key] = s.value ?? "";
      return acc;
    },
    {},
  );

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: initialValues,
  });

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    const result = await updateSettings(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Settings saved");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const byCategory = initialSettings.reduce<Record<string, Setting[]>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {},
  );

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition";
  const labelClass =
    "block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {Object.entries(byCategory).map(([category, settings]) => {
        const meta = CATEGORY_META[category] || {
          label: category,
          accent: "cyan" as const,
        };
        const accent = ACCENT_COLORS[meta.accent];

        return (
          <div
            key={category}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 transition-all duration-300 hover:border-white/15"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <span
                className={`w-2 h-2 rounded-full ${accent.dot} shadow-[0_0_8px_currentColor]`}
              />
              <h2 className="text-lg font-bold text-white">{meta.label}</h2>
            </div>

            {/* Fields */}
            <div className="space-y-5">
              {settings.map((setting) => (
                <div key={setting.key}>
                  <label className={labelClass}>
                    {formatLabel(setting.key)}
                  </label>

                  {/* Boolean */}
                  {setting.type === "boolean" ? (
                    <select
                      {...register(setting.key)}
                      className={`${inputClass} bg-[#0f0f0f]`}
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : setting.type === "number" ? (
                    <input
                      type="number"
                      {...register(setting.key)}
                      className={`${inputClass} tabular-nums`}
                    />
                  ) : setting.key.includes("color") ? (
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        {...register(setting.key)}
                        className="w-12 h-12 rounded-lg cursor-pointer border border-white/10 bg-transparent shrink-0"
                      />
                      <input
                        {...register(setting.key)}
                        className={`${inputClass} flex-1 font-mono uppercase`}
                      />
                    </div>
                  ) : setting.key.includes("description") ||
                    setting.key.includes("text") ? (
                    <textarea
                      {...register(setting.key)}
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  ) : (
                    <input {...register(setting.key)} className={inputClass} />
                  )}

                  {setting.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ============================================================ */}
      {/* STICKY SAVE BAR */}
      {/* ============================================================ */}
      <div className="sticky bottom-4 z-10">
        <div className="bg-[#0f0f0f]/95 backdrop-blur border border-white/10 rounded-2xl p-4 flex justify-between items-center gap-4 flex-wrap shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <p className="text-xs md:text-sm text-gray-500">
            Changes go live immediately across the storefront.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium flex items-center gap-2 transition-all duration-300 ${
              justSaved
                ? "bg-green-500 text-white"
                : "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                SAVING...
              </>
            ) : justSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                SAVED
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                SAVE SETTINGS
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function formatLabel(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
