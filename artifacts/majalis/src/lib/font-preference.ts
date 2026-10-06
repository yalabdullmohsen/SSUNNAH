export type FontPreference = "default" | "naskh";

export const FONT_STORAGE_KEY = "majalis-font-preference-v2";

/* ملاحظة: خط الواجهة الموحَّد هو --font-ui (Almarai)؛ الخياران لا يفرّقان بصريًا.
   الخياران محفوظان لتوافق الإعداد القديم ولا يفرّقان بصريًا. */
export const FONT_OPTIONS: {
  id: FontPreference;
  label: string;
  description: string;
}[] = [
  { id: "naskh", label: "نسخ", description: "خط الواجهة الموحَّد (افتراضي)" },
  { id: "default", label: "نسخ", description: "خط الواجهة الموحَّد" },
];

export function isFontPreference(value: string | null | undefined): value is FontPreference {
  return value === "default" || value === "naskh";
}

export function readFontPreference(): FontPreference {
  if (typeof window === "undefined") return "naskh";
  const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
  return isFontPreference(stored) ? stored : "naskh";
}

export function writeFontPreference(preference: FontPreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FONT_STORAGE_KEY, preference);
  document.documentElement.dataset.font = preference;
}

export function applyFontPreference(preference: FontPreference) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.font = preference;
}
