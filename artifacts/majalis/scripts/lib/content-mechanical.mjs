/**
 * إصلاحات محتوى آلية بحتة (تدقيق ن8): كل تحويل يعمل على قيمة نصية واحدة ولا يمسّ إلا نمطه.
 * يُطبَّق على لفظ JSON الخام (بين علامتي التنصيص) فلا يتغيّر تنسيق الملف ولا الهروب.
 */

/** فراغ يحوي U+200F (مع ما يجاوره من مسافات) → مسافة واحدة بين كلمتين، ولا شيء عند علامة فتح/إغلاق أو طرف النص. */
const OPEN = new Set(["«", '"', "(", "{", "[", "\\"]);
const CLOSE = new Set([".", "…", "»", ")", "}", "]", "،", "؛", ",", "\\", '"', "؟", "!", ":"]);

export function stripRlm(s) {
  return s.replace(/[\s‏]*‏[\s‏]*/g, (gap, at, all) => {
    const prev = all[at - 1];
    const next = all[at + gap.length];
    if (prev === undefined || next === undefined) return "";
    if (OPEN.has(prev) || CLOSE.has(next)) return "";
    return " ";
  });
}

/** يطبّق تحويلًا على كل لفظ نصي في JSON خام دون إعادة تسلسل الملف. */
export function mapJsonStrings(raw, fn) {
  return raw.replace(/"((?:[^"\\]|\\.)*)"/g, (lit, body, at) => `"${fn(body, at)}"`);
}

/** الهيكل بعد إسقاط ما يحق للتحويل لمسه: يجب أن يتطابق قبل وبعد. */
export const RLM_SKELETON = (s) => s.replace(/[\s‏]/g, "");

/** الأرقام الهندية (٠-٩ و۰-۹) → لاتينية، خارج ﴿…﴾ فقط (نص الآيات لا يُمسّ؛ ﴿ بلا إغلاق تحمي ما بعدها). */
const QURAN_SPAN = /(﴿[^﴾]*(?:﴾|$))/;
const toLatin = (s) => s.replace(/[٠-٩]/g, (c) => c.charCodeAt(0) - 0x660).replace(/[۰-۹]/g, (c) => c.charCodeAt(0) - 0x6f0);

export function latinDigits(s) {
  return s
    .split(QURAN_SPAN)
    .map((part, i) => (i % 2 ? part : toLatin(part)))
    .join("");
}

/** الهيكل: كل الأرقام لاتينية + مقاطع ﴿…﴾ حرفيًا كما هي. */
export const DIGITS_SKELETON = (s) => `${toLatin(s)}\u0000${s.split(QURAN_SPAN).filter((_, i) => i % 2).join("\u0000")}`;
