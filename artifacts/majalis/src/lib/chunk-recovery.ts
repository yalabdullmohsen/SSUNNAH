/**
 * استعادة هادئة بعد نشر: chunk hashes قديمة في تبويب مفتوح.
 * بلا واجهة حاجبة · بلا Toast تقني.
 * أولًا: إعادة تحميل تلقائية صامتة واحدة لكل بناء فاشل (reloadOnceForStaleChunk) — بلا reload متكرر.
 * بعدها: purge هادئ لقشرة SW · محاولة واحدة لكل build/version · تُمسح العلامة بعد استقرار الإقلاع.
 */
import {
  CHUNK_RELOAD_KEY,
  canAutoReloadForStaleChunk,
  clearChunkReloadGuard,
  consumeChunkAutoReload,
  consumeChunkReloadAllowance,
  getChunkRecoveryBuildId,
  hasChunkReloadBeenAttempted,
  isBrowserOffline,
  isChunkLoadError,
  recordChunkFailureMeta,
  type ChunkFailureMeta,
} from "@/lib/lazy-with-retry";
import { trackOps } from "@/lib/ops-telemetry";

export const CHUNK_RECOVERING_EVENT = "majalis:chunk-recovering";
export {
  canAutoReloadForStaleChunk,
  isChunkLoadError,
  clearChunkReloadGuard,
  CHUNK_RELOAD_KEY,
  getChunkRecoveryBuildId,
  hasChunkReloadBeenAttempted,
  isBrowserOffline,
  recordChunkFailureMeta,
};
export type { ChunkFailureMeta };

let recoveryInFlight = false;
let lastRecoveryLabel: string | null = null;
let lastRecoveryMeta: ChunkFailureMeta | null = null;

export function isChunkRecoveryInFlight(): boolean {
  return recoveryInFlight;
}

export function getLastChunkRecoveryLabel(): string | null {
  return lastRecoveryLabel;
}

export function getLastChunkRecoveryMeta(): ChunkFailureMeta | null {
  return lastRecoveryMeta;
}

/** اطلب من SW حذف كاش القشرة غير الموثوقة فقط — لا مسح كل Cache. */
function requestSwShellPurge(): void {
  try {
    const ctrl = navigator.serviceWorker?.controller;
    ctrl?.postMessage({ type: "MAJALIS_PURGE_SHELL_ASSETS" });
  } catch {
    /* ignore */
  }
}

