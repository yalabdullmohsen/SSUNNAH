/**
 * قياسات تقليب المصحف — تُفعَّل في DEV أو localStorage mushaf-turn-telemetry=1.
 * لا تأثير على مسار الإنتاج عند التعطيل.
 * لا إرسال خارجي · لا PII · لا نص قرآن · لا بريد · لا user id.
 *
 * مقاييس الجلسة: touch→move، أزمنة الإطارات (worst/p95/p99)، dropped، hitch.
 * عدّادات العمر (lifetime): mounts/renders/fonts/geometry عبر الجلسة.
 * WAVE6: touchToFirstTranslate · commitToUnlock · rejectedGesture · selectionMeasure.
 */
import { mushafExperienceOnTurnMark } from "./mushaf-experience-perf";

type MushafTurnMark =
  | "touchStart"
  | "firstPageMovement"
  | "pointerUp"
  | "pageDataReady"
  | "fontReady"
  | "layoutStart"
  | "layoutComplete"
  | "transitionStart"
  | "visualTransitionEnd"
  | "transitionSettled"
  | "activePageCommit"
  | "productUnlock";

export type MushafFrameStats = {
  samples: number;
  fps: number;
  frameTimeMsAvg: number;
  frameTimeMsP95: number;
  frameTimeMsP99: number;
  frameTimeMsWorst: number;
  droppedFrames: number;
  hitchRatio: number;
  touchToMoveMs: number | null;
};

/** عقد WAVE6 — للتصدير اليدوي من DevTools عند التفعيل. */
export type MushafWave6TurnMetrics = {
  touchToFirstTranslateMs: number | null;
  pointerUpToTransitionStartMs: number | null;
  transitionDurationMs: number | null;
  transitionEndToCommitMs: number | null;
  commitToUnlockMs: number | null;
  totalTurnMs: number | null;
  fontWaitMs: number | null;
  layoutWaitMs: number | null;
  rejectedGestureCount: number;
  selectionMeasureCount: number;
  frameDropEstimate: number | null;
  fontCacheHit: number;
  pageDataCacheHit: number;
  /** Fluidity program — أدق من WAVE6 إن وُجدت العلامات */
  pointerUpToVisualSettleMs: number | null;
  visualSettleToUnlockMs: number | null;
  renderCount: number;
};

export type MushafPerfLifetime = {
  readerMountCount: number;
  pagerMountCount: number;
  pageRenderCount: number;
  fontLoadCount: number;
  geometryChangeCount: number;
  rejectedGestureCount: number;
  selectionMeasureCount: number;
};

type Session = {
  page: number;
  t0: number;
  marks: Partial<Record<MushafTurnMark, number>>;
  measureCount: number;
  renderCount: number;
  fontLoadCount: number;
  cacheHits: number;
  cacheMisses: number;
  rejectedGestureCount: number;
  selectionMeasureCount: number;
  frameDeltas: number[];
  sampling: boolean;
  rafId: number | null;
  lastFrameTs: number;
};

let session: Session | null = null;
let enabled = false;

const lifetime: MushafPerfLifetime = {
  readerMountCount: 0,
  pagerMountCount: 0,
  pageRenderCount: 0,
  fontLoadCount: 0,
  geometryChangeCount: 0,
  rejectedGestureCount: 0,
  selectionMeasureCount: 0,
};

const TARGET_FRAME_MS = 1000 / 60;
const HITCH_MS = 32;

function isTelemetryEnabledRaw(): boolean {
  return (
    import.meta.env?.DEV === true ||
    import.meta.env?.MODE === "development" ||
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("mushaf-turn-telemetry") === "1")
  );
}

/** هل التليمتري مفعّل الآن — الإنتاج الافتراضي false. */
export function isMushafTurnTelemetryEnabled(): boolean {
  return enabled && isTelemetryEnabledRaw();
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)] ?? 0;
}

