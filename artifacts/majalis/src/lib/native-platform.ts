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

/* ───────────────────────── حدّ التطبيق ↔ الموقع (APP_VS_WEB_BOUNDARY) ─────────────────────────
 * المرجع: docs/architecture/APP_VS_WEB_BOUNDARY.md — هذه الوحدة هي مصدر الحقيقة الوحيد.
 * - BUILD_TARGET ثابت وقت البناء (vite define لـ VITE_TARGET): "native" فقط في متغيّر البناء الأصلي
 *   (`pnpm run build:native-variant`) → تُحذف وحدات الويب فقط (PWA/SW) بإزالة الشيفرة الميتة.
 * - isNativeApp() يجمع الثابت مع الكشف الفعلي (window.Capacitor) لأن غلاف iOS يحمّل
 *   https://www.ssunnah.com الحيّ (server.url) — أي الحزمة نفسها تعمل على الويب والتطبيق.
 */
export type BuildTarget = "native" | "web";

/* vite define يستبدل `import.meta.env.VITE_TARGET` بنص ثابت → طيّ الشرط وحذف الفرع الميت.
 * تحت node/tsx (البوابات) لا يوجد import.meta.env → "web". */
const RAW_BUILD_TARGET: string | undefined = import.meta.env ? import.meta.env.VITE_TARGET : undefined;
export const BUILD_TARGET: BuildTarget = RAW_BUILD_TARGET === "native" ? "native" : "web";
/** ثابت بناء: true فقط في متغيّر البناء الأصلي — صالح لحراسة `lazy(import())` لوحدات الويب. */
export const IS_NATIVE_BUILD = BUILD_TARGET === "native";

/** داخل تطبيق سُنّة الأصلي (بناءً أو تشغيلًا). */
export function isNativeApp(): boolean {
  return IS_NATIVE_BUILD || isNativePlatform();
}

/** على الموقع في متصفح (ليس داخل التطبيق الأصلي). */
export function isWeb(): boolean {
  return !isNativeApp();
}

/** نطاقات علامتنا — روابطها تُفتح داخل التطبيق لا في Safari (مصدر واحد للقائمة). */
export const APP_HOSTS: ReadonlySet<string> = new Set([
  "www.ssunnah.com",
  "ssunnah.com",
  "majlisilm.com",
  "www.majlisilm.com",
  "localhost",
  "127.0.0.1",
]);

export function isAppHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  return APP_HOSTS.has(h) || h.endsWith(".ssunnah.com") || h.endsWith(".majlisilm.com");
}

/** علامة user-agent التي يحقنها غلاف iOS الأصلي (SunnahNative/1) — التبويبات الأصلية تحلّ محل شريط الموقع. */
export const SUNNAH_NATIVE_UA_MARKER = /SunnahNative\/1\b/;

/** هل يحمل المتصفح علامة SunnahNative/1؟ (يقبل ua صريحًا للاختبار). */
export function hasSunnahNativeMarker(ua?: string): boolean {
  try {
    const value = ua ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);
    return SUNNAH_NATIVE_UA_MARKER.test(value || "");
  } catch {
    return false;
  }
}
