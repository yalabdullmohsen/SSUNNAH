import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AppProviders } from "./app/providers/AppProviders";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChunkRecoveryToast } from "./components/ChunkRecoveryToast";
import { readThemePreference, resolveTheme } from "./lib/theme-preference";
import { initClientErrorReporting } from "./lib/error-report";
import { resetMobileNavBodyLock } from "./lib/mobile-nav-body-lock";
import { createAppQueryClient } from "./lib/query-client";
import { PERF_SLOW_MS } from "./lib/performance-monitor";
import { setupStatusBar, setupKeyboard, isAndroid, isIOS, isNative } from "./lib/capacitor-utils";
import { purgeNativeWebRuntimeCaches } from "./lib/native-cache-freshness";
import { installMajalisClearCacheDebug } from "./lib/runtime-cache-purge";
import {
  markBootAwaitPaint,
  runBootSequenceBeforeMount,
  scheduleMushafLastPagePrewarm,
} from "./lib/boot-sequence";
/* beginBootstrapStage showFirstUsefulScreen isStartupSafeMode clearStartupFailures */
import { hydrateNativeStorage } from "./lib/native-storage";
import { installInAppNavigationGuard } from "./lib/in-app-navigation";
import { armNativeSplashController } from "./lib/splash-screen";
import { awaitBootReadiness, registerBootStorageGate } from "./lib/boot-readiness";
import {
  notifyBootstrapping,
  reportFatalError,
} from "./lib/app-startup-controller";
import { scheduleBackgroundUiFontWarm } from "./lib/background-ui-fonts";
import { markStartup } from "./lib/startup-performance-marks";
import { initOnboardingState } from "./lib/onboarding-state";
import { scheduleOnIdle } from "./lib/yield-to-main";
import { logLcpCandidateHint } from "./lib/home-lcp-static-shell";
import {
  ensureDarkCoreLayers,
  ensureDarkLayersForBoot,
  isDarkCoreLoadStarted,
} from "./lib/ensure-dark-layers";
// خطوط الواجهة المحلية قبل أي طبقة تستخدم --font-app
import "./styles/fonts-ui.css";
// هوية identity-v2 — الرموز أولاً (@theme + --mj-*) قبل أي طبقة قديمة
import "./app/styles/theme.css";
// Foundation Reset PR-1 — مصدر الحقيقة (--sf-*) قبل الطبقات القديمة
import "./styles/sunnah-foundation-tokens.css";
// Foundation V2 — أدوار دلالية (--sf2-*) فوق --sf-* (موجة إعادة التصميم)
import "./styles/sunnah-foundation-v2.css";
// z-index-layers + motion-policy — مؤجّلة تحت ميزانية CSS الحرج (انظر loadNonCriticalCss)
// واجهة استهلاك سُنّة (--ss-*) + أصناف .ss-text — جسر فقط بلا قيم حرفية جديدة
import "./styles/ssunnah-theme-api.css";
/* ssunnah-screen-patterns — مع ScreenShell (مسارات كسولة) لا داخل CSS الحرج */
/* طبقة الأسطح القديمة متقاعدة — السطح عبر AppCard / cs-card / ss-app-card */
// visual-enrichment مؤجَّل — ليس حرجًا لأول طلاء (ميزانية CSS الحرج ≤60KiB gzip)
// page-hero / filters / hub-card تُحمَّل مع مكوّناتها (خارج CSS الحرج)
// طبقات الأساس m2030 — foundation/navigation مؤجّلة (ليست حرجة لأول شاشة)
/* LEGACY_NON_SOT — brand-v4 / green-surface / final-release / unify حتى PR-13 */
import "./styles/brand-v4.css";
/* tokens.css + sunnah-identity-reset — مؤجّلان بعد الهوية الحرجة (ميزانية unused-css) */
// رموز دلالية موحّدة (سطح/نص/حد/خطوط) — بعد brand وقبل الطبقات القديمة
import "./styles/design-tokens.css";
  /* visual-redesign-v2-tokens — مؤجّل مع loadNonCriticalCss (رموز dashboard؛ ليس ATF Home) */
