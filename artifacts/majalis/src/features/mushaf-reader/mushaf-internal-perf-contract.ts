/**
 * عقد أداء المصحف الداخلي — PR-1 توثيق/قفل.
 * لا يُستورد من main/App (خارج Initial Bundle).
 */

/** علامات جلسة التقليب في mushaf-turn-telemetry.ts */
export const MUSHAF_TURN_MARKS = [
  "touchStart",
  "firstPageMovement",
  "pointerUp",
  "pageDataReady",
  "fontReady",
  "layoutStart",
  "layoutComplete",
  "transitionStart",
  "visualTransitionEnd",
  "transitionSettled",
  "activePageCommit",
  "productUnlock",
] as const;

export type MushafTurnMarkName = (typeof MUSHAF_TURN_MARKS)[number];

/** مقاييس WAVE6 — تُصدَّر يدويًا عند تفعيل التليمتري فقط */
export const MUSHAF_WAVE6_METRIC_KEYS = [
  "touchToFirstTranslateMs",
  "pointerUpToTransitionStartMs",
  "transitionDurationMs",
  "transitionEndToCommitMs",
  "commitToUnlockMs",
  "totalTurnMs",
  "fontWaitMs",
  "layoutWaitMs",
  "rejectedGestureCount",
  "selectionMeasureCount",
  "frameDropEstimate",
  "fontCacheHit",
  "pageDataCacheHit",
  "pointerUpToVisualSettleMs",
  "visualSettleToUnlockMs",
  "renderCount",
] as const;

/** سقف prefetch بعيد (±2) — لا تحميل 604 */
export const MUSHAF_FAR_FONT_PREFETCH_CAP = 4;

export const MUSHAF_RENDER_CACHE_MAX_ENTRIES = 16;
export const MUSHAF_LAYOUT_CACHE_MAX_ENTRIES = 12;

/** ميزانيات مقفولة — لا تُرفع في هذا البرنامج */
export const MUSHAF_INTERNAL_BUDGETS_LOCKED = {
  entryJsGzipBytes: 120 * 1024 + 320,
  /** soft: مسار MushafReaderPage lazy */
  mushafReaderPageJsGzipBytesSoft: 40 * 1024,
} as const;

export const MUSHAF_INTERNAL_NOT_MEASURED = [
  "tapToRouteStartMs",
  "routeChunkLoadMs",
  "fontReadyMs",
  "firstPageRenderMs",
  "firstInteractiveFrameMs",
  "touchToMoveMsDevice",
  "swipeFpsDevice",
  "pageCommitLatencyMsDevice",
  "transitionSettledMsDevice",
  "memoryAfter25TurnsMb",
  "memoryAfter100TurnsMb",
  "darkModeMeasure",
  "reducedMotionTransitionMs",
  "physicalIphoneIpad",
] as const;

/** صفحات العينة المعتمدة لسلامة الهندسة */
export const MUSHAF_GEOMETRY_SAMPLE_PAGES = [1, 2, 5, 100, 221, 459, 604] as const;
