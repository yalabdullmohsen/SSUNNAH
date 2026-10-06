/**
 * ثوابت دخولية «سُنّة» — ويب + Capacitor.
 *
 * عقد الإقلاع الواحد (Startup PR-3):
 *   Native LaunchScreen (لون فقط · فاتح/داكن)
 *   → Capacitor SplashScreen (طبقة صامتة بنفس اللون · تُخفى فور التسليح)
 *   → #mj-launch-splash (سطح لوني = LaunchScreen · بلا شعار/نص · مرة لكل إقلاع)
 *   → App Shell
 *
 * ممنوع: دخولية ثانية على Resume · Progress أصلي · Spinner · CTA · بيانات مستخدم.
 */

export const LAUNCH_SPLASH_ID = "mj-launch-splash";

/**
 * بلا تأخير اصطناعي: إن استقر الهيكل والخطوط يُسمح بالإخفاء فورًا
 * (التلاشي فقط عبر SPLASH_FADE_OUT_MS).
 */
export const SPLASH_MIN_VISIBLE_MS = 0;

/**
 * هدف LCP الليّن: يُسمح بالإخفاء مبكرًا إذا كانت الخطوط جاهزة (boot-ready / check).
 * السقف الصلب أطول لمنع FOUT عند بطء التحميل.
 */
export const SPLASH_LCP_SOFT_MS = 480;

/** السقف الصلب — انتظار خطوط الواجهة قبل كشف النص. */
export const SPLASH_MAX_VISIBLE_MS = 1_400;

/** مدة تلاشي الخروج (متزامنة مع CSS في index.html وboot.js) — عقد البرنامج: 120–180ms. */
export const SPLASH_FADE_OUT_MS = 160;

export const SPLASH_SESSION_KEY = "mj.launch-splash.session.v4";

/** يطابق LaunchBackground light + App Shell. */
export const SPLASH_BG_LIGHT = "#F8F6F1";

/** يطابق LaunchBackground dark + App Shell ليلي. */
export const SPLASH_BG_DARK = "#101614";

/** مسار الإقلاع الرسمي — مصدر حقيقة نصّي للبوابات. */
export const SPLASH_PIPELINE = [
  "native-launch-color",
  "capacitor-silent-cover",
  "html-surface-once",
  "app-shell",
] as const;
