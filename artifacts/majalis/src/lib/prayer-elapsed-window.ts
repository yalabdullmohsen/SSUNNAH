/**
 * نافذة «مضى على الأذان» من تفضيلات المستخدم (الإقامة) — قراءة وتتبّع التغيّر.
 * قاعدة الحساب نفسها في prayer-phase.resolveElapsedWindowMinutes (مصدر وحيد للويب والودجت وLive Activity).
 */
import { ADHAN_PREFS_CHANGED_EVENT, loadAdhanPrefs } from "./adhan-preferences";
import { DEFAULT_ELAPSED_WINDOW_MINUTES, resolveElapsedWindowMinutes } from "./prayer-phase";

export function getElapsedWindowMinutes(): number {
  try {
    return resolveElapsedWindowMinutes(loadAdhanPrefs());
  } catch {
    return DEFAULT_ELAPSED_WINDOW_MINUTES;
  }
}

/** يُنادي cb عند تغيّر تفضيلات الأذان (إقامة/تأخير). يُرجع دالة الإلغاء. */
export function subscribeElapsedWindow(cb: (minutes: number) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb(getElapsedWindowMinutes());
  window.addEventListener(ADHAN_PREFS_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(ADHAN_PREFS_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
