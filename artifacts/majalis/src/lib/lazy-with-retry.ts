import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/** Unified session key — shared with ErrorBoundary / SectionErrorBoundary. */
export const CHUNK_RELOAD_KEY = "majalis-chunk-reload";
/** آخر فشل تحميل chunk (للمرصدية / واجهة الخطأ) — بلا بيانات مستخدم. */
export const CHUNK_FAILURE_META_KEY = "majalis-chunk-failure-meta";

export type ChunkFailureMeta = {
  label: string;
  buildId: string;
  reason: string;
  chunkHint: string | null;
  at: number;
};

/** معرّف البناء الحالي — يفصل محاولة الاستعادة بين النشرات. */
export function getChunkRecoveryBuildId(): string {
  try {
    const id = String(
      (import.meta as ImportMeta & { env?: { VITE_BUILD_ID?: string } }).env?.VITE_BUILD_ID ||
        "local",
    ).trim();
    return id || "local";
  } catch {
    return "local";
  }
}

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";
  const lower = message.toLowerCase();
  const nameLower = name.toLowerCase();
  return (
    nameLower === "chunkloaderror" ||
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("importing a module script failed") ||
    lower.includes("is not a valid javascript mime type") ||
    lower.includes("error loading dynamically imported module") ||
    lower.includes("loading css chunk") ||
    lower.includes("loading chunk") ||
    lower.includes("chunkloaderror") ||
    /\/assets\/[^?\s]+\.(js|mjs|css)/i.test(message)
  );
}

/** يستخرج تلميح اسم الملف من رسالة الخطأ إن وُجد. */
export function extractChunkHint(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const m = message.match(/\/assets\/([^?\s]+\.(?:js|mjs|css))/i);
  return m?.[1] ?? null;
}

function parseStoredAllowance(raw: string | null): { buildId: string; label: string } | null {
  if (!raw) return null;
  const pipe = raw.indexOf("|");
  if (pipe <= 0) {
    // شكل قديم: label فقط — يُعامل كمحاولة لنفس البناء الحالي
    return { buildId: getChunkRecoveryBuildId(), label: raw };
  }
  return { buildId: raw.slice(0, pipe), label: raw.slice(pipe + 1) || "1" };
}

/** قراءة الحارس من session ثم local — Capacitor لا يضمن دورة حياة sessionStorage كالمتصفح. */
function readAllowanceRaw(): string | null {
  try {
    if (typeof sessionStorage !== "undefined") {
      const s = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      if (s) return s;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(CHUNK_RELOAD_KEY);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeAllowanceRaw(value: string): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, value);
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CHUNK_RELOAD_KEY, value);
    }
  } catch {
    /* ignore */
  }
}

/**
 * محاولة استعادة واحدة لكل build/version في جلسة التبويب / التطبيق المثبّت.
 * اختلاف buildId يفتح محاولة جديدة · نفس البناء يمنع التكرار (لا حلقة).
 */
export function consumeChunkReloadAllowance(label = "1"): boolean {
  try {
    const buildId = getChunkRecoveryBuildId();
    const stored = parseStoredAllowance(readAllowanceRaw());
    if (stored && stored.buildId === buildId) return false;
    writeAllowanceRaw(`${buildId}|${label || "1"}`);
    return true;
  } catch {
    return true;
  }
}

/** هل استُهلكت محاولة هذا البناء بالفعل؟ */
export function hasChunkReloadBeenAttempted(): boolean {
  try {
    const stored = parseStoredAllowance(readAllowanceRaw());
    if (!stored) return false;
    return stored.buildId === getChunkRecoveryBuildId();
  } catch {
    return false;
  }
}

export function recordChunkFailureMeta(
  label: string,
  error: unknown,
): ChunkFailureMeta | null {
  try {
    const meta: ChunkFailureMeta = {
      label: label || "1",
      buildId: getChunkRecoveryBuildId(),
      reason: error instanceof Error ? error.name || "Error" : "unknown",
      chunkHint: extractChunkHint(error),
      at: Date.now(),
    };
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(CHUNK_FAILURE_META_KEY, JSON.stringify(meta));
    }
    return meta;
  } catch {
    return null;
  }
}

export function readChunkFailureMeta(): ChunkFailureMeta | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    const raw = sessionStorage.getItem(CHUNK_FAILURE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChunkFailureMeta;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearChunkReloadGuard(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      sessionStorage.removeItem(CHUNK_FAILURE_META_KEY);
      // Legacy key from pre-unification ErrorBoundary
      sessionStorage.removeItem("mj-chunk-reload-attempted");
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(CHUNK_RELOAD_KEY);
      localStorage.removeItem(CHUNK_FAILURE_META_KEY);
    }
  } catch {
    /* ignore */
  }
}

