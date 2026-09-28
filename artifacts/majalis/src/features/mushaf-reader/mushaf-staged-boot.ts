/**
 * مراحل إقلاع المصحف — القراءة أولًا، ثم الطبقات الاختيارية.
 * لا يُستورد من main/Home.
 */

export const MUSHAF_BOOT_STAGES = [
  "shell",
  "page",
  "font",
  "reading",
  "bookmarks",
  "audio",
  "search",
  "tafsir",
  "memorization",
] as const;

export type MushafBootStage = (typeof MUSHAF_BOOT_STAGES)[number];

/** ترتيب الأولوية — القراءة قبل أي نظام اختياري */
export const MUSHAF_BOOT_STAGE_ORDER: Readonly<Record<MushafBootStage, number>> = {
  shell: 1,
  page: 2,
  font: 3,
  reading: 4,
  bookmarks: 5,
  audio: 6,
  search: 7,
  tafsir: 8,
  memorization: 9,
};

/**
 * ميزانيات مسار المصحف (توثيق + بوابة).
 * لا تُرفع دون دليل قياس جديد.
 */
export const MUSHAF_STAGED_BUDGETS = {
  /** soft — JS lazy لمسار MushafReaderPage */
  mushafReaderPageJsGzipBytesSoft: 40 * 1024,
  /** soft — CSS المرتبط بمسار المصحف */
  mushafReaderPageCssGzipBytesSoft: 32 * 1024,
  /** entry يبقى مقفولًا عبر test:bundle-budget */
  entryJsGzipBytesLocked: 120 * 1024 + 320,
} as const;

/** أنظمة اختيارية يجب ألا تُحمَّل بشكل ثابت في NewMushafReader */
export const MUSHAF_OPTIONAL_LAZY_MODULES = [
  "MushafSearchSheet",
  "MushafTafsirSheet",
  "QuranAudioPlayer",
  "MushafBookmarkComposer",
  "MushafPageBookmarkSheet",
  "MushafBookmarkMarkers",
] as const;
