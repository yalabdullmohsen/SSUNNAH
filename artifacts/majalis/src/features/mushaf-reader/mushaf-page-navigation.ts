/**
 * تنقّل صفحات المصحف — مصدر واحد للدلالة (+1 التالية / −1 السابقة).
 * لا يغيّر ترقيم الصفحات ولا نصّ المصحف — منطق الالتزام فقط.
 */
import {
  clampMushafPage,
  MUSHAF_PAGE_MAX,
  MUSHAF_PAGE_MIN,
} from "@/lib/quran-last-page";

export const MUSHAF_NAV_LABEL = {
  next: "الصفحة التالية",
  previous: "الصفحة السابقة",
  nextShort: "التالية",
  previousShort: "السابقة",
} as const;

/** اتجاه الالتزام بعد سحب أفقي (dx بالبكسل، يمين الشاشة موجب) */
export function mushafSwipePageDelta(dx: number): 1 | -1 | 0 {
  if (!(Number.isFinite(dx) && dx !== 0)) return 0;
  /* سحب لليمين يكشف لوحة next في المسار LTR — صفحة +1 */
  return dx > 0 ? 1 : -1;
}

/**
 * نقر حافة الشاشة — مصحف مجلّد يمينًا: التقليب من اليسار إلى التالية.
 * relX: 0 يسار … 1 يمين (إحداثيات الشاشة).
 */
export function mushafEdgeTapPageDelta(relX: number): 1 | -1 | 0 {
  if (!Number.isFinite(relX)) return 0;
  if (relX <= 0.15) return 1;
  if (relX >= 0.85) return -1;
  return 0;
}

/** لوحة مفاتيح — مصحف: يسار/PageDown = التالية؛ يمين/PageUp = السابقة */
export function mushafKeyboardPageDelta(key: string): 1 | -1 | 0 {
  if (key === "ArrowLeft" || key === "PageDown") return 1;
  if (key === "ArrowRight" || key === "PageUp") return -1;
  return 0;
}

export function resolveNextMushafPage(page: number): number | null {
  const n = clampMushafPage(page);
  if (n >= MUSHAF_PAGE_MAX) return null;
  return n + 1;
}

export function resolvePreviousMushafPage(page: number): number | null {
  const n = clampMushafPage(page);
  if (n <= MUSHAF_PAGE_MIN) return null;
  return n - 1;
}

export function canGoToNextMushafPage(page: number): boolean {
  return resolveNextMushafPage(page) != null;
}

export function canGoToPreviousMushafPage(page: number): boolean {
  return resolvePreviousMushafPage(page) != null;
}

export function goToNextMushafPage(
  page: number,
  go: (next: number) => void,
): boolean {
  const next = resolveNextMushafPage(page);
  if (next == null) return false;
  go(next);
  return true;
}

export function goToPreviousMushafPage(
  page: number,
  go: (next: number) => void,
): boolean {
  const prev = resolvePreviousMushafPage(page);
  if (prev == null) return false;
  go(prev);
  return true;
}

export function goToMushafPageDelta(
  page: number,
  delta: 1 | -1 | 0,
  go: (next: number) => void,
): boolean {
  if (delta === 1) return goToNextMushafPage(page, go);
  if (delta === -1) return goToPreviousMushafPage(page, go);
  return false;
}
