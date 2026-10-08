/**
 * علم `tasmee_v2` — التسميع داخل المصحف. مفعّل افتراضيًا، وله مفتاح إيقاف طارئ محلي
 * (`localStorage["ssunnah-tasmee-v2"] = "0"`) أو عبر متغير البناء VITE_TASMEE_V2=0.
 */
export const TASMEE_V2_FLAG_KEY = "ssunnah-tasmee-v2";

export function isTasmeeV2Enabled(): boolean {
  try {
    if ((import.meta.env as Record<string, string | undefined> | undefined)?.VITE_TASMEE_V2 === "0") return false;
  } catch {
    /* بيئة بلا import.meta.env */
  }
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem(TASMEE_V2_FLAG_KEY) === "0") {
      return false;
    }
  } catch {
    /* التخزين غير متاح */
  }
  return true;
}

/** هل يطلب الرابط وضع التسميع؟ (`?tasmee=1`) */
export function wantsTasmeeFromSearch(search: string): boolean {
  const qs = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return qs.get("tasmee") === "1";
}
