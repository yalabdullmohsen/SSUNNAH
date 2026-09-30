import { useLayoutEffect, useState } from "react";
import { getPowerSaverState } from "@/lib/power-saver-engine";

const loaded = new Set<number>();
/** وعود مشتركة — يمنع FontFace مكررًا لنفس الصفحة من عدة ألواح. */
const inflight = new Map<number, Promise<boolean>>();

/** سقف طابور prefetch البعيد (±2) — لا تحميل عشرات الخطوط. */
const PREFETCH_QUEUE_CAP = 4;
const farPrefetchQueued = new Set<number>();
let farPrefetchActive = 0;
const farPrefetchWait: number[] = [];
let farPrefetchGeneration = 0;

function fontFamilyName(pageNumber: number): string {
  return `qpc-v2-p${pageNumber}`;
}

/**
 * ينتظر خط الصفحة فقط — لا انتظار FontFaceSet العام لكل الوجوه
 * (كان يعلّق التقليب على كل الوجوه المحمّلة).
 */
async function waitUntilReady(pageNumber: number): Promise<boolean> {
  if (typeof document === "undefined" || !document.fonts) return true;
  const family = fontFamilyName(pageNumber);
  const spec = `16px "${family}"`;
  try {
    await document.fonts.load(spec);
  } catch {
    /* يُعاد الفحص أدناه */
  }
  return Boolean(
    document.fonts.check(spec) || document.fonts.check(`16px ${family}`),
  );
}

function loadFace(pageNumber: number): Promise<boolean> {
  if (pageNumber < 1 || pageNumber > 604) return Promise.resolve(false);
  if (loaded.has(pageNumber)) {
    try {
      void import("@/features/mushaf-reader/mushaf-turn-telemetry").then((m) => {
        m.mushafTurnInc("cacheHit");
      });
    } catch {
      /* ignore */
    }
    return Promise.resolve(true);
  }
  const existing = inflight.get(pageNumber);
  if (existing) return existing;

  if (typeof document !== "undefined") {
    const href = `/fonts/qpc-v2/p${pageNumber}.woff2`;
    const marker = `link[data-mushaf-font-preload="${pageNumber}"]`;
    if (!document.querySelector(marker)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = href;
      link.dataset.mushafFontPreload = String(pageNumber);
      document.head.appendChild(link);
    }
  }

  try {
    void import("@/features/mushaf-reader/mushaf-turn-telemetry").then((m) => {
      m.mushafPerfInc("fontLoad");
      m.mushafTurnInc("cacheMiss");
    });
  } catch {
    /* ignore */
  }
  const fontFamily = fontFamilyName(pageNumber);
  const url = `/fonts/qpc-v2/p${pageNumber}.woff2`;
  const face = new FontFace(fontFamily, `url(${url})`, {
    display: "block",
    style: "normal",
    weight: "400",
  });
  const pending = face
    .load()
    .then(async (loadedFace) => {
      document.fonts.add(loadedFace);
      const ok = await waitUntilReady(pageNumber);
      if (ok) loaded.add(pageNumber);
      return ok;
    })
    .catch(async () => {
      const ok = await waitUntilReady(pageNumber);
      if (ok) loaded.add(pageNumber);
      return ok;
    })
    .finally(() => {
      if (inflight.get(pageNumber) === pending) inflight.delete(pageNumber);
    });
  inflight.set(pageNumber, pending);
  return pending;
}

function pumpFarPrefetch(): void {
  while (farPrefetchActive < PREFETCH_QUEUE_CAP && farPrefetchWait.length > 0) {
    const pageNumber = farPrefetchWait.shift()!;
    farPrefetchQueued.delete(pageNumber);
    if (loaded.has(pageNumber) || inflight.has(pageNumber)) continue;
    farPrefetchActive += 1;
    void loadFace(pageNumber).finally(() => {
      farPrefetchActive -= 1;
      pumpFarPrefetch();
    });
  }
}