import "./styles/breakpoints.css";
import "./styles/typography-scale.css";
import "./styles/typography-app.css";
import "./index.css";
/* لغة الهيرو/البطاقات العصرية — مؤجّلة تحت ميزانية CSS الحرج ≤60KiB gzip */
// contrast/a11y الثقيلة + صفحات متخصصة — بعد load (انظر loadNonCriticalCss)
// جسر aliases: يوجّه --brand/--em-* /shadcn إلى لوحة --mj-* (آخر شيء)
import "./styles/theme-aliases.css";
/* طبقة ألوان دلالية (بعد الجسور حتى تفوز) */
import "./styles/semantic-layer-tokens.css";
/* visual-layer-contrast-fix — مؤجّل في loadNonCriticalCss قبل final-release */
/* توحيد الهوية البصرية (مصحف هادئ) — بعد الجسور */
/* visual-identity-unify — مؤجّل (unused-css Home ~10KB) انظر loadNonCriticalCss */
/* sections-calm-polish + ssunnah-ux-polish — مؤجّلة في loadNonCriticalCss قبل final-release */
/* نمط مكارم الأخلاق — مؤجَّل (زينة أقسام، ليس أول طلاء) */
/* تباين بطاقات الأقسام/المعجم/العقيدة — مؤجّل تحت ميزانية الحرج */
/* Modern Islamic Editorial — مؤجّل (انظر loadNonCriticalCss) حتى لا يتجاوز ميزانية الحرج */
/* semantic-tokens + card-unify مؤجّلان — ميزانية CSS الحرج ≤60KiB gzip */
/* Green Surface System — مؤجّل تحت الميزانية (انظر loadNonCriticalCss) */
/* حالات تفاعل متمايزة + ::selection — متزامن (عقد identity-cascade / dark-deferred) */
import "./styles/interaction-states.css";
/* dark-mode-recovery مع ensure-dark-layers — خارج CSS النهاري (عقد U1 unused-css ≤80) */
// dark-mode-surfaces.css / dark-design-system.css / premium-dark-refine.css / luxury-night-v2.css
// — محمّل واحد عبر ensure-dark-layers (Phase 3: لا إعادة idle لنفس الوحدات)
{
  const bootDark =
    document.documentElement.classList.contains("dark") ||
    document.documentElement.dataset.theme === "dark";
  if (bootDark) {
    /* متوازٍ عبر ensureDarkLayersForBoot — يقلّل وميض البطاقات بلا تكرار لاحق */
    void ensureDarkLayersForBoot();
  }
}

// Lighthouse/Playwright: أزل أي SW قديم يتحكم بالصفحة قبل القياس
if (
  !isNative &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator
) {
  try {
    if (navigator.webdriver) {
      void navigator.serviceWorker.getRegistrations().then((regs) =>
        Promise.all(regs.map((r) => r.unregister())),
      );
    }
  } catch {
    /* ignore */
  }
}