/**
 * حارس إعادة التحميل التلقائية الصامتة بعد نشر جديد (chunk قديم لم يعد موجودًا).
 * منفصل عن CHUNK_RELOAD_KEY عمدًا: ذاك يُمسح عند استقرار القشرة، أما هذا فلا يُمسح أبدًا
 * — وإلا أعاد chunk مفقود فعلًا في البناء الجديد التحميلَ بلا نهاية.
 * القيمة: `${buildId}|${at}` حيث buildId هو البناء الذي فشل فيه التحميل.
 */
export const CHUNK_AUTO_RELOAD_KEY = "majalis-chunk-auto-reload";
/** شبكة أمان إضافية: لا إعادة تحميل تلقائية ثانية خلال هذه المدة مهما تغيّر البناء. */
export const CHUNK_AUTO_RELOAD_MIN_INTERVAL_MS = 30_000;

function readAutoReloadRaw(): string | null {
  try {
    if (typeof sessionStorage !== "undefined") {
      const s = sessionStorage.getItem(CHUNK_AUTO_RELOAD_KEY);
      if (s) return s;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(CHUNK_AUTO_RELOAD_KEY);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * هل تُسمح إعادة تحميل تلقائية واحدة الآن؟ (قراءة فقط — بلا استهلاك)
 * لا: أثناء الانقطاع · إن أُعيد التحميل تلقائيًا لنفس البناء سابقًا · أو خلال آخر 30 ثانية.
 */
export function canAutoReloadForStaleChunk(now = Date.now()): boolean {
  if (isBrowserOffline()) return false;
  const raw = readAutoReloadRaw();
  if (!raw) return true;
  const pipe = raw.indexOf("|");
  const buildId = pipe > 0 ? raw.slice(0, pipe) : raw;
  const at = pipe > 0 ? Number(raw.slice(pipe + 1)) : NaN;
  if (buildId === getChunkRecoveryBuildId()) return false;
  if (Number.isFinite(at) && now - at < CHUNK_AUTO_RELOAD_MIN_INTERVAL_MS) return false;
  return true;
}

/**
 * يستهلك محاولة إعادة التحميل التلقائية لهذا البناء.
 * إن تعذّر حفظ الحارس (تخزين محظور) لا تُسمح إعادة التحميل — منع الحلقة أولى من الاستعادة.
 */
export function consumeChunkAutoReload(now = Date.now()): boolean {
  if (!canAutoReloadForStaleChunk(now)) return false;
  const value = `${getChunkRecoveryBuildId()}|${now}`;
  let persisted = false;
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(CHUNK_AUTO_RELOAD_KEY, value);
      persisted = sessionStorage.getItem(CHUNK_AUTO_RELOAD_KEY) === value;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CHUNK_AUTO_RELOAD_KEY, value);
      persisted = localStorage.getItem(CHUNK_AUTO_RELOAD_KEY) === value || persisted;
    }
  } catch {
    /* ignore */
  }
  return persisted;
}

/** حالة الشبكة للمسار الهادئ — بلا reload متكرر أثناء الانقطاع. */
export function isBrowserOffline(): boolean {
  try {
    if (typeof navigator === "undefined") return false;
    return navigator.onLine === false;
  } catch {
    return false;
  }
}

/**
 * Lazy load with a single quiet recovery attempt when a stale post-deploy chunk is requested.
 * لا reload تلقائي · لا انتظار 20s على شاشة تحديث.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  label?: string,
): LazyExoticComponent<T> {
  return lazy(() => loadWithChunkRecovery(factory, label));
}

/**
 * مسار تحميل lazyWithRetry (مُصدَّر للاختبار).
 * chunk قديم بعد نشر: إعادة تحميل تلقائية صامتة واحدة — يبقى الوعد معلّقًا (Suspense fallback)
 * فلا تظهر شاشة الخطأ قبل إعادة التحميل. استُهلكت المحاولة/انقطاع ⇒ الاستعادة الهادئة ثم الخطأ.
 */
export async function loadWithChunkRecovery<T>(
  factory: () => Promise<T>,
  label?: string,
): Promise<T> {
  try {
    const mod = await factory();
    clearChunkReloadGuard();
    return mod;
  } catch (error) {
    if (typeof window !== "undefined" && isChunkLoadError(error)) {
      const { reloadOnceForStaleChunk, tryRecoverFromStaleChunk } = await import(
        "@/lib/chunk-recovery"
      );
      if (reloadOnceForStaleChunk(label || "1", error)) {
        return new Promise<T>(() => {
          /* الصفحة تُعاد تحميلها — لا تُحَل ولا تُرفض */
        });
      }
      void tryRecoverFromStaleChunk(label || "1", error);
    }
    throw error;
  }
}

/** Preload a lazy route chunk after auth succeeds (admin login path). */
export function preloadRoute(factory: () => Promise<unknown>): void {
  void factory().catch(() => {
    /* ignore — lazyWithRetry handles load at navigation */
  });
}
