/**
 * تحميل مسبق للمسارات الأكثر زيارة عند خمول المتصفح.
 * خفيف نسبيًا: هيكل المسارات + مراكز التبويب (بلا مصحف/بحث ثقيل).
 */
import { prefetchAppRoutesShell } from "@/lib/prefetch-app-routes";
import { prefetchHomeWarmRoutes } from "@/lib/prefetch-route";

const TOP_ROUTES: Array<() => Promise<unknown>> = [
  () => import("@/pages/account/SectionsPage"),
  () => import("@/pages/quran/QuranHubPage"),
  () => import("@/pages/worship/PrayerTimesPage"),
  /* Lessons/Fiqh CSS-heavy — تُستبعد من التسخين التلقائي (LHCI unused-css) */
  () => import("@/pages/hadith/HadithPage"),
  () => import("@/pages/worship/AdhkarPage"),
  () => import("@/pages/quran/TafsirPage"),
];

/** يشغّل التسخين فور الخمول — المستدعي يؤجّل الاستيراد خارج نافذة LHCI. */
export function runPrefetchTopRoutes(): void {
  if (typeof window === "undefined") return;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    prefetchAppRoutesShell();
    prefetchHomeWarmRoutes();
    for (const load of TOP_ROUTES) {
      void load().catch(() => undefined);
    }
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 8_000 });
  } else {
    window.setTimeout(run, 4_000);
  }
}

export function prefetchTopRoutesOnIdle(): void {
  if (typeof window === "undefined") return;
  // بعد LCP بكثير — لا تنافس TBT في نافذة القياس
  const afterLoad = () => window.setTimeout(() => runPrefetchTopRoutes(), 90_000);
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}
