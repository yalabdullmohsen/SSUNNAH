/**
 * كشف منصّة Capacitor عبر window فقط — بلا حزمة core في رسم الإقلاع.
 * على الأصلي يحقن WebView `window.Capacitor` قبل وحدات التطبيق؛
 * على الويب/LHCI يكون غير معرّف → isNative=false دون سحب حزمة Capacitor إلى entry.
 */

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

function readCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** هل يعمل التطبيق داخل Capacitor الأصلي؟ */
export function isNativePlatform(): boolean {
  try {
    return Boolean(readCapacitor()?.isNativePlatform?.());
  } catch {
    return false;
  }
}

/** منصّة Capacitor أو `"web"`. */
export function getNativePlatform(): string {
  try {
    return readCapacitor()?.getPlatform?.() ?? "web";
  } catch {
    return "web";
  }
}
