// ن8 دفعة 7 — الباقي (قراءة فقط)
import fs from "node:fs"; import path from "node:path";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, writeJSON, ayahText, lcsAgainst, quran } from "./lib.mjs";
const issues = []; const add = (o) => issues.push(o);
const lang = (S, F, ref, obj, fields) => { for (const k of fields) if (typeof obj[k] === "string") for (const li of langIssues(obj[k])) add({ section: S, file: F, ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail }); };

// 1) المصحف
add({ section: "القرآن", file: "public/data/quran/surah-001.json", ref: "1:1", type: "رمز غير مرئي (U+FEFF/BOM) في أول نص البسملة", sev: "متوسط", fix: "إرث من مصدر Tanzil/AlQuran Cloud؛ يُحذف ويُحدَّث sha256 في manifest وPROTECTED_BYTE_LOCK — قرار المالك لأن الملف مقفول" });

// 2) الويدجيت
const W = JSON.parse(fs.readFileSync(`${ROOT}/src/data/widget-daily-pool.generated.json`, "utf8"));
const WF = "src/data/widget-daily-pool.generated.json";
const verified = new Map();
for (const f of fs.readdirSync(`${ROOT}/public/data/hadith-verified`).filter((f) => !f.includes("manifest"))) for (const h of JSON.parse(fs.readFileSync(`${ROOT}/public/data/hadith-verified/${f}`, "utf8"))) verified.set(h.id, h);
const SNAME = {}; for (const a of quran().ayahs) SNAME[a.s] = a.name;
let indicLabels = 0;
for (const a of W.ayahs) {
  const [s, n] = a.key.split(":").map(Number);
  const t = ayahText(s, n);
  if (!t) add({ section: "الويدجيت", file: WF, ref: a.id, type: "مرجع آية غير موجود", sev: "حرج", fix: a.key });
  else if (sk1(t) !== sk1(a.text)) { const r = lcsAgainst(a.text, t); if (r.ratio < 0.95) add({ section: "الويدجيت", file: WF, ref: a.id, type: "نص الآية لا يطابق المصحف", sev: "حرج", fix: `${a.key} (${Math.round(r.ratio * 100)}%)`, review: true }); }
  if (/[٠-٩]/.test(a.label || "")) indicLabels++;
  if (/سورة ال(انسان|اسراء|انعام|اعراف|انفال|احزاب|احقاف|انبياء|اعلى|انشقاق|انفطار|اخلاص)/.test(a.surah)) add({ section: "الويدجيت", file: WF, ref: a.id, type: "اسم سورة بلا همزة", sev: "تحسين", fix: a.surah });
}
if (indicLabels) add({ section: "الويدجيت", file: WF, ref: `${indicLabels} آية`, type: "أرقام هندية في label", sev: "تحسين", fix: "مثل «الانسان: ٣٠»؛ المولّد يكتب الأرقام الهندية — يُصلح في المولّد" });
for (const h of W.hadiths) {
  const src = verified.get(h.id);
  if (!h.source || !h.grade) add({ section: "الويدجيت", file: WF, ref: h.id, type: "حديث بلا مصدر/درجة", sev: "حرج", fix: "" });
  if (!src) add({ section: "الويدجيت", file: WF, ref: h.id, type: "حديث غير موجود في hadith-verified", sev: "متوسط", fix: "" });
  else if (sk1(src.text) !== sk1(h.text)) add({ section: "الويدجيت", file: WF, ref: h.id, type: "نص الويدجيت يختلف عن مصدره المعتمد", sev: "متوسط", fix: "" });
  if (/^(daif|mawdu)/.test(h.id) || /ضعيف|موضوع|لا أصل/.test(h.grade || "")) add({ section: "الويدجيت", file: WF, ref: h.id, type: "ضعيف/موضوع في الويدجيت", sev: "حرج", fix: h.grade });
  lang("الويدجيت", WF, h.id, h, ["text", "meaning", "source"]);
}
// ما رُصد في الدفعة 2 ويؤثر على الويدجيت
const b2 = JSON.parse(fs.readFileSync(new URL("./b2-coll.json", import.meta.url), "utf8")).concat(JSON.parse(fs.readFileSync(new URL("./b2-issues.json", import.meta.url), "utf8")));
const wids = new Set(W.hadiths.map((h) => h.id));
const hit = b2.filter((x) => wids.has(x.ref.split(" ")[0]) && x.sev !== "تحسين" && !/رمز غير مرئي/.test(x.type));
for (const x of hit) add({ section: "الويدجيت", file: WF, ref: x.ref.split(" ")[0], type: `موروث من الأحاديث: ${x.type}`, sev: x.sev, fix: x.fix });

// 3) بقايا الأذكار (ملفات TS — مسح نصي)
for (const f of ["src/lib/dhikr-phrase-reminders.ts", "src/lib/daily-ticker-dhikr.ts", "src/data/adhkar-reminder-categories.json"]) {
  const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, "utf8").split("\n");
  lines.forEach((l, i) => { if (/[؀-ۿ]/.test(l)) for (const li of langIssues(l.replace(/[A-Za-z_$][\w$]*/g, ""))) if (["رمز غير مرئي", "أرقام هندية", "تشكيل مكسور (حركة بلا حرف)", "تشكيل مكسور (حركة مكررة)"].includes(li.type)) add({ section: "الأذكار (بقايا)", file: f, ref: `س${i + 1}`, type: li.type, sev: "تحسين", fix: li.detail }); });
  const txt = lines.join("\n");
  const hasSrc = /source|grade|مصدر|رواه/.test(txt);
  if (!hasSrc) add({ section: "الأذكار (بقايا)", file: f, ref: "الملف", type: "أذكار بلا مصدر/درجة", sev: "متوسط", fix: "عبارات ذكر تظهر في الشريط/الإشعارات دون تخريج" });
}