// طبقات مظهر غير حرجة — بعد load + idle حتى لا تنافس LCP
// ZERO FLICKER FINAL: توجيه المسار — لا تُدخل CSS غير-Home إلى رسم Home
function loadNonCriticalCss() {
  const path =
    typeof location !== "undefined"
      ? (location.pathname || "/").replace(/\/+$/, "") || "/"
      : "/";
  const isHome = path === "/";
  /* مصحف غامر: لا تنافس هوية الأقسام/design-system مع أول تقليبة */
  const isMushaf = path === "/mushaf" || path.startsWith("/mushaf/");
  const deferAppChromeCss = isHome || isMushaf;
  const wantsReadingShell =
    path.startsWith("/lessons") ||
    path.startsWith("/hadith") ||
    path.startsWith("/fiqh") ||
    path.startsWith("/topics") ||
    path.startsWith("/scholars") ||
    path.startsWith("/fawaid") ||
    path.startsWith("/adhkar");
  void import("./styles/z-index-layers.css");
  void import("./styles/motion-policy.css");
  void import("./styles/visual-identity-unify.css");
  /* صقل/تفاعل/رموز v2 + طبقات كانت متزامنة — قبل design-system/final-release */
  void import("./styles/tokens.css");
  void import("./styles/sunnah-identity-reset.css");
  void import("./styles/visual-layer-contrast-fix.css");
  void import("./styles/visual-redesign-v2-tokens.css");
  void import("./styles/sections-calm-polish.css");
  void import("./styles/ssunnah-ux-polish.css");
  void import("./styles/components/modern-section-shell.css");
  void import("./styles/section-cards-theme.css");
  void import("./styles/sunnah-foundation-type.css");
  void import("./styles/green-surface-system.css");
  void import("./styles/ssunnah-semantic-tokens.css");
  void import("./styles/ssunnah-card-unify.css");
  void import("./styles/card-matte-unify.css");
  void import("./styles/components/badge-system.css");
  /* Home/Mushaf: mur/ds-canonical ليست ATF — تُؤجَّل مع heavy */
  if (!deferAppChromeCss) {
    void import("./styles/modern-ui-refresh.css");
    void import("./styles/ssunnah-ds-canonical.css");
  }
  void import("./styles/m2030/foundation.css");
  void import("./styles/m2030/navigation.css");
  void import("./styles/brand-v4-contrast-fixes.css");
  void import("./styles/a11y-release-gate.css");
  /* visual-enrichment: زخرفة مؤجّلة — ليست هندسة أول إطار (S2 late soft-paint) */
  if (!deferAppChromeCss) {
    void import("./styles/visual-enrichment.css");
  }
  const loadHeavyIdentityCss = () => {
    if (deferAppChromeCss) {
      void import("./styles/sunnah-visual-language.css");
      void import("./styles/sunnah-geometry-system.css");
      void import("./styles/modern-ui-refresh.css");
      void import("./styles/ssunnah-ds-canonical.css");
      void import("./styles/visual-enrichment.css");
    }
    void import("./styles/design-system.css").then(() => {
      void import("./styles/brand-v4-components.css");
      // بعد design-system حتمًا حتى لا يفوز blur(20px) على final-release
      void import("./styles/final-release.css").then(() => {
        // WAVE7: لا إعادة استيراد unify/recovery بعد final-release —
        // فوز الهوية/الليل مُمتص في WAVE7 CASCADE SEAL داخل final-release.css.
        void import("./styles/card-decorative-strip-cleanup.css");
        void import("./styles/modern-islamic-editorial-tokens.css");
        void import("./styles/modern-islamic-editorial.css").then(() => {
          void import("./styles/card-system.css").then(() => {
            void import("./styles/card-system-v2.css");
            void import("./styles/app-state-v2.css");
            if (!isHome && !isMushaf) {
              void import("./styles/islam-intro-experience.css");
            }
          });
        });
      });
    });
  };
  /* Home + Mushaf: لا تحمّل design-system الثقيل إلا بتفاعل أو idle متأخر */
  if (deferAppChromeCss) {
    let heavyArmed = false;
    const armHeavy = () => {
      if (heavyArmed) return;
      heavyArmed = true;
      scheduleOnIdle(loadHeavyIdentityCss, isMushaf ? 1600 : 800);
    };
    window.addEventListener("pointerdown", armHeavy, { once: true, passive: true });
    window.addEventListener("keydown", armHeavy, { once: true });
    window.addEventListener("touchstart", armHeavy, { once: true, passive: true });
    const heavyDelayMs = isMushaf ? 90_000 : 60_000;
    const startHeavyTimer = () => window.setTimeout(armHeavy, heavyDelayMs);
    if (document.readyState === "complete") startHeavyTimer();
    else window.addEventListener("load", startHeavyTimer, { once: true });
  } else {
    loadHeavyIdentityCss();
  }
  void import("./styles/components/instant-interaction.css");
  /* Home/Mushaf ATF: svl/geometry ليست لسطح المصحف — مع heavy فقط */
  if (!deferAppChromeCss) {
    void import("./styles/sunnah-visual-language.css");
    void import("./styles/sunnah-geometry-system.css");
    void import("./styles/visual-refresh-v1.css");
  }
  void import("./styles/components/native-feel.css");
  void import("./styles/m2030/interactions.css");

  if (!deferAppChromeCss) {
    void import("./styles/index-deferred-pages.css");
    void import("./styles/section-makarim-pattern.css");
    void import("./styles/components/compact-sources.css");
    void import("./styles/m2030/pages.css");
  }
  if (wantsReadingShell) {
    void import("./styles/components/content-reading-shell.css");
    void import("./styles/reading-prose-system.css");
    void import("./styles/components/reading-section-card.css");
  }

  /* طبقات الليل على idle — contrast/Playwright قد يطبّق dark بعد load بلا ThemeProvider */
  if (!isDarkCoreLoadStarted()) {
    void ensureDarkCoreLayers();
  }
}
function scheduleNonCriticalCss() {
  scheduleOnIdle(loadNonCriticalCss, 2500);
  // أوزان Aref Ruqaa الزخرفية متأخرة — Amiri 700 مُحمَّل عند الإقلاع (منع قفزة الوزن)
  window.setTimeout(() => {
    void import("./styles/fonts-ui-bold.css");
  }, 20000);
}
if (document.readyState === "complete") {
  scheduleNonCriticalCss();
} else {
  window.addEventListener("load", scheduleNonCriticalCss, { once: true });
}
// chunk-recovery / capacitor / ios-edge خارج CSS الحرج (gzip ≤60KiB)

