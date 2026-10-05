/**
 * ملكية أقفال المصحف — لا تخلط بينها في setState أو telemetry.
 *
 * | Kind | Owner | يمنع | لا يمنع |
 * |------|-------|------|---------|
 * | VISUAL_READINESS | stableView + canMountPage (صفحة `page` الحالية) | رسم QPC قبل خط+بيانات الصفحة النشطة | لمس الصفحة المعروضة إذا pagerSettled |
 * | INTERACTION_LOCK | pagerSettled + callbacks على PrefetchPage | تحديد آية / overlay أثناء سحب أو قفل منتج | prefetch خط ±2 بعيد (لا يدخل هنا) |
 * | SETTLE_LOCK | useMushafPager.locking + SETTLE_MS | إيماءة ثانية أثناء transition CSS | commit React / font هدف التقليب |
 * | AUDIO_STATE_LOCK | bottomStackFrozen + freezeStackMode | قفز ارتفاع الشريط السفلي أثناء القلب | تقليب الصفحة (PRODUCT_LOCK منفصل) |
 *
 * PRODUCT_LOCK (pageTurnLockRef) ينتظر font+layout للصفحة **المستهدفة** فقط —
 * جاهزية خط الجيران البعيد (±2 idle) لا تُدخل في finishPageTurn ولا edgesDisabled.
 */
import {
  MUSHAF_PRODUCT_LOCK_OWNER,
  MUSHAF_VISUAL_LOCK_OWNER,
} from "./mushaf-page-turn-phase";

export const MUSHAF_VISUAL_READINESS_OWNER =
  "NewMushafReader.stableView+useMushafResourceGate" as const;

export const MUSHAF_INTERACTION_LOCK_OWNER =
  "NewMushafReader.pagerSettled+PrefetchPage.selectionEnabled" as const;

export const MUSHAF_SETTLE_LOCK_OWNER = MUSHAF_VISUAL_LOCK_OWNER;

export const MUSHAF_AUDIO_STATE_LOCK_OWNER =
  "NewMushafReader.bottomStackFrozen+freezeStackMode" as const;

export const MUSHAF_LOCK_OWNERS = {
  VISUAL_READINESS: MUSHAF_VISUAL_READINESS_OWNER,
  INTERACTION_LOCK: MUSHAF_INTERACTION_LOCK_OWNER,
  SETTLE_LOCK: MUSHAF_SETTLE_LOCK_OWNER,
  AUDIO_STATE_LOCK: MUSHAF_AUDIO_STATE_LOCK_OWNER,
  PRODUCT_TURN: MUSHAF_PRODUCT_LOCK_OWNER,
} as const;

export type MushafLockKind = keyof typeof MUSHAF_LOCK_OWNERS;

/** prefetch خط بعيد (±2 idle) — خارج INTERACTION_LOCK و PRODUCT_LOCK */
export function isRemoteFontPrefetchOnly(pageNumber: number, activePage: number): boolean {
  return Math.abs(pageNumber - activePage) >= 2;
}
