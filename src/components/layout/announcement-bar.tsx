import { getSettings, getBool } from "@/lib/settings";

export default async function AnnouncementBar() {
  const settings = await getSettings();

  if (!getBool(settings.announcement_enabled, true)) return null;

  const text = settings.announcement_text || "";
  if (!text) return null;

  const bg = settings.announcement_bg_color || "#000000";
  const color = settings.announcement_text_color || "#ffffff";

  return (
    <div
      className="text-xs py-2 text-center tracking-widest"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </div>
  );
}