if (isNative) {
  document.documentElement.classList.add("capacitor-native");
  document.documentElement.dataset.platform = isAndroid ? "android" : isIOS ? "ios" : "native";
  // أبقِ خلفية الإقلاع حتى يركّب React ويضبط PageChrome.
  {
    const bootTheme = resolveTheme(readThemePreference());
    document.documentElement.style.setProperty(
      "--app-status-bg",
      bootTheme === "dark" ? "#101614" : "#F8F6F1",
    );
    document.documentElement.style.setProperty(
      "--app-status-fg-mode",
      bootTheme === "dark" ? "dark" : "light",
    );
  }
  void import("./styles/capacitor-native-ux.css");
  void import("./styles/ios-edge.css");
}

const queryClient = createAppQueryClient();

resetMobileNavBodyLock();
installMajalisClearCacheDebug();
// تسلسل إقلاع موحّد (مسح قديم + ترطيب ثيم/صفحة + قفل مقاييس) — بلا await قبل createRoot
runBootSequenceBeforeMount();

const bootReporting = () => {
  initClientErrorReporting();
  logLcpCandidateHint();
  // لقطة CLS/LCP/FCP/TBT بعد استقرار الهيكل — للمقارنة قبل/بعد
  void import("./lib/boot-vitals-snapshot").then((m) => {
    m.scheduleBootVitalsSnapshot();
    /* تحت webdriver تتخطّى الدالة داخليًا — لا قراءات هندسية في نافذة LHCI */
    m.scheduleHomeStartupLayoutDiag();
  });
  // Platform health debug hooks — never block UX (Observability Contract)
  scheduleOnIdle(() => {
    void import("./lib/platform/platform-health").then((m) => m.publishPlatformHealthDebug());
  }, 2_500);
  // RUM بعد idle — لا ينافس LCP؛ يُفعَّل فقط مع موافقة التحليلات
  scheduleOnIdle(() => {
    void import("./lib/rum-telemetry").then((m) => m.initRumTelemetry());
  }, 4_000);
};
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(bootReporting, { timeout: 2_500 });
} else {
  setTimeout(bootReporting, 0);
}

