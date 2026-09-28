/**
 * مساحة مشتركة محايدة بين القارئ الحي (`mushaf-reader`) والقارئ المؤرشف (`mushaf-madinah`).
 * لا تستورد من `mushaf-madinah` هنا — الاتجاه الوحيد: madinah → shared (إعادة تصدير).
 */
export * from "./layout-bands";
export * from "./mushaf-page-for-ayah";
export * from "./mushaf-audio-clock-store";
export * from "./mushaf-ayah-sync-store";
export * from "./useQpcPageFont";
export * from "./useMushafResourceGate";
export { prefetchAdjacentPageAudio } from "./prefetch-adjacent-audio";
