/**
 * عنوان الخادم للحزمة المحلية (local-bundle) — برنامج iOS الكامل، المرحلة 1.
 *
 * في وضع remote-shell أصل الصفحة هو https://www.ssunnah.com فتعمل المسارات النسبية `/api/...` كما هي.
 * في الحزمة المحلية يصبح الأصل `capacitor://localhost` فتفشل تلك الطلبات؛ لذلك تُعاد كتابة
 * المسارات النسبية الخاصة بالخادم (`/api/`) إلى العنوان المطلق مرة واحدة هنا بدل لمس كل موضع استدعاء.
 * ما عداها (`/data`, `/fonts`, الأصول) يبقى محليًا من الحزمة.
 */
export const NATIVE_API_ORIGIN = "https://www.ssunnah.com";

/** مسارات الخادم التي تُوجَّه إلى الأصل البعيد. */
const SERVER_PATH_PREFIXES = ["/api/"] as const;

/** يعيد العنوان المطلق لمسار خادم نسبي، وإلا يعيده كما هو. */
export function resolveNativeApiUrl(input: string, origin: string = NATIVE_API_ORIGIN): string {
  if (typeof input !== "string") return input;
  return SERVER_PATH_PREFIXES.some((p) => input.startsWith(p)) ? `${origin}${input}` : input;
}

let installed = false;

/**
 * يلفّ fetch العام: يعيد كتابة `/api/*` النسبي إلى الأصل البعيد.
 * يُستدعى من main.tsx قبل أي طلب، ومحروس بـ VITE_TARGET === "native" فيُحذف من حزمة الويب.
 */
export function installNativeApiBase(): void {
  if (installed || typeof window === "undefined" || typeof window.fetch !== "function") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string") return original(resolveNativeApiUrl(input), init);
    if (input instanceof URL && input.origin === window.location.origin) {
      const next = resolveNativeApiUrl(input.pathname + input.search);
      return next === input.pathname + input.search ? original(input, init) : original(next, init);
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      const u = new URL(input.url);
      if (u.origin === window.location.origin) {
        const rel = u.pathname + u.search;
        const next = resolveNativeApiUrl(rel);
        if (next !== rel) return original(new Request(next, input), init);
      }
    }
    return original(input, init);
  };
}
