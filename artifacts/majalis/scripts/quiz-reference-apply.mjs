#!/usr/bin/env node
/**
 * يطبّق مقترحات مراجع [{k:"<ملف>#<id>",type:"quran"|"bukhari",ref,words:[..]}] على public/data/quiz بعد تحقق حرفي:
 * الآية/الحديث موجودان في Tanzil/البخاري المحليين، وكل words (≥4 حروف) تظهر في نصهما بالتطبيع نفسه.
 * يكتب reference ثم explanation بنص الآية/الحديث حرفيًا إن خلا الشرح (شرط حياة السؤال)، ولا يغيّر السؤال والجواب.
 * الاستعمال: node scripts/quiz-reference-apply.mjs <proposals.json> [--write]
 */
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../public/data");
const write = process.argv.includes("--write");
const N = (s) => String(s || "").normalize("NFKD").replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ى/g, "ي").replace(/ة/g, "ت").replace(/[^ء-ي]/g, "").replace(/[اويء]/g, "").replace(/(.)\1+/g, "$1");
const strip = (s) => s.replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/^سورة\s+/, "").replace(/ٱ/g, "ا").replace(/^ال (?=عمران)/, "آل ").trim();
const ayahs = new Map();
for (let s = 1; s <= 114; s++) {
  const j = JSON.parse(fs.readFileSync(`${root}/quran/surah-${String(s).padStart(3, "0")}.json`, "utf8"));
  for (const a of j.ayahs) ayahs.set(`${N(strip(j.name))}:${a.numberInSurah}`, { label: `${strip(j.name)}: ${a.numberInSurah}`, text: a.text });
}
const bukhari = new Map(JSON.parse(fs.readFileSync(`${root}/hadith/bukhari.json`, "utf8")).hadiths.map((h) => [String(h.n), h.t]));
const props = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const byFile = new Map();
let bad = 0;
for (const p of props) {
  const [f, id] = String(p.k).split("#");
  let label, text;
  if (p.type === "quran") {
    const m = String(p.ref).match(/^(.+?)\s*:\s*(\d+)$/);
    const a = m && ayahs.get(`${N(strip(m[1]))}:${+m[2]}`);
    if (a) { label = a.label; text = a.text; }
  } else if (p.type === "bukhari" && bukhari.has(String(p.ref))) {
    label = `صحيح البخاري: ${p.ref}`; text = bukhari.get(String(p.ref));
  }
  const words = (p.words || []).map(N).filter((w) => w.length >= 3);
  if (!label || words.length < 2 || !words.every((w) => N(text).includes(w))) { bad++; continue; }
  if (!byFile.has(f)) byFile.set(f, new Map());
  byFile.get(f).set(id, { label, text, type: p.type });
}
let applied = 0;
for (const [f, m] of byFile) {
  const file = `${root}/quiz/${f}`;
  const raw = fs.readFileSync(file, "utf8");
  const arr = JSON.parse(raw);
  const ind = JSON.stringify(arr) === raw.trim() ? 0 : JSON.stringify(arr, null, 2) === raw.trim() ? 2 : -1;
  if (ind < 0) continue;
  let ch = 0;
  for (const q of arr) {
    const v = m.get(String(q.id));
    if (!v || q.reference) continue;
    q.reference = v.label;
    q.documentation_status = "sourced";
    if (!String(q.explanation || "").trim()) q.explanation = v.type === "quran" ? `نص الآية (Tanzil): ﴿${v.text}﴾ [${v.label}]` : `نص الحديث (${v.label}): ${v.text}`;
    ch++;
  }
  applied += ch;
  if (ch && write) fs.writeFileSync(file, JSON.stringify(arr, null, ind) + (raw.endsWith("\n") ? "\n" : ""));
}
console.log(JSON.stringify({ proposals: props.length, rejected: bad, applied, write }));
