import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";

export type SettingsMap = Record<string, string>;

/**
 * Fetch all site settings as a flat map.
 * Uses a cookie-free Supabase client so it can be safely cached.
 */
export const getSettings = unstable_cache(
  async (): Promise<SettingsMap> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error || !data) {
      console.error("[getSettings] error:", error);
      return {};
    }

    return data.reduce<SettingsMap>((acc, row) => {
      acc[row.key] = row.value ?? "";
      return acc;
    }, {});
  },
  ["site-settings"],
  {
    revalidate: 60,
    tags: ["settings"],
  },
);

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}

export function getBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export function getNumber(value: string | undefined, fallback = 0): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}
