/**
 * Unregister stale service workers after deploy — prevents broken cached JS chunks.
 */

export async function purgeStaleServiceWorkers(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      const scriptUrl = reg.active?.scriptURL || reg.waiting?.scriptURL || "";
      if (scriptUrl && !scriptUrl.includes("/sw.js")) {
        await reg.unregister();
      }
    }
  } catch {
    /* ignore — SW not critical for app boot */
  }
}

/** أزل كل SW (بما فيها /sw.js) تحت webdriver حتى لا يعترض LHCI التنقّل */
export async function unregisterServiceWorkersForMeasurement(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    if (!navigator.webdriver) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  } catch {
    /* ignore */
  }
}

const SW_UPDATE_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * تأخير التسجيل بعد استقرار الصفحة. حدث install في public/sw.js يبدأ
 * precache لأصول الغلاف (أيقونات + خط قرآني) فورًا، فتشغيله داخل
 * نافذة التحميل الحرجة ينافس LCP/FCP على النطاق والخيط الرئيسي.
 */
const SW_REGISTER_DELAY_MS = 5_000;

function armQuietSwUpdateSignals(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  let hadController = Boolean(navigator.serviceWorker.controller);

  const signalQuietUpdate = () => {
    try {
      window.dispatchEvent(new CustomEvent("mj:sw-updated-quiet"));
    } catch {
      /* ignore */
    }
    void import("@/lib/app-update-manager")
      .then(({ markUpdateReady }) => markUpdateReady("sw-quiet"))
      .catch(() => {});
  };

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (
      event.data?.type === "SW_UPDATED_QUIET" ||
      event.data?.type === "CLIENT_UPDATE_AVAILABLE" ||
      event.data?.type === "SW_UPDATED_RELOAD_ONCE"
    ) {
      signalQuietUpdate();
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    signalQuietUpdate();
  });
}

export function registerProductionServiceWorker(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;
  try {
    if (navigator.webdriver) {
      void unregisterServiceWorkersForMeasurement();
      return;
    }
  } catch {
    /* ignore */
  }

  armQuietSwUpdateSignals();

  window.setTimeout(() => {
    void purgeStaleServiceWorkers().then(() => {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        const forceCheck = () => {
          void registration.update().catch(() => undefined);
        };
        forceCheck();
        window.setInterval(forceCheck, SW_UPDATE_CHECK_INTERVAL_MS);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") forceCheck();
        });
      }).catch((error) => {
        console.warn("[majalis:pwa] service worker registration failed", error);
      });
    });
  }, SW_REGISTER_DELAY_MS);
}
