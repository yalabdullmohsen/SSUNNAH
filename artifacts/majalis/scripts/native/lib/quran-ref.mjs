/**
 * تحقق آية من Tanzil المحلي (public/data/quran): هل النص المُقتبَس موجود حرفيًا (بتطبيع التشكيل) داخل الآيات المُحال إليها؟
 * المرجع: «اسم السورة: ن» أو «ن-م» (أرقام عربية أو هندية). لا يعدّل أي نص.
 */
import fs from "node:fs";

const N = (s) => String(s || "").normalize("NFKD").replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ى/g, "ي").replace(/ة/g, "ت").replace(/[^ء-ي]/g, "").replace(/[اويء]/g, "").replace(/(.)\1+/g, "$1");
const strip = (s) => s.replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/^سورة\s+/, "").replace(/ٱ/g, "ا").replace(/^ال (?=عمران)/, "آل ").trim();
/* مفتاح اسم السورة: يحفظ الحروف كلها (تطبيع N يُسقط الألف والواو والياء فيصادم النساء/الناس والأنبياء/النبأ) */
const K = (s) => s.normalize("NFKD").replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, "");
const digits = (s) => String(s).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export function makeQuranVerifier(dataDir) {
  const byName = new Map();
  for (let s = 1; s <= 114; s++) {
    const j = JSON.parse(fs.readFileSync(`${dataDir}/quran/surah-${String(s).padStart(3, "0")}.json`, "utf8"));
    byName.set(K(strip(j.name)), j.ayahs);
  }
  /** true إن كان النص جزءًا حرفيًا من الآيات المُحال إليها؛ وإلا نص السبب. */
  return function verify(ref, text) {
    const m = digits(ref).match(/^(.+?)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
    if (!m) return "مرجع آية غير مفهوم";
    const ayahs = byName.get(K(strip(m[1])));
    if (!ayahs) return "سورة غير معروفة";
    const a = +m[2], b = m[3] ? +m[3] : a;
    const sel = ayahs.filter((x) => x.numberInSurah >= a && x.numberInSurah <= b);
    if (!sel.length || sel.length !== b - a + 1) return "آية خارج السورة";
    const hay = N(sel.map((x) => x.text).join(" "));
    /* الاقتباس المتقطّع بـ«...» يُتحقق منه مقطعًا مقطعًا */
    const segs = String(text).split(/\.{2,}|…/).map(N).filter(Boolean);
    if (!segs.length || segs.some((g) => g.length < 3) || N(text).length < 6) return "نص قصير لا يُتحقق منه";
    return segs.every((g) => hay.includes(g)) ? true : "نص الآية لا يطابق Tanzil";
  };
}
