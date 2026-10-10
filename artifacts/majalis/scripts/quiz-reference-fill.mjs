#!/usr/bin/env node
/**
 * يملأ reference لأسئلة public/data/quiz التي بلا مرجع، حين يطابق اقتباسٌ فيها آيةً واحدة في Tanzil
 * (مفاتيح التطبيع نفسها لبوابة الاقتباسات) أو حديثًا في أصول البخاري/مسلم المحلية. لا يخمّن ولا يغيّر نص السؤال.
 * الاستعمال: node scripts/quiz-reference-fill.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../public/data");
const write = process.argv.includes("--write");
const N = (s) => String(s || "").normalize("NFKD").replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ى/g, "ي").replace(/ة/g, "ت").replace(/[^ء-ي]/g, "").replace(/[اويء]/g, "").replace(/(.)\1+/g, "$1");
const strip = (s) => s.replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/^سورة\s+/, "").replace(/ٱ/g, "ا").replace(/^ال (?=عمران)/, "آل ").trim();
const ayahs = [];
for (let s = 1; s <= 114; s++) {
  const j = JSON.parse(fs.readFileSync(`${root}/quran/surah-${String(s).padStart(3, "0")}.json`, "utf8"));
  for (const a of j.ayahs) ayahs.push({ name: strip(j.name), a: a.numberInSurah, n: N(a.text) });
}
const hadith = [];
for (const [f, name] of [["bukhari", "صحيح البخاري"], ["muslim", "صحيح مسلم"]])
  for (const h of JSON.parse(fs.readFileSync(`${root}/hadith/${f}.json`, "utf8")).hadiths) hadith.push({ name, n: h.n, t: N(h.t) });

const QURAN_SEG = /[﴿{«"]([^﴾}»"]{12,})[﴾}»"]/g;
const HADITH_SEG = /[«"“]([^»"”]{20,})[»"”]/g;
function refFor(q) {
  const t = [q.question, q.answer, q.explanation].join(" ");
  const refs = new Set();
  for (const m of t.matchAll(QURAN_SEG)) {
    const sg = N(m[1]);
    if (sg.length < 14) continue;
    const h = ayahs.filter((x) => x.n.includes(sg));
    if (h.length === 1) refs.add(`${h[0].name}: ${h[0].a}`);
  }
  if (refs.size) return [...refs].join("؛ ");
  for (const m of t.matchAll(HADITH_SEG)) {
    const sg = N(m[1]);
    if (sg.length < 16) continue;
    const h = hadith.filter((x) => x.t.includes(sg));
    if (h.length && h.length <= 3) {
      const b = h.filter((x) => x.name === "صحيح البخاري").map((x) => x.n);
      /* ترقيم مسلم المحلي تسلسلي لا ترقيم الكتاب: يُذكر الكتاب دون رقم */
      const parts = [];
      if (b.length) parts.push(`صحيح البخاري: ${[...new Set(b)].join("، ")}`);
      if (b.length && h.some((x) => x.name === "صحيح مسلم")) parts.push("صحيح مسلم");
      if (parts.length) refs.add(parts.join("؛ "));
    }
  }
  return [...refs].join("؛ ") || null;
}
/* تصنيف حتمي بحسب القسم: لا يغيّر الحياة ولا يدّعي توثيقًا (غير المطابَق نصيًا يبقى بلا مرجع) */
const CLASS_BY_SECTION = [
  [/تجويد/, "tajweed"],
  [/قرآن/, "quran"],
  [/^الحديث|الطب النبوي/, "hadith"],
  [/فقه|عقيدة|طهارة|صلاة|زكاة|صيام|^الحج|حج والعمرة|فرائض|أسماء|أذكار/, "fiqh_aqeedah"],
  [/تاريخ|سيرة|أنبياء|صحابة|فتوحات|علماء|صالحون/, "history"],
];
const classOf = (sec) => CLASS_BY_SECTION.find(([re]) => re.test(sec))?.[1] ?? "other";
let total = 0, filled = 0, files = 0;
const dir = `${root}/quiz`;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "manifest.json")) {
  const raw = fs.readFileSync(`${dir}/${f}`, "utf8");
  const arr = JSON.parse(raw);
  const ind = JSON.stringify(arr) === raw.trim() ? 0 : JSON.stringify(arr, null, 2) === raw.trim() ? 2 : -1;
  let ch = 0, cl = 0;
  for (const q of arr) {
    if (q.reference) continue;
    total++;
    if (!q.source_class) { q.source_class = classOf(String(q.section)); cl++; }
    const r = refFor(q);
    /* المرجع يُحيي السؤال (content-audit-wave3-gate): لا يُحيى بلا شرح */
    if (r && (/^demo[-_]/i.test(String(q.id)) || String(q.explanation || "").trim())) { q.reference = r; q.documentation_status = "sourced"; ch++; }
  }
  filled += ch;
  /* ملف edu منسَّق على أسطر: تصنيفه يتجاوز حد 400 سطر محذوف فيُؤجَّل لـPR مستقل */
  if (ind === 2 && !ch) continue;
  if (ch || cl) {
    files++;
    if (ind < 0) { console.error("تنسيق الملف غير مضغوط، تخطّي:", f); continue; }
    if (write) fs.writeFileSync(`${dir}/${f}`, JSON.stringify(arr, null, ind) + (raw.endsWith("\n") ? "\n" : ""));
  }
}
console.log(JSON.stringify({ unreferenced: total, filled, files, write }));
