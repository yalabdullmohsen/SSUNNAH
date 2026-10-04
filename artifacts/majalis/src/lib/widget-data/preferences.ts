import { readLocalJson, writeLocalJson, isPlainObject } from "@/lib/safe-json";
import type { WidgetPrivacyDisplayLevel } from "./privacy";
import { WIDGET_PREFERENCE_PRECEDENCE } from "./types";

export const WIDGET_PREFERENCES_KEY = "sunnah-widget-preferences-v1";

export type WidgetCalendarMode = "hijri" | "gregorian" | "dual";
export type WidgetPrayerDisplayMode = "current" | "next" | "previous" | "all";
export type WidgetAdhkarCategoryPref = "morning" | "evening" | "timeAware" | "rotating";
export type WidgetAyahMode = "CURATED_ROTATION" | "USER_SELECTED" | "BOOKMARK_SELECTED";

export type WidgetPreferences = {
  calendarMode: WidgetCalendarMode;
  numeralStyle: "عربي" | "إنجليزي";
  prayerDisplayMode: WidgetPrayerDisplayMode;
  showLocationLabel: boolean;
  showHijriDate: boolean;
  showGregorianDate: boolean;
  countdownMode: "live" | "static";
  contentSourceVisibility: boolean;
  widgetAppearance: "fullColor" | "light" | "dark";
  preferredAdhkarCategory: WidgetAdhkarCategoryPref;
  selectedMushafBookmarkId: string | null;
  selectedCustomContentId: string | null;
  privacyDisplayLevel: WidgetPrivacyDisplayLevel;
  ayahWidgetMode: WidgetAyahMode;
};

export const DEFAULT_WIDGET_PREFERENCES: WidgetPreferences = {
  calendarMode: "hijri",
  numeralStyle: "عربي",
  prayerDisplayMode: "next",
  showLocationLabel: true,
  showHijriDate: true,
  showGregorianDate: false,
  countdownMode: "live",
  contentSourceVisibility: true,
  widgetAppearance: "fullColor",
  preferredAdhkarCategory: "timeAware",
  selectedMushafBookmarkId: null,
  selectedCustomContentId: null,
  privacyDisplayLevel: "standard",
  ayahWidgetMode: "CURATED_ROTATION",
};

function isPrefs(v: unknown): v is WidgetPreferences {
  return isPlainObject(v) && typeof v.calendarMode === "string";
}

export function loadWidgetPreferences(): WidgetPreferences {
  const stored = readLocalJson<WidgetPreferences>(WIDGET_PREFERENCES_KEY, DEFAULT_WIDGET_PREFERENCES, isPrefs);
  return { ...DEFAULT_WIDGET_PREFERENCES, ...stored };
}

export function saveWidgetPreferences(next: Partial<WidgetPreferences>): WidgetPreferences {
  const merged = { ...loadWidgetPreferences(), ...next };
  writeLocalJson(WIDGET_PREFERENCES_KEY, merged);
  return merged;
}

export function widgetPreferencePrecedence(): readonly string[] {
  return WIDGET_PREFERENCE_PRECEDENCE;
}
