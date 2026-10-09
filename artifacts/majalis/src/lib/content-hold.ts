/**
 * إيقاف العرض (content hold): يخفي معرّفات محدّدة من مسارات القراءة العامة دون حذف شيء.
 * المصدر الوحيد: content/content-hold.json — أزل السطر لإعادة العرض.
 */
import holdData from "../../content/content-hold.json";

export type ContentHold = { id: string; reason: string; since: string };

export const CONTENT_HOLDS: readonly ContentHold[] = holdData.holds;

const HELD_IDS: ReadonlySet<string> = new Set(CONTENT_HOLDS.map((h) => h.id));

export function isHeld(id?: string | null): boolean {
  return Boolean(id) && HELD_IDS.has(id as string);
}

export function filterHeld<T>(items: readonly T[], idOf: (item: T) => string | undefined): T[] {
  return items.filter((item) => !isHeld(idOf(item)));
}