const bootFinalPolish = () => {
  void import("./lib/init-final-polish").then((m) => m.initFinalPolish());
};
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(bootFinalPolish, { timeout: 4_000 });
} else {
  setTimeout(bootFinalPolish, 1);
}

function scheduleNetworkWarm() {
  const run = () => {
    // لا تسخين أصوات قرآن/تفسير عند أول فتح — فقط أصول نصّية خفيفة
    void import("./lib/resource-prewarm").then((m) => {
      m.prewarmTextApis();
      m.prewarmSupabaseOrigin();
    });
  };
  const start = () => window.setTimeout(() => scheduleOnIdle(run), 20_000);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
scheduleNetworkWarm();

/* تسخين المسارات — بعد 90s حتى لا يدخل CSS ثقيل إلى نافذة LHCI Home */
{
  const armPrefetch = () => {
    window.setTimeout(() => {
      void import("./lib/prefetch-top-routes").then((m) => m.runPrefetchTopRoutes());
    }, 90_000);
  };
  if (document.readyState === "complete") armPrefetch();
  else window.addEventListener("load", armPrefetch, { once: true });
}

async function mount() {
  const started = performance.now();
  markStartup("startup:js-start");
  notifyBootstrapping("main-mount");

  // ترحيل راية الخصوصية ومسح مفاتيح الدخولية القديمة — بلا شاشة بدء.
  initOnboardingState();

  if (isNative) {
    installInAppNavigationGuard();
  }

  // مهم: لا ننتظر purge/hydrate قبل createRoot — كانت تعلّق شاشة بيضاء/فاتحة
  // داخل Capacitor عندما يعلق جسر Preferences أو مسح الكاش.
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("[boot] #root missing — cannot mount");
    reportFatalError("#root missing", "root-missing");
    return;
  }

  try {
    createRoot(rootEl).render(
      <>
        <ChunkRecoveryToast />
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppProviders>
              <App />
            </AppProviders>
          </QueryClientProvider>
        </ErrorBoundary>
      </>,
    );
  } catch (err) {
    console.error("[boot] createRoot failed", err);
    reportFatalError("createRoot failed", "create-root-failed");
    void import("./lib/startup-safe-mode").then((m) => m.recordStartupFailure("create_root_failed")).catch(() => {});
    return;
  }
  markStartup("startup:root-mounted");

  // مزامنة التخزين الأصلي بالتوازي مع الرسم — لا await قبل createRoot.
  const storageHydrate = hydrateNativeStorage().catch(() => {});
  registerBootStorageGate(storageHydrate);

  // أخفِ الإطلاق بعد جاهزية الثيم/الخطوط/التخزين (document.fonts داخل awaitBootReadiness).
  markBootAwaitPaint();
  armNativeSplashController();
  scheduleBackgroundUiFontWarm();
  void awaitBootReadiness().then(() => {
    markStartup("startup:theme-ready");
    markStartup("startup:fonts-ready");
    markStartup("startup:session-ready");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("mj:app-painted"));
        window.dispatchEvent(new Event("app:first-paint"));
        markStartup("startup:content-ready");
        scheduleMushafLastPagePrewarm();
      });
    });
  });

  // خلفيات غير حاجبة للإقلاع — تأجيل طويل (لا rIC: يطلق فور الخمول فيُحسب Unused JS).
  // تهيئة Supabase ملك AuthProvider فقط — لا مسار reset مزدوج هنا.
  const afterPaint = () => {
    void purgeNativeWebRuntimeCaches().catch(() => {});
    void storageHydrate;
  };
  let afterPaintStarted = false;
  const startAfterPaint = () => {
    if (afterPaintStarted) return;
    afterPaintStarted = true;
    afterPaint();
  };
  window.addEventListener("pointerdown", startAfterPaint, { once: true, passive: true });
  window.addEventListener("keydown", startAfterPaint, { once: true });
  window.setTimeout(startAfterPaint, 20000);

  const renderMs = Math.round(performance.now() - started);
  if (renderMs > PERF_SLOW_MS) {
    console.warn(`[perf:slow] render "app-mount" ${renderMs}ms`);
  }

  // بعد استقرار الإقلاع (لا خطأ chunk خلال 8 ثوانٍ)، يُحرَّر حارس إعادة
  // التحميل لخطأ chunk في ErrorBoundary.tsx — فيبقى خطأ chunk لاحق (نشر
  // جديد بعد ساعات مثلاً بينما التبويب مفتوح) قادرًا على إعادة تحميل
  // تلقائية واحدة أيضًا، لا محظورًا للأبد لبقية عمر التبويب.
  setTimeout(() => {
    try {
      // نجاح الإقلاع — اسمح بمحاولة native-load-error ناعمة في الجلسة التالية
      sessionStorage.removeItem("mj.native-load-retry");
      void import("./lib/startup-safe-mode").then((m) => m.clearStartupFailures()).catch(() => {});
    } catch { /* تجاهل */ }
    void import("@/lib/lazy-with-retry").then(({ clearChunkReloadGuard }) => {
      clearChunkReloadGuard();
    }).catch(() => {
      try {
        sessionStorage.removeItem("majalis-chunk-reload");
        sessionStorage.removeItem("mj-chunk-reload-attempted");
      } catch { /* تجاهل */ }
    });
  }, 8000);
}

