/**
 * Quran reader typeface cycle (`toggleFont`) — الخيارات الثلاثة تستعمل خطوط نظام الخطوط فقط:
 *   uthmani → --font-quran (Amiri Quran) · amiri → --font-text (Amiri) · naskh → --font-ui (IBM Plex Sans Arabic)
 * Mapped onto existing `QuranFontId` so Settings stay in sync.
 */
import type { QuranFontId } from "@/hooks/useQuranPreferences";

export type QuranFontOption = {
  id: QuranFontId;
  /** RN sketch display name */
  label: string;
  /** Short Arabic label for chips */
  labelAr: string;
  /** CSS font-family value — متغيّر من font-system.css */
  stack: string;
};

/** Cycle order matches the RN sketch. */
export const FONT_OPTIONS: readonly QuranFontOption[] = [
  {
    id: "amiri",
    label: "Amiri",
    labelAr: "أميري",
    stack: "var(--font-text)",
  },
  {
    id: "naskh",
    label: "IBM Plex Sans Arabic",
    labelAr: "الواجهة",
    stack: "var(--font-ui)",
  },
  {
    id: "uthmani",
    label: "Amiri Quran",
    labelAr: "قرآني",
    stack: "var(--font-quran)",
  },
] as const;

export function quranFontOption(fontId: QuranFontId): QuranFontOption {
  return FONT_OPTIONS.find((o) => o.id === fontId) ?? FONT_OPTIONS[0];
}

export function quranFontStack(fontId: QuranFontId): string {
  return quranFontOption(fontId).stack;
}

/** RN `toggleFont` — advance to the next option in FONT_OPTIONS. */
export function nextQuranFontId(current: QuranFontId): QuranFontId {
  const currentIndex = FONT_OPTIONS.findIndex((o) => o.id === current);
  const nextIndex = (currentIndex + 1) % FONT_OPTIONS.length;
  return FONT_OPTIONS[nextIndex].id;
}
