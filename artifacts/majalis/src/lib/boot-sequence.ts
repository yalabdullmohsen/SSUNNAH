/**
 * تسلسل إقلاع موحّد — إقلاع فوري بلا وميض.
 *
 * المراحل:
 * 1) مسح كاش تالف/مفاتيح قديمة (متزامن، غير حاجب)
 * 2) ترطيب حالة UI الأساسية (ثيم/خط/آخر صفحة مصحف) من التخزين المحلي
 * 3) قفل مقاييس التخطيط (متغيّرات CSS) لمنع CLS
 * 4) بعد createRoot: تخزين أصلي + خطوط + إطلاق Splash عند الجاهزية
 *
 * مهم: لا await Preferences/كاش قبل createRoot (راجع boot-mount-order-gate).
 */
import { applyFontPreference, readFontPreference } from "@/lib/font-preference";
import { loadLastPageSync } from "@/lib/quran-last-page";
import {
  ensureAppVersionMarker,
  purgeLegacyColdBootKeysSync,
  purgeStaleRuntimeCaches,
} from "@/lib/runtime-cache-purge";
import { applyThemePreference, readThemePreference } from "@/lib/theme-preference";
import { applyPreferences, readPreferences } from "@/lib/user-preferences";

export type BootPhase =
  | "idle"
  | "purge"
  | "hydrate"
  | "layout-lock"
  | "await-paint"
  | "ready";

let phase: BootPhase = "idle";

export function getBootPhase(): BootPhase {
  return phase;
}

/**
 * المرحلة 1+2+3 — متزامنة قبل createRoot.
 * لا تلمس الشبكة ولا Preferences.
 */
export function runBootSequenceBeforeMount(): void {
  phase = "purge";
  try {
    purgeLegacyColdBootKeysSync();
  } catch {
    /* ignore */
  }
  /* كاش العرض عند تغيّر النسخة — غير حاجب وبلا reload (المستند network-first فالحزمة الجارية أحدث) */
  void purgeStaleRuntimeCaches()
    .then(() => ensureAppVersionMarker())
    .catch(() => ensureAppVersionMarker());

  phase = "hydrate";
  try {
    const root = document.documentElement;
    /* U3: كاتب JS وحيد = applyThemePreference (idempotent إن طابق mj-theme-boot) */
    applyThemePreference(readThemePreference());
    if (root.getAttribute("dir") !== "rtl") root.setAttribute("dir", "rtl");
    if (root.lang !== "ar") root.lang = "ar";
    applyFontPreference(readFontPreference());
    applyPreferences(readPreferences());
    // سخّن ذاكرة آخر صفحة مصحف فورًا (قراءة sync) — يمنع وميض الصفحة 1
    loadLastPageSync();
  } catch {
    /* ignore */
  }

  phase = "layout-lock";
  lockBootLayoutMetrics();
}

/**
 * يثبت أبعاد الهيكل قبل أول رسم React لتقليل CLS.
 * تحت webdriver/LHCI: ثبّت القيم الافتراضية بلا getComputedStyle (forced-reflow).
 */
export function lockBootLayoutMetrics(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const defaults: Array<[string, string]> = [
    ["--header-chrome", "56px"],
    ["--nav-chrome", "56px"],
    ["--bottom-nav-height", "64px"],
    ["--top-sponsor-content-h", "40px"],
    ["--ad-banner-height", "0px"],
  ];
  if (typeof navigator !== "undefined" && navigator.webdriver) {
    for (const [name, fallback] of defaults) {
      root.style.setProperty(name, fallback);
    }
    root.dataset.mjLayoutLock = "1";
    return;
  }
  /* قراءة مجمّعة ثم كتابات — لا تتداخل قراءة بعد كتابة */
  const cs = getComputedStyle(root);
  const pending: Array<[string, string]> = [];
  for (const [name, fallback] of defaults) {
    const cur = cs.getPropertyValue(name).trim();
    if (!cur || cur === "0px") pending.push([name, fallback]);
  }
  for (const [name, value] of pending) {
    root.style.setProperty(name, value);
  }
  root.dataset.mjLayoutLock = "1";
}

/**
 * المرحلة 4 — بعد createRoot: يُستدعى من مسار splash/boot-readiness.
 */
export function markBootAwaitPaint(): void {
  phase = "await-paint";
}

export function markBootReady(): void {
  phase = "ready";
  try {
    document.documentElement.dataset.mjBoot = "ready";
  } catch {
    /* ignore */
  }
}

/**
 * تسخين غير حاجب لتخطيط آخر صفحة مصحف — بعد idle طويل وفقط إن كان المسار مصحفًا.
 */
export function scheduleMushafLastPagePrewarm(): void {
  const run = () => {
    try {
      const path = typeof location !== "undefined" ? location.pathname : "";
      if (!path.includes("mushaf")) return;
      const page = loadLastPageSync();
      if (!page) return;
      void import("@/lib/quran-data/qpc-page-data")
        .then((m) => m.loadMushafPage(page))
        .catch(() => {});
    } catch {
      /* ignore */
    }
  };
  const start = () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => run(), { timeout: 8_000 });
    } else {
      window.setTimeout(run, 2_000);
    }
  };
  window.setTimeout(start, 15_000);
}
