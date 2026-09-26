/**
 * AppUpdateManager — تحديثات صامتة في الخلفية (لا Full-screen UI).
 * الحالات: IDLE | CHECKING | DOWNLOADING | READY | ACTIVATING | FAILED
 * لا Route · لا Toast تقنية · لا reload تلقائي.
 */
export const APP_UPDATE_STATES = [
  "IDLE",
  "CHECKING",
  "DOWNLOADING",
  "READY",
  "ACTIVATING",
  "FAILED",
] as const;

export type AppUpdateState = (typeof APP_UPDATE_STATES)[number];

export const APP_UPDATE_EVENT = "mj:app-update";

let state: AppUpdateState = "IDLE";
let lastReason = "init";
let operationId = 0;
let sessionNotifiedReady = false;

type Listener = (next: AppUpdateState, prev: AppUpdateState, reason: string) => void;
const listeners = new Set<Listener>();

function emit(prev: AppUpdateState, next: AppUpdateState, reason: string): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(APP_UPDATE_EVENT, {
        detail: { state: next, prev, reason, operationId },
      }),
    );
  } catch {
    /* ignore */
  }
  for (const fn of listeners) {
    try {
      fn(next, prev, reason);
    } catch {
      /* ignore */
    }
  }
}

export function getAppUpdateState(): AppUpdateState {
  return state;
}

export function getAppUpdateReason(): string {
  return lastReason;
}

export function transitionAppUpdate(next: AppUpdateState, reason = "unspecified"): boolean {
  if (next === state) {
    lastReason = reason;
    return true;
  }
  const prev = state;
  state = next;
  lastReason = reason;
  if (next === "CHECKING" || next === "DOWNLOADING") {
    operationId += 1;
  }
  if (import.meta.env?.DEV) {
    try {
      performance.mark(`update:${next.toLowerCase()}`);
    } catch {
      /* ignore */
    }
  }
  emit(prev, next, reason);
  return true;
}

/** اكتشاف هادئ — لا UI. */
export function beginQuietUpdateCheck(reason = "version-check"): void {
  if (state === "DOWNLOADING" || state === "ACTIVATING") return;
  transitionAppUpdate("CHECKING", reason);
}

export function markUpdateReady(reason = "assets-ready"): void {
  transitionAppUpdate("READY", reason);
}

export function markUpdateFailed(reason = "update-failed"): void {
  transitionAppUpdate("FAILED", reason);
  // FAILED لا يمنع الدخول — نعود IDLE بعد التسجيل
  transitionAppUpdate("IDLE", "failed-idle");
}

/** إشعار اختياري مرة واحدة لكل جلسة عند READY — المستدعي يقرر العرض. */
export function consumeReadyNotifyOnce(): boolean {
  if (state !== "READY" || sessionNotifiedReady) return false;
  sessionNotifiedReady = true;
  return true;
}

export function subscribeAppUpdate(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
