"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Setting = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  category: string;
  description: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  shipping: "Shipping & Delivery",
  social: "Social Links",
  seo: "SEO",
};

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: Setting[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build initial form values
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
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  // Group by category
  const byCategory = initialSettings.reduce<Record<string, Setting[]>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {},
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {Object.entries(byCategory).map(([category, settings]) => (
        <div
          key={category}
          className="bg-white p-6 rounded-lg border space-y-4"
        >
          <h2 className="font-bold text-lg border-b pb-2">
            {CATEGORY_LABELS[category] || category}
          </h2>

          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium mb-1">
                  {formatLabel(setting.key)}
                </label>

                {setting.type === "boolean" ? (
                  <select
                    {...register(setting.key)}
                    className="w-full border p-3 rounded-md bg-white"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : setting.type === "number" ? (
                  <input
                    type="number"
                    {...register(setting.key)}
                    className="w-full border p-3 rounded-md"
                  />
                ) : setting.key.includes("color") ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      {...register(setting.key)}
                      className="w-12 h-12 rounded-md cursor-pointer border"
                    />
                    <input
                      {...register(setting.key)}
                      className="flex-1 border p-3 rounded-md font-mono text-sm"
                    />
                  </div>
                ) : setting.key.includes("description") ||
                  setting.key.includes("text") ? (
                  <textarea
                    {...register(setting.key)}
                    rows={3}
                    className="w-full border p-3 rounded-md"
                  />
                ) : (
                  <input
                    {...register(setting.key)}
                    className="w-full border p-3 rounded-md"
                  />
                )}

                {setting.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {setting.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 bg-white border p-4 rounded-lg shadow-lg flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Changes go live immediately across the storefront.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white px-8 py-3 rounded-md text-sm tracking-widest hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSubmitting ? "SAVING..." : "SAVE SETTINGS"}
        </button>
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
