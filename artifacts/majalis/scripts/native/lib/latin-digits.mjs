// توحيد الأرقام اللاتينية في حقول المصدر عند التصدير (قاعدة يوسف: لا أرقام هندية في سطور المصدر). لا يمسّ نص القرآن ولا أي حقل غير مصدر.
export const SOURCE_KEYS = new Set(["source", "sources", "source_url", "sourceUrl", "reference", "references", "ref", "citation", "citations"]);
const MAP = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };
export const toLatinDigits = (s) => s.replace(/[٠-٩۰-۹]/g, (c) => MAP[c]);
const deep = (x) => (typeof x === "string" ? toLatinDigits(x) : Array.isArray(x) ? x.map(deep) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deep(v)])) : x);
export const latinizeSources = (x, inSource = false) =>
  Array.isArray(x) ? x.map((i) => latinizeSources(i, inSource))
    : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, SOURCE_KEYS.has(k) ? deep(v) : latinizeSources(v, false)]))
      : x;
