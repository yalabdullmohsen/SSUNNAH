/**
 * عقد مفاتيح تخزين المصحف الحي (`/mushaf`) — مصدر حقيقة واحد للأسماء.
 * المفاتيح القديمة تُقرأ عبر migration ولا تُحذف مباشرة.
 */

/** آخر صفحة — SoT حي */
export const MUSHAF_LAST_PAGE_KEY = "lastPage";

/** فواصل المصحف الحي */
export const MUSHAF_BOOKMARKS_KEY = "myBookmarks";
export const MUSHAF_BOOKMARKS_MIGRATED_KEY = "myBookmarks:ayah-migrated-v1";

/** علامات الآيات — الكانونية */
export const MUSHAF_AYAH_MARKS_KEY = "ssunnah-mushaf-ayah-marks-v1";
/** legacy من VerifiedMushafReader */
export const MUSHAF_AYAH_MARKS_LEGACY_KEY = "majlisilm.mushaf.ayah-marks";

/** ختمة — tracker الرسمي للتقدم */
export const MUSHAF_KHATMAH_TRACKER_KEY = "majalis-khatmah-tracker-v1";
/** ختمة — خطط شخصية قديمة */
export const MUSHAF_KHATMAH_PLANS_LEGACY_KEY = "mj-quran-khatmah-v1";

/** إصدار عقد التخزين */
export const MUSHAF_PERSISTENCE_CONTRACT_VERSION = 1;
export const MUSHAF_PERSISTENCE_VERSION_KEY = "mj.mushaf-persistence.contract.v1";

/** نسخة احتياطية قبل hydrate تفضّل Preferences */
export const MUSHAF_HYDRATE_BACKUP_PREFIX = "mj.mushaf.pre-hydrate.";

/** مفاتيح المصحف التي تُزامَن إلى Capacitor Preferences */
export const MUSHAF_NATIVE_KEYS = [
  MUSHAF_LAST_PAGE_KEY,
  MUSHAF_BOOKMARKS_KEY,
  MUSHAF_BOOKMARKS_MIGRATED_KEY,
  MUSHAF_AYAH_MARKS_KEY,
  MUSHAF_KHATMAH_TRACKER_KEY,
] as const;

export type MushafNativeKey = (typeof MUSHAF_NATIVE_KEYS)[number];
