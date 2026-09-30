/**
 * آلة حالة تقليب المصحف — توثيق + قيم data-attribute.
 * القفل البصري (`useMushafPager.locking`) مستقل عن قفل المنتج (`pageTurnLockRef`).
 *
 * IDLE → DRAGGING → SETTLING → COMMITTING
 *   → WAITING_FOR_FONT | WAITING_FOR_LAYOUT → READY
 *   → RECOVERING (safety timeout / unusable recover)
 */

export const MUSHAF_PAGE_TURN_PHASES = [
  "IDLE",
  "DRAGGING",
  "SETTLING",
  "COMMITTING",
  "WAITING_FOR_FONT",
  "WAITING_FOR_LAYOUT",
  "READY",
  "RECOVERING",
] as const;

export type MushafPageTurnPhase = (typeof MUSHAF_PAGE_TURN_PHASES)[number];

/**
 * قفل بصري: يمنع إيماءة متوازية أثناء transition فقط.
 * ينتهي عند transitionend (أو إلغاء السحب).
 */
export const MUSHAF_VISUAL_LOCK_OWNER = "useMushafPager.locking" as const;

/**
 * قفل منتج: يحمي commit الصفحة + تجميد الأسفل حتى font+layout+displayView.
 * لا يمنع تسليح إيماءة لاحقة واحدة (queued intent) بعد وصول React للصفحة المستهدفة.
 */
export const MUSHAF_PRODUCT_LOCK_OWNER = "NewMushafReader.pageTurnLockRef" as const;

/** نية تقليب معلّقة واحدة كحد أقصى أثناء انتظار الجاهزية. */
export const MUSHAF_QUEUED_TURN_INTENT_MAX = 1;

export function resolvePageTurnPhase(input: {
  productLocked: boolean;
  pendingPage: number | null;
  currentPage: number;
  fontReady: boolean;
  layoutReady: boolean;
  visualSettling?: boolean;
  dragging?: boolean;
  recovering?: boolean;
}): MushafPageTurnPhase {
  if (input.recovering) return "RECOVERING";
  if (input.dragging) return "DRAGGING";
  if (input.visualSettling) return "SETTLING";
  if (!input.productLocked || input.pendingPage == null) {
    return input.fontReady && input.layoutReady ? "READY" : "IDLE";
  }
  if (input.currentPage !== input.pendingPage) return "COMMITTING";
  if (!input.fontReady) return "WAITING_FOR_FONT";
  if (!input.layoutReady) return "WAITING_FOR_LAYOUT";
  return "READY";
}
