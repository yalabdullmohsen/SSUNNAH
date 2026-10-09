/**
 * مخزون الويدجت اليومي: آيات منتقاة + أحاديث صحيحة موثّقة (مُولَّد من بيانات المشروع —
 * scripts/build-widget-daily-pool.mjs) يُضاف إليه المخزون اليدوي القديم احتياطًا.
 * يُستورد من ناشر الويدجت فقط (لا يدخل حزمة الصفحات).
 */
import pool from "../data/widget-daily-pool.generated.json";
import {
  DAILY_AYAH_POOL,
  DAILY_HADITH_POOL,
  getDayIndex,
  type DailyAyahEntry,
  type DailyHadithEntry,
} from "./daily-content";
import { filterForPublicZone, formatPublicGrade } from "./content-display-zones";
import { isWidgetReadyHadith, pickByDay } from "./widget-daily-pick";

const GENERATED_AYAHS: DailyAyahEntry[] = (pool.ayahs ?? []).map((a) => ({
  id: a.id,
  text: a.text,
  surah: a.surah,
  ayahNumber: a.ayahNumber,
  reference: a.reference,
  meaning: "",
}));

const GENERATED_HADITHS: DailyHadithEntry[] = filterForPublicZone(
  (pool.hadiths ?? [])
  .map((h) => ({
    id: h.id,
    text: h.text,
    narrator: h.narrator,
    source: h.source,
    grade: h.grade,
    meaning: h.meaning || "",
  }))
  .filter(isWidgetReadyHadith),
  "dailyReminder",
);

export const WIDGET_AYAH_POOL: DailyAyahEntry[] = [...GENERATED_AYAHS, ...DAILY_AYAH_POOL];
export const WIDGET_HADITH_POOL: DailyHadithEntry[] = [...GENERATED_HADITHS, ...DAILY_HADITH_POOL];

/** أقصى عدد كلمات لآية ودجت الآية: تظهر كاملة بلا اقتطاع في المتوسط. */
export const WIDGET_AYAH_MAX_WORDS = 10;

/** آيات قصيرة من المخزون المُولَّد فقط (نص quran-v2 حرفيًا)؛ لا مخزون يدوي قديم. */
export const WIDGET_SHORT_AYAH_POOL: DailyAyahEntry[] = GENERATED_AYAHS.filter(
  (a) => a.text.trim().split(/\s+/).length <= WIDGET_AYAH_MAX_WORDS,
);

export function getWidgetShortAyah(date = new Date()): DailyAyahEntry | undefined {
  return pickByDay(WIDGET_SHORT_AYAH_POOL, getDayIndex(date));
}

export function getWidgetDailyAyah(date = new Date()): DailyAyahEntry {
  return pickByDay(WIDGET_AYAH_POOL, getDayIndex(date)) ?? DAILY_AYAH_POOL[0]!;
}

export function getWidgetDailyHadith(date = new Date()): DailyHadithEntry {
  return pickByDay(WIDGET_HADITH_POOL, getDayIndex(date)) ?? DAILY_HADITH_POOL[0]!;
}

/** سطر النسبة تحت الحديث: الراوي · المصدر · الحكم — لا يُعرض حديث بلا هذه الثلاثة في الويدجت. */
export function formatHadithAttribution(h: Pick<DailyHadithEntry, "narrator" | "source" | "grade">): string {
  return [h.narrator, h.source, formatPublicGrade(h.grade)].filter((x): x is string => Boolean(x && x.trim())).join(" · ");
}
