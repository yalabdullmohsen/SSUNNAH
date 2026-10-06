import { getHijriDateString } from "@/lib/hijri-utils";
import { toArabicIndicDigits } from "@/lib/numerals";

/** تحية بحسب وقت الجهاز. */
export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  return h >= 4 && h < 12 ? "صباح الخير" : "مساء الخير";
}

/** «٢٣ ربيع الآخر ١٤٤٨ هـ · ٦ أكتوبر ٢٠٢٦ م» */
export function dualDateLabel(date = new Date()): string {
  const g = new Intl.DateTimeFormat("ar-u-nu-arab", { day: "numeric", month: "long", year: "numeric" }).format(date);
  let hijri: string;
  try {
    hijri = getHijriDateString();
  } catch {
    hijri = "";
  }
  return hijri ? `${toArabicIndicDigits(hijri)} · ${g} م` : `${g} م`;
}

/** رقم صفحة المصحف من مسار «/mushaf/page/N». */
export function pageFromMushafRoute(route: string): number | null {
  const m = route.match(/\/mushaf\/page\/(\d+)/);
  return m ? Number.parseInt(m[1], 10) : null;
}
