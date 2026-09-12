import { createClient } from "@/lib/supabase/server";

export type SettingsMap = Record<string, string>;

/**
 * Fetch all site settings as a flat map.
 * NOT cached — reads on every request.
 * Settings change infrequently but need to always be fresh.
 */
export async function getSettings(): Promise<SettingsMap> {
  const supabase = await createClient();
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
}

/**
 * Get a single setting with fallback
 */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}

/**
 * Type helpers
 */
export function getBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export function getNumber(value: string | undefined, fallback = 0): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}