function markDev(name: string): void {
  try {
    if (!(import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) return;
    performance.mark(name);
  } catch {
    /* ignore */
  }
}

/**
 * محاولة استعادة هادئة واحدة لكل build/version.
 * تُرجع true إن شُرعت (أو كانت جارية) — **لا** reload · **لا** رسالة مستخدم دائمة.
 */
export function tryRecoverFromStaleChunk(label = "1", error?: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (recoveryInFlight) return true;

  const meta = recordChunkFailureMeta(label, error ?? new Error("chunk-load"));
  lastRecoveryMeta = meta;
  trackOps("chunk.load_failure", {
    label: label || "1",
    buildId: getChunkRecoveryBuildId(),
    reason: meta?.reason ?? "unknown",
    chunkHint: meta?.chunkHint ?? null,
    offline: isBrowserOffline(),
  });

  /* OFFLINE: لا reload · لا استنزاف المحاولة · رسالة صادقة من ErrorBoundary */
  if (isBrowserOffline()) {
    trackOps("chunk.recovery_result", {
      label: label || "1",
      ok: false,
      reason: "offline",
      buildId: getChunkRecoveryBuildId(),
    });
    return false;
  }

  if (!consumeChunkReloadAllowance(label)) {
    trackOps("chunk.recovery_result", {
      label: label || "1",
      ok: false,
      reason: "allowance-exhausted",
      buildId: getChunkRecoveryBuildId(),
    });
    return false;
  }

  recoveryInFlight = true;
  lastRecoveryLabel = label || "1";
  markDev("update:fallback-start");
  trackOps("chunk.recovery_attempted", {
    label: lastRecoveryLabel,
    buildId: getChunkRecoveryBuildId(),
    quiet: true,
  });
  requestSwShellPurge();

  try {
    window.dispatchEvent(
      new CustomEvent(CHUNK_RECOVERING_EVENT, {
        detail: {
          quiet: true,
          label: lastRecoveryLabel,
          buildId: getChunkRecoveryBuildId(),
          chunkHint: meta?.chunkHint ?? null,
        },
      }),
    );
  } catch {
    /* ignore */
  }

  markDev("update:fallback-complete");
  // حرّر العلم فور انتهاء الـpurge message — لا تُبقِ UI في recovering أبدًا
  recoveryInFlight = false;
  trackOps("chunk.recovery_result", {
    label: lastRecoveryLabel,
    ok: true,
    reason: "quiet-purge",
    buildId: getChunkRecoveryBuildId(),
  });
  return true;
}

let autoReloadPending = false;

/** إعادة تحميل تلقائية جارية — الحدود تعرض لا شيء بدل شاشة الخطأ. */
export function isChunkAutoReloadPending(): boolean {
  return autoReloadPending;
}

/** للاختبار: محاكاة صفحة جديدة بعد إعادة التحميل (حالة الوحدة تُصفَّر، والتخزين يبقى). */
export function resetChunkAutoReloadPendingForTests(): void {
  autoReloadPending = false;
}

/**
 * chunk قديم بعد نشر: إعادة تحميل صامتة واحدة للصفحة (نفس المسار) قبل أي شاشة خطأ.
 * تُرجع true إن بدأت (أو كانت جارية). لا: أثناء الانقطاع · بعد محاولة لنفس البناء الفاشل ·
 * خلال 30 ثانية من سابقة · أو إن تعذّر حفظ الحارس ⇒ لا حلقة لا نهائية.
 * HTML شبكة-أولًا في SW (لا يُخزَّن المستند) ⇒ التحميل الجديد يجلب أسماء الـchunks الحالية.
 */
export function reloadOnceForStaleChunk(label = "1", error?: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (autoReloadPending) return true;
  if (!consumeChunkAutoReload()) return false;

  autoReloadPending = true;
  const meta = recordChunkFailureMeta(label, error ?? new Error("chunk-load"));
  lastRecoveryMeta = meta;
  lastRecoveryLabel = label || "1";
  trackOps("chunk.recovery_attempted", {
    label: lastRecoveryLabel,
    buildId: getChunkRecoveryBuildId(),
    quiet: true,
    autoReload: true,
    chunkHint: meta?.chunkHint ?? null,
  });
  requestSwShellPurge();
  window.location.reload();
  return true;
}

/**
 * يُستدعى بعد INTERACTIVE / نجاح الإقلاع — يحرّر الحارس لمحاولة لاحقة في نشر جديد.
 * لا يمسّ بيانات المستخدم.
 */
export function clearChunkRecoveryAfterStableBoot(reason = "interactive"): void {
  clearChunkReloadGuard();
  recoveryInFlight = false;
  trackOps("chunk.recovery_result", {
    label: lastRecoveryLabel ?? "stable",
    ok: true,
    reason: `cleared:${reason}`,
    buildId: getChunkRecoveryBuildId(),
  });
}

/**
 * استعادة بمبادرة المستخدم فقط: purge قشرة + reload واحد.
 * لا تُستدعى تلقائيًا · لا تمسح كل caches.keys().
 */
export async function hardRecoverStaleDeploy(): Promise<void> {
  markDev("update:activation-start");
  if (isBrowserOffline()) {
    trackOps("chunk.recovery_result", {
      label: "hard-user",
      ok: false,
      reason: "offline",
      buildId: getChunkRecoveryBuildId(),
    });
    return;
  }
  requestSwShellPurge();
  clearChunkReloadGuard();
  try {
    sessionStorage.removeItem("majalis-safe-reload-ts");
    sessionStorage.removeItem("mj.sw-reload-once.v1");
    sessionStorage.removeItem("ssunnah-refreshing-version");
  } catch {
    /* ignore */
  }
  trackOps("chunk.recovery_attempted", {
    label: "hard-user",
    buildId: getChunkRecoveryBuildId(),
    quiet: false,
    route: typeof window !== "undefined" ? window.location.pathname : null,
  });
  /* يحافظ على المسار الحالي — location.reload لا يغيّر pathname */
  window.location.reload();
}