/** Prefetch بعيد (±2) عبر طابور محدود — يُلغى بتغيير الجيل عند تغيّر الصفحة. */
function enqueueFarPrefetch(pageNumber: number, generation: number): void {
  if (generation !== farPrefetchGeneration) return;
  if (pageNumber < 1 || pageNumber > 604) return;
  if (loaded.has(pageNumber) || inflight.has(pageNumber)) return;
  if (farPrefetchQueued.has(pageNumber)) return;
  if (farPrefetchWait.length + farPrefetchActive >= PREFETCH_QUEUE_CAP * 2) return;
  farPrefetchQueued.add(pageNumber);
  farPrefetchWait.push(pageNumber);
  pumpFarPrefetch();
}

function scheduleIdle(fn: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;
  const cic = (
    window as Window & {
      cancelIdleCallback?: (id: number) => void;
    }
  ).cancelIdleCallback;
  if (typeof ric === "function") {
    const id = ric(fn, { timeout: 1400 });
    return () => {
      if (typeof cic === "function") cic(id);
    };
  }
  const tid = window.setTimeout(fn, 220);
  return () => window.clearTimeout(tid);
}

/** جاهزية متزامنة من كاش الوحدة — بلا حالة React قديمة لصفحة سابقة. */
export function isQpcPageFontReady(pageNumber: number): boolean {
  return loaded.has(pageNumber);
}

/** يضمن تحميل خط الصفحة قبل قلب الواجهة (يمنع FOUT/قفزة المقاسات). */
export function ensureQpcPageFont(pageNumber: number): Promise<boolean> {
  return loadFace(pageNumber);
}

/** اختبارات/تشخيص — حجم طابور prefetch البعيد. */
export function getQpcFarPrefetchQueueSizeForTests(): number {
  return farPrefetchWait.length + farPrefetchActive;
}

/** اختبارات — سقف الطابور. */
export function getQpcFarPrefetchCapForTests(): number {
  return PREFETCH_QUEUE_CAP;
}

export type UseQpcPageFontOptions = {
  /**
   * تحميل مسبق للجيران: ±1 فوري · ±2 على idle · صفحة ١.
   * عطّله في ألواح PrefetchPage — القارئ المركزي يتولى الجيران مرة واحدة.
   */
  prefetchAdjacent?: boolean;
};

/** يحمّل خط QPC V2 الخاص بالصفحة (`/fonts/qpc-v2/pN.woff2`) ويُحمّل مسبقاً ±١. */
export function useQpcPageFont(
  pageNumber: number,
  opts?: UseQpcPageFontOptions,
): { fontFamily: string; ready: boolean } {
  const fontFamily = fontFamilyName(pageNumber);
  const prefetchAdjacent = opts?.prefetchAdjacent !== false;
  /** epoch لإعادة الرسم عند اكتمال التحميل؛ الجاهزية تُقرأ من `loaded` كل رسم. */
  const [, setEpoch] = useState(0);
  const ready = loaded.has(pageNumber);

  useLayoutEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    const already = loaded.has(pageNumber);
    if (!already) {
      void loadFace(pageNumber).then((ok) => {
        if (!cancelled && ok) setEpoch((n) => n + 1);
      });
    }
    if (prefetchAdjacent) {
      const saver = getPowerSaverState();
      if (saver.mode !== "aggressive") {
        /* ±1 أولوية بعد الصفحة الحالية */
        void loadFace(pageNumber - 1);
        void loadFace(pageNumber + 1);
        /* ±2 على idle فقط — لا تنافس أول طلاء */
        const gen = ++farPrefetchGeneration;
        cancelIdle = scheduleIdle(() => {
          if (cancelled) return;
          enqueueFarPrefetch(pageNumber - 2, gen);
          enqueueFarPrefetch(pageNumber + 2, gen);
        });
      }
      /* بسملة المطلع تستخدم دائماً محارف الصفحة ١ → جهّز الخط مسبقاً */
      void loadFace(1);
    }
    return () => {
      cancelled = true;
      farPrefetchGeneration += 1;
      cancelIdle?.();
    };
  }, [pageNumber, prefetchAdjacent]);

  return { fontFamily: `"${fontFamily}"`, ready };
}
