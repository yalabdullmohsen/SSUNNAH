import { DEFAULT_WIDGET_PREFS, WIDGET_PREFS_STORAGE_KEY, type SunnahWidgetPrefs } from "./types";

function clampFontScale(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(1.4, Math.max(0.85, Math.round(n * 100) / 100));
}

export function normalizeWidgetPrefs(input: unknown): SunnahWidgetPrefs {
  const base = { ...DEFAULT_WIDGET_PREFS };
  if (!input || typeof input !== "object") return base;
  const o = input as Partial<SunnahWidgetPrefs>;
  return {
    theme: o.theme === "light" || o.theme === "dark" || o.theme === "system" ? o.theme : base.theme,
    refreshMode:
      o.refreshMode === "timeline" || o.refreshMode === "on_open" || o.refreshMode === "manual"
        ? o.refreshMode
        : base.refreshMode,
    cityLabel: typeof o.cityLabel === "string" ? o.cityLabel.slice(0, 80) : base.cityLabel,
    calculationMethod:
      typeof o.calculationMethod === "string" ? o.calculationMethod.slice(0, 64) : base.calculationMethod,
    contentTypes: Array.isArray(o.contentTypes) ? (o.contentTypes as SunnahWidgetPrefs["contentTypes"]) : base.contentTypes,
    autoRotation: typeof o.autoRotation === "boolean" ? o.autoRotation : base.autoRotation,
    fontScale: clampFontScale(typeof o.fontScale === "number" ? o.fontScale : base.fontScale),
    locale: o.locale === "en" ? "en" : "ar",
    enabledKinds: Array.isArray(o.enabledKinds) && o.enabledKinds.length
      ? (o.enabledKinds as SunnahWidgetPrefs["enabledKinds"])
      : base.enabledKinds,
  };
}

export function readWidgetPrefs(): SunnahWidgetPrefs {
  if (typeof localStorage === "undefined") return { ...DEFAULT_WIDGET_PREFS };
  try {
    const raw = localStorage.getItem(WIDGET_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_WIDGET_PREFS };
    return normalizeWidgetPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_WIDGET_PREFS };
  }
}

export function writeWidgetPrefs(prefs: SunnahWidgetPrefs): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(WIDGET_PREFS_STORAGE_KEY, JSON.stringify(normalizeWidgetPrefs(prefs)));
}
