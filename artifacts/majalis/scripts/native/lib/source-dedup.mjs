// سطر المصدر يحمل المرجع (راوٍ ورقم) ولفظ الحديث بالتشكيل شاهدًا حين يختلف عن نص الفائدة.
// إن كان اللفظ المقتبس هو نص الفائدة نفسه (تطابق ≥ 90% بعد تجريد التشكيل والترقيم) فعرضه مرتين تكرار: يُحذف الاقتباس من السطر المعروض ويبقى المرجع. لا يمسّ نص الفائدة ولا ملفات المحتوى.
const norm = (s) => String(s ?? "").replace(/[ً-ٰٟـ]/g, "").replace(/[^\p{L}\p{N}]/gu, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
export const COVER = 0.9;
export const isDuplicateQuote = (text, quote) => { const t = norm(text), q = norm(quote); return t.length >= 12 && q.includes(t) && t.length / q.length >= COVER; };
export const dedupSourceQuote = (text, source) => {
  const s = String(source ?? "");
  const out = s.replace(/\s*[:：]?\s*«([^»]+)»/g, (m, q) => (isDuplicateQuote(text, q) ? "" : m)).replace(/[\s،؛:]+$/u, "");
  return out;
};
