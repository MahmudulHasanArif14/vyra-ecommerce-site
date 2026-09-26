import { getSettings, getBool } from "@/lib/settings";
import { Sparkles } from "lucide-react";

export default async function AnnouncementBar() {
  const settings = await getSettings();

  if (!getBool(settings.announcement_enabled, true)) return null;

  const text = settings.announcement_text || "";
  if (!text) return null;

  const bg = settings.announcement_bg_color || "bg-[#0a0a0a]";
  const color = settings.announcement_text_color || "#ffffff";

  return (
    <div
      className="relative text-[10px] md:text-xs py-2.5 px-4 text-center tracking-[0.2em] uppercase font-medium"
      style={{ backgroundColor: bg, color }}
      role="banner"
    >
      {/* Subtle animated shine */}
      <span className="inline-flex items-center gap-2">
        <Sparkles
          className="w-3 h-3 shrink-0 opacity-60 animate-pulse"
          aria-hidden="true"
        />
        <span className="truncate max-w-[80vw]">{text}</span>
      </span>

      {/* Bottom fade edge for depth */}
      <span
        className="absolute inset-x-0 bottom-0 h-px opacity-20 pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