// 4) إحصاءات القرآن
for (const f of ["ajaib", "alfaz", "bunya", "mawdoo", "suwar"]) {
  const F = `content/quran-stats/${f}.json`;
  const j = JSON.parse(fs.readFileSync(`${ROOT}/${F}`, "utf8")); const arr = Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || [];
  arr.forEach((x, i) => {
    const ref = `${x.id ?? i}`;
    if (!x.source?.book || !x.source?.ref) add({ section: "إحصاءات القرآن", file: F, ref, type: "مصدر ناقص", sev: "متوسط", fix: JSON.stringify(x.source || null) });
    lang("إحصاءات القرآن", F, ref, x, ["title", "text", "value", "note", "body", "summary"]);
    for (const k of ["text", "body", "note"]) for (const m of String(x[k] || "").matchAll(/﴿([^﴾]+)﴾/g)) { const r = findQuran(m[1]); if (!r.found && !r.tooShort && (r.prefixRatio ?? 0) < 0.6) add({ section: "إحصاءات القرآن", file: F, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: m[1].slice(0, 40), review: true }); }
  });
}
add({ section: "إحصاءات القرآن", file: "content/quran-stats/REVIEW.md", ref: "الترويسة", type: "المراجع «وكيل المحتوى» (مراجعة آلية) والحالة «معتمدة للعرض»", sev: "متوسط", fix: "أرقام الإحصاءات (عدد كلمات/حروف…) تحتاج مراجعة بشرية قبل وسمها معتمدة", review: true });

// 5) الإعجاز
const mdir = `${ROOT}/data/miracles`;
for (const f of fs.readdirSync(mdir, { recursive: true }).filter((f) => f.endsWith(".json"))) {
  const F = `data/miracles/${f}`; const j = JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")); const arr = Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || [];
  arr.forEach((x, i) => {
    const ref = `${x.id ?? x.slug ?? i}`;
    if (!x.sources?.length && !x.source && !x.reference) add({ section: "الإعجاز", file: F, ref, type: "بلا مصدر", sev: "متوسط", fix: "" });
    const all = JSON.stringify(x);
    for (const m of all.matchAll(/﴿([^﴾]+)﴾/g)) { const r = findQuran(m[1]); if (!r.found && !r.tooShort && (r.prefixRatio ?? 0) < 0.6) add({ section: "الإعجاز", file: F, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: m[1].slice(0, 40), review: true }); }
    lang("الإعجاز", F, ref, x, ["title", "summary", "body", "content", "description"]);
  });
}
add({ section: "الإعجاز", file: "data/miracles/zaghloul", ref: "القسم", type: "محتوى «الإعجاز العلمي» اجتهادي", sev: "متوسط", fix: "يحتاج تنبيهًا ظاهرًا أنه اجتهاد تفسيري لا قطعي، ومراجعة بشرية قبل الإطلاق", review: true });

// 6) المكتبة
const lib = JSON.parse(fs.readFileSync(`${ROOT}/src/data/library-catalog.json`, "utf8")); const L = Array.isArray(lib) ? lib : Object.values(lib).find(Array.isArray);
const authors = new Set((() => { const a = JSON.parse(fs.readFileSync(`${ROOT}/src/data/library-authors.json`, "utf8")); return (Array.isArray(a) ? a : Object.values(a).find(Array.isArray) || []).map((x) => x.id ?? x.slug); })());
const lids = {};
L.forEach((b, i) => {
  const ref = `${b.id ?? i}`; lids[b.id] = (lids[b.id] || 0) + 1;
  if (!b.title || !(b.author || b.authorId || b.author_id)) add({ section: "المكتبة", file: "src/data/library-catalog.json", ref, type: "حقل ناقص (عنوان/مؤلف)", sev: "متوسط", fix: "" });
  const aid = b.authorId ?? b.author_id; if (aid && authors.size && !authors.has(aid)) add({ section: "المكتبة", file: "src/data/library-catalog.json", ref, type: "مؤلف غير موجود في library-authors", sev: "متوسط", fix: aid });
  for (const k of ["url", "pdfUrl", "sourceUrl", "link"]) if (b[k] && !/^https:\/\//.test(b[k])) add({ section: "المكتبة", file: "src/data/library-catalog.json", ref, type: `رابط غير صالح (${k})`, sev: "تحسين", fix: b[k] });
  lang("المكتبة", "src/data/library-catalog.json", ref, b, ["title", "author", "description", "summary"]);
});
for (const [id, n] of Object.entries(lids)) if (n > 1) add({ section: "المكتبة", file: "src/data/library-catalog.json", ref: id, type: "معرّف مكرر", sev: "متوسط", fix: `${n}` });

writeJSON("b7-issues.json", issues);
const s = {}, t = {}; issues.forEach((x) => { s[x.sev] = (s[x.sev] || 0) + 1; t[x.section + "|" + x.type] = (t[x.section + "|" + x.type] || 0) + 1; });
console.log({ widgetAyahs: W.ayahs.length, widgetHadiths: W.hadiths.length, library: L.length }, s, t);