function computeFrameStats(s: Session): MushafFrameStats {
  const deltas = s.frameDeltas.slice().sort((a, b) => a - b);
  const n = deltas.length;
  const sum = deltas.reduce((a, b) => a + b, 0);
  const avg = n > 0 ? sum / n : 0;
  const dropped = deltas.filter((d) => d > TARGET_FRAME_MS * 1.5).length;
  const hitches = deltas.filter((d) => d >= HITCH_MS).length;
  const touch =
    s.marks.firstPageMovement != null && s.marks.touchStart != null
      ? Math.max(0, s.marks.firstPageMovement - s.marks.touchStart)
      : s.marks.firstPageMovement ?? null;
  return {
    samples: n,
    fps: avg > 0 ? 1000 / avg : 0,
    frameTimeMsAvg: avg,
    frameTimeMsP95: percentile(deltas, 95),
    frameTimeMsP99: percentile(deltas, 99),
    frameTimeMsWorst: n > 0 ? deltas[n - 1]! : 0,
    droppedFrames: dropped,
    hitchRatio: n > 0 ? hitches / n : 0,
    touchToMoveMs: touch,
  };
}

function markDelta(
  marks: Partial<Record<MushafTurnMark, number>>,
  from: MushafTurnMark,
  to: MushafTurnMark,
): number | null {
  const a = marks[from];
  const b = marks[to];
  if (a == null || b == null) return null;
  return Math.max(0, b - a);
}

function computeWave6Metrics(s: Session, frames: MushafFrameStats): MushafWave6TurnMetrics {
  const m = s.marks;
  const visualEnd = m.visualTransitionEnd ?? m.transitionStart;
  const unlock = m.productUnlock ?? m.transitionSettled;
  return {
    touchToFirstTranslateMs: frames.touchToMoveMs,
    pointerUpToTransitionStartMs:
      markDelta(m, "pointerUp", "transitionStart") ??
      markDelta(m, "firstPageMovement", "transitionStart"),
    transitionDurationMs:
      markDelta(m, "pointerUp", "visualTransitionEnd") ??
      markDelta(m, "transitionStart", "transitionSettled"),
    transitionEndToCommitMs:
      markDelta(m, "visualTransitionEnd", "activePageCommit") ??
      markDelta(m, "transitionSettled", "activePageCommit"),
    commitToUnlockMs:
      markDelta(m, "activePageCommit", "productUnlock") ??
      markDelta(m, "activePageCommit", "transitionSettled"),
    totalTurnMs:
      m.touchStart != null && unlock != null
        ? Math.max(0, unlock - m.touchStart)
        : m.transitionSettled ?? null,
    fontWaitMs: markDelta(m, "transitionStart", "fontReady"),
    layoutWaitMs: markDelta(m, "fontReady", "layoutComplete"),
    rejectedGestureCount: s.rejectedGestureCount,
    selectionMeasureCount: s.selectionMeasureCount,
    frameDropEstimate: frames.samples > 0 ? frames.droppedFrames : null,
    fontCacheHit: s.cacheHits,
    pageDataCacheHit: s.cacheHits,
    pointerUpToVisualSettleMs:
      m.pointerUp != null && visualEnd != null ? Math.max(0, visualEnd - m.pointerUp) : null,
    visualSettleToUnlockMs:
      visualEnd != null && unlock != null ? Math.max(0, unlock - visualEnd) : null,
    renderCount: s.renderCount,
  };
}

export function enableMushafTurnTelemetry(on = true): void {
  enabled = on && isTelemetryEnabledRaw();
}

function ensureSession(page?: number): Session {
  const now = performance.now();
  if (!session) {
    session = {
      page: page ?? 0,
      t0: now,
      marks: {},
      measureCount: 0,
      renderCount: 0,
      fontLoadCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rejectedGestureCount: 0,
      selectionMeasureCount: 0,
      frameDeltas: [],
      sampling: false,
      rafId: null,
      lastFrameTs: 0,
    };
  }
  if (page != null) session.page = page;
  return session;
}

function sampleLoop(ts: number): void {
  if (!session?.sampling) return;
  if (session.lastFrameTs > 0) {
    const delta = ts - session.lastFrameTs;
    if (delta > 0 && delta < 250) session.frameDeltas.push(delta);
  }
  session.lastFrameTs = ts;
  session.rafId = requestAnimationFrame(sampleLoop);
}

