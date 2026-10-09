/**
 * ملف إعداد حي من الموقع (يُغيَّر بلا بناء جديد): على الجهاز عبر NATIVE_API_ORIGIN، بلا ذاكرة مؤقتة.
 * أي تعذّر (شبكة/مهلة/JSON) = null، والمستهلك يقرّر القيمة الآمنة.
 */
import { NATIVE_API_ORIGIN } from "@/lib/native-api-base";

export async function fetchLiveJson(path: string, native: boolean, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${native ? NATIVE_API_ORIGIN : ""}${path}?t=${Date.now()}`, {
      cache: "no-store",
      signal: ctrl.signal,
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
