import type { WidgetKind } from "./types";

/** مسارات فتح الودجت — متوافقة مع native-deep-link + إشعارات سُنّة. */
export const WIDGET_DEEP_LINKS: Record<WidgetKind, string> = {
  prayer_times: "/prayer-times",
  next_prayer: "/prayer-times",
  daily_adhkar: "/adhkar",
  daily_dua: "/duas",
  quran_verse: "/mushaf",
  resume_mushaf: "/mushaf",
  learning: "/lessons",
  daily_motivation: "/fawaid",
  prayer_tracking: "/prayer-times",
  smart: "/widget-settings",
};

export function widgetHttpsUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://www.ssunnah.com${p}`;
}

export function widgetKindDeepLink(kind: WidgetKind): string {
  return WIDGET_DEEP_LINKS[kind];
}