void mount().catch((err) => {
  console.error("[boot] mount failed", err);
});

// داخل تطبيق Capacitor الأصلي نمنع تسجيل SW تمامًا لتفادي أي بقايا كاش
// من جلسات سابقة داخل WebView؛ تحديث iOS يعتمد على ملفات cap sync فقط.
if (!isNative) {
  const registerSw = () => {
    void import("./lib/service-worker").then((m) => m.registerProductionServiceWorker());
  };
  if (document.readyState === "complete") scheduleOnIdle(registerSw);
  else window.addEventListener("load", () => scheduleOnIdle(registerSw), { once: true });
}

// إعداد Capacitor Native (يُهمَل تلقائياً على الويب) — بعد الرسم حتى لا يحجب TBT
if (isNative) {
  scheduleOnIdle(() => {
    void setupStatusBar(resolveTheme(readThemePreference()));
    void setupKeyboard();
  }, 1500);
}

/**
 * روابط عميقة (Universal Links على iOS، عبر majlisilm.com/apple-app-site-association
 * + com.apple.developer.associated-domains في App.entitlements) — تفتح
 * التطبيق مباشرة على المسار المطلوب بدل متصفح خارجي. نستخدم pushState +
 * حدث popstate صناعي بدل window.location.href كي يلتقطه المُوجِّه
 * (wouter يستمع لـpopstate) بلا إعادة تحميل كاملة للـWebView، التي قد لا
 * تُصيَّر المسار بشكل صحيح خارج تحميل index.html الأول.
 */
if (isNative) {
  import("@capacitor/app").then(({ App: CapApp }) => {
    CapApp.addListener("appUrlOpen", ({ url }) => {
      void Promise.all([
        import("@/lib/sync-engine"),
        import("@/lib/native-deep-link"),
      ]).then(([{ mapShareOrDeepLink }, { shouldNavigateNativeDeepLink }]) => {
        // خريطة الروابط العميقة: تمنع staging/open-redirect وتوحّد content://
        const mapped = mapShareOrDeepLink(url);
        const path = mapped.ok ? mapped.path : null;
        const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (shouldNavigateNativeDeepLink(current, path) && path) {
          // path is always same-origin relative — never pushState a www absolute URL
          if (path.startsWith("/") && !path.startsWith("//")) {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }
        }
      });
    });
  }).catch(() => {});
}