export function mushafTurnMark(mark: MushafTurnMark, page?: number): void {
  mushafExperienceOnTurnMark(mark);
  if (!enabled) return;
  const now = performance.now();
  if (!session || (page != null && mark === "touchStart")) {
    if (session?.rafId != null) cancelAnimationFrame(session.rafId);
    session = {
      page: page ?? session?.page ?? 0,
      t0: now,
      marks: {},
      measureCount: 0,
      renderCount: 0,
      fontLoadCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rejectedGestureCount: 0,
      selectionMeasureCount: 0,
      frameDeltas: [],
      sampling: false,
      rafId: null,
      lastFrameTs: 0,
    };
  }
  const s = ensureSession(page);
  s.marks[mark] = Math.round(now - s.t0);
  if (mark === "firstPageMovement" || mark === "touchStart") {
    mushafTurnStartFrameSample();
  }
  if (mark === "transitionSettled" || mark === "activePageCommit") {
    mushafTurnStopFrameSample();
  }
}

export function mushafTurnStartFrameSample(): void {
  if (!enabled) return;
  const s = ensureSession();
  if (s.sampling) return;
  s.sampling = true;
  s.lastFrameTs = 0;
  s.rafId = requestAnimationFrame(sampleLoop);
}

export function mushafTurnStopFrameSample(): void {
  if (!session) return;
  session.sampling = false;
  if (session.rafId != null) {
    cancelAnimationFrame(session.rafId);
    session.rafId = null;
  }
}

export function mushafTurnInc(
  kind:
    | "measure"
    | "render"
    | "fontLoad"
    | "cacheHit"
    | "cacheMiss"
    | "rejectedGesture"
    | "selectionMeasure",
): void {
  if (kind === "rejectedGesture") {
    lifetime.rejectedGestureCount += 1;
    if (enabled && session) session.rejectedGestureCount += 1;
    return;
  }
  if (kind === "selectionMeasure") {
    lifetime.selectionMeasureCount += 1;
    if (enabled && session) session.selectionMeasureCount += 1;
    return;
  }
  if (!enabled || !session) return;
  if (kind === "measure") session.measureCount += 1;
  else if (kind === "render") session.renderCount += 1;
  else if (kind === "fontLoad") session.fontLoadCount += 1;
  else if (kind === "cacheHit") session.cacheHits += 1;
  else session.cacheMisses += 1;
}

/** عدّادات عمر القارئ — تُحدَّث حتى خارج جلسة القلب (للتحقق من mounts=1). */
export function mushafPerfInc(
  kind:
    | "readerMount"
    | "pagerMount"
    | "pageRender"
    | "fontLoad"
    | "geometryChange",
): void {
  if (kind === "readerMount") lifetime.readerMountCount += 1;
  else if (kind === "pagerMount") lifetime.pagerMountCount += 1;
  else if (kind === "pageRender") lifetime.pageRenderCount += 1;
  else if (kind === "fontLoad") {
    lifetime.fontLoadCount += 1;
    if (enabled && session) session.fontLoadCount += 1;
  } else lifetime.geometryChangeCount += 1;
}

export function mushafPerfSnapshot(): MushafPerfLifetime {
  return { ...lifetime };
}

/** لقطة WAVE6 يدوية — null إن كانت التليمتري معطّلة. */
export function mushafWave6MetricsSnapshot(): MushafWave6TurnMetrics | null {
  if (!enabled || !session) return null;
  const frames = computeFrameStats(session);
  return computeWave6Metrics(session, frames);
}

export function mushafTurnFlush(label = "mushaf-turn"): MushafFrameStats | null {
  if (!enabled || !session) return null;
  mushafTurnStopFrameSample();
  const frames = computeFrameStats(session);
  const wave6 = computeWave6Metrics(session, frames);
  if (typeof console !== "undefined" && typeof console.info === "function") {
    console.info(`[${label}]`, {
      page: session.page,
      ...session.marks,
      frames,
      wave6,
      stats: {
        measureCount: session.measureCount,
        renderCount: session.renderCount,
        fontLoadCount: session.fontLoadCount,
        cacheHits: session.cacheHits,
        cacheMisses: session.cacheMisses,
        rejectedGestureCount: session.rejectedGestureCount,
        selectionMeasureCount: session.selectionMeasureCount,
      },
      lifetime: mushafPerfSnapshot(),
    });
  }
  session = null;
  return frames;
}

/** تنظيف marks/measures عند الخروج من المسار — لا تخزين دائم. */
export function mushafTurnResetSession(): void {
  mushafTurnStopFrameSample();
  session = null;
}
