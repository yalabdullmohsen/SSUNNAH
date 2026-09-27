import type { WidgetThemeMode } from "./theme";

export const WIDGET_SNAPSHOT_VERSION = 1 as const;
export const WIDGET_APP_GROUP_ID = "group.com.yousef.majlisilm.widgets";
export const WIDGET_SNAPSHOT_KEY = "snapshot_v1";
export const WIDGET_PREFS_STORAGE_KEY = "sunnah.widgets.prefs.v1";

export type WidgetKind =
  | "prayer_times"
  | "next_prayer"
  | "daily_adhkar"
  | "daily_dua"
  | "quran_verse"
  | "resume_mushaf"
  | "learning"
  | "daily_motivation"
  | "prayer_tracking"
  | "smart";

export type WidgetRefreshMode = "timeline" | "on_open" | "manual";
export type WidgetLocale = "ar" | "en";

export type WidgetContentType =
  | "prayer"
  | "dhikr"
  | "dua"
  | "quran"
  | "lessons"
  | "motivation";

export type SunnahWidgetPrefs = {
  theme: WidgetThemeMode;
  refreshMode: WidgetRefreshMode;
  cityLabel: string;
  calculationMethod: string;
  contentTypes: WidgetContentType[];
  autoRotation: boolean;
  fontScale: number;
  locale: WidgetLocale;
  enabledKinds: WidgetKind[];
};

export type WidgetPrayerSlotSnap = {
  key: string;
  nameAr: string;
  nameEn?: string;
  time24: string;
  timeLabel: string;
};

export type WidgetPrayerSnap = {
  current: WidgetPrayerSlotSnap | null;
  next: WidgetPrayerSlotSnap | null;
  remainingMs: number;
  remainingLabel: string;
  city: string;
  hijri: string | null;
  gregorian: string;
  method: string;
};

export type WidgetTextSnap = {
  text: string;
  source?: string;
  category?: string;
  href: string;
};

export type WidgetAyahSnap = {
  text: string;
  surahName: string;
  surah: number;
  ayah: number;
  href: string;
  mode: "daily" | "last_read" | "approved_collection";
};

export type WidgetMushafResumeSnap = {
  surah: number;
  ayah: number;
  surahName: string;
  label: string;
  href: string;
};

export type WidgetLessonSnap = {
  title: string;
  subtitle?: string;
  href: string;
  kind: "latest" | "upcoming" | "saved" | "continue";
};

export type WidgetStreakSnap = {
  completedToday: number;
  totalToday: number;
  streakDays: number;
  href: string;
};

export type SunnahWidgetSnapshot = {
  version: typeof WIDGET_SNAPSHOT_VERSION;
  updatedAt: string;
  locale: WidgetLocale;
  prayer?: WidgetPrayerSnap;
  adhkar?: WidgetTextSnap;
  dua?: WidgetTextSnap;
  ayah?: WidgetAyahSnap;
  mushafResume?: WidgetMushafResumeSnap;
  lesson?: WidgetLessonSnap;
  motivation?: WidgetTextSnap;
  streak?: WidgetStreakSnap;
  smartKinds?: WidgetContentType[];
};

export const DEFAULT_WIDGET_PREFS: SunnahWidgetPrefs = {
  theme: "system",
  refreshMode: "timeline",
  cityLabel: "",
  calculationMethod: "",
  contentTypes: ["prayer", "dhikr", "dua", "quran"],
  autoRotation: true,
  fontScale: 1,
  locale: "ar",
  enabledKinds: ["next_prayer", "prayer_times", "daily_adhkar", "daily_dua", "resume_mushaf"],
};
