#!/usr/bin/env node
/**
 * يطبّق مقترحات مراجع [{k:"<ملف>#<id>",type:"quran"|"bukhari"|"muslim",ref,words:[..]}] على public/data/quiz بعد تحقق حرفي:
 * الآية/الحديث موجودان في Tanzil/البخاري/مسلم المحليين، وكل words (≥4 حروف) تظهر في نصهما بالتطبيع نفسه.
 * مسلم بترقيم عبد الباقي (الحقل a في hadith/muslim.json). ويقبل المقترح refs:[{type,ref,words}] لأكثر من مرجع (كلها تُتحقق).
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
/* مسلم: ترقيم عبد الباقي (a)، وقد يتعدد السجل للرقم الواحد بطرقه فيُختار ما تطابقه الكلمات */
const muslim = new Map();
for (const h of JSON.parse(fs.readFileSync(`${root}/hadith/muslim.json`, "utf8")).hadiths) {
  if (h.a == null) continue;
  const key = String(Math.floor(h.a));
  if (!muslim.has(key)) muslim.set(key, []);
  muslim.get(key).push(h.t);
}
function resolve(p) {
  const words = (p.words || []).map(N).filter((w) => w.length >= 3);
  if (words.length < 2) return null;
  const ok = (t) => words.every((w) => N(t).includes(w));
  if (p.type === "quran") {
    const m = String(p.ref).match(/^(.+?)\s*:\s*(\d+)$/);
    const a = m && ayahs.get(`${N(strip(m[1]))}:${+m[2]}`);
    return a && ok(a.text) ? { label: a.label, text: a.text, type: "quran" } : null;
  }
  if (p.type === "bukhari") {
    const t = bukhari.get(String(p.ref));
    return t && ok(t) ? { label: `صحيح البخاري: ${p.ref}`, text: t, type: "bukhari" } : null;
  }
  if (p.type === "muslim") {
    const t = (muslim.get(String(p.ref)) || []).find(ok);
    return t ? { label: `صحيح مسلم: ${p.ref}`, text: t, type: "muslim" } : null;
  }
  return null;
}
const props = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const byFile = new Map();
let bad = 0;
for (const p of props) {
  const [f, id] = String(p.k).split("#");
  const rs = (p.refs || [p]).map(resolve);
  if (!rs.length || rs.some((r) => !r)) { bad++; console.error("مرفوض:", p.k); continue; }
  if (!byFile.has(f)) byFile.set(f, new Map());
  byFile.get(f).set(id, rs);
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
    q.reference = v.map((r) => r.label).join("؛ ");
    q.documentation_status = "sourced";
    if (!String(q.explanation || "").trim()) q.explanation = v.map((r) => (r.type === "quran" ? `نص الآية (Tanzil): ﴿${r.text}﴾ [${r.label}]` : `نص الحديث (${r.label}): ${r.text}`)).join("\n");
    ch++;
  }
  applied += ch;
  if (ch && write) fs.writeFileSync(file, JSON.stringify(arr, null, ind) + (raw.endsWith("\n") ? "\n" : ""));
}
console.log(JSON.stringify({ proposals: props.length, rejected: bad, applied, write }));
