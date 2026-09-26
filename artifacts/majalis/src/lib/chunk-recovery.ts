/**
 * استعادة هادئة بعد نشر: chunk hashes قديمة في تبويب مفتوح.
 * بلا واجهة حاجبة · بلا Toast تقني · بلا reload تلقائي.
 */
import {
  CHUNK_RELOAD_KEY,
  clearChunkReloadGuard,
  consumeChunkReloadAllowance,
  isChunkLoadError,
} from "@/lib/lazy-with-retry";

export const CHUNK_RECOVERING_EVENT = "majalis:chunk-recovering";
export { isChunkLoadError, clearChunkReloadGuard, CHUNK_RELOAD_KEY };

let recoveryInFlight = false;
let lastRecoveryLabel: string | null = null;

export function isChunkRecoveryInFlight(): boolean {
  return recoveryInFlight;
}

export function getLastChunkRecoveryLabel(): string | null {
  return lastRecoveryLabel;
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
 * محاولة استعادة هادئة واحدة لكل جلسة تبويب.
 * تُرجع true إن شُرعت (أو كانت جارية) — **لا** reload · **لا** رسالة مستخدم.
 */
export function tryRecoverFromStaleChunk(label = "1"): boolean {
  if (typeof window === "undefined") return false;
  if (recoveryInFlight) return true;
  if (!consumeChunkReloadAllowance(label)) return false;

  recoveryInFlight = true;
  lastRecoveryLabel = label || "1";
  markDev("update:fallback-start");
  requestSwShellPurge();

  try {
    window.dispatchEvent(
      new CustomEvent(CHUNK_RECOVERING_EVENT, {
        detail: { quiet: true, label: lastRecoveryLabel },
      }),
    );
  } catch {
    /* ignore */
  }

  markDev("update:fallback-complete");
  // حرّر العلم فور انتهاء الـpurge message — لا تُبقِ UI في recovering أبدًا
  recoveryInFlight = false;
  return true;
}

/**
 * استعادة بمبادرة المستخدم فقط: purge قشرة + reload واحد.
 * لا تُستدعى تلقائيًا · لا تمسح كل caches.keys().
 */
export async function hardRecoverStaleDeploy(): Promise<void> {
  markDev("update:activation-start");
  requestSwShellPurge();
  clearChunkReloadGuard();
  try {
    sessionStorage.removeItem("majalis-safe-reload-ts");
    sessionStorage.removeItem("mj.sw-reload-once.v1");
    sessionStorage.removeItem("ssunnah-refreshing-version");
  } catch {
    /* ignore */
  }
  window.location.reload();
}
