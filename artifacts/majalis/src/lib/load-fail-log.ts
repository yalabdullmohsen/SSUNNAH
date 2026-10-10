/**
 * سجل أسباب فشل تحميل الغلاف: صفحة native-load-error (أصل محلي) تمرّر السبب في الرابط
 * عند «إعادة المحاولة» (nlf)، فنحفظه هنا ليظهر في شاشة ⓘ التشخيصية. لا يُرسَل لأي خادم.
 */
const KEY = "mj.load-fail-log";
const MAX = 10;

export type LoadFailEntry = { code: string; at: number };

export function readLoadFailLog(): LoadFailEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((e) => e && typeof e.code === "string").slice(-MAX) : [];
  } catch {
    return [];
  }
}

/** يلتقط nlf=<code>.<epochMs> من الرابط الحالي ويحفظه ثم يمسحه من الرابط. */
export function captureLoadFailFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    const v = url.searchParams.get("nlf");
    if (!v) return;
    const [code, ts] = v.split(".");
    if (/^[A-Z0-9-]{1,24}$/.test(code || "")) {
      const log = readLoadFailLog();
      log.push({ code, at: Number(ts) || Date.now() });
      localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX)));
    }
    url.searchParams.delete("nlf");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch { /* تجاهل */ }
}
