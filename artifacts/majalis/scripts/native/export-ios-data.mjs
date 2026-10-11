#!/usr/bin/env node
/**
 * يصدّر نسخة مدققة من البيانات المحزومة إلى ios-native/Data مع MANIFEST.json (sha256 لكل ملف).
 * يرفض العنصر الضعيف (بلا نص/مرجع/شرح، ضعيف أو موضوع، demo) والمحجوز في content/content-hold.json.
 * القرآن: ملفات Tanzil (public/data/quran) تُنسخ بايتًا بايتًا بعد التحقق من 114 سورة و6236 آية. لا تعديل لأي نص.
 * الأذكار: لا تُصدَّر إلا بـ --adhkar-json <صفوف verified_adhkar_items> وبشرط verification_status=verified وgrade ومصدر.
 * المواقيت: الحساب داخل التطبيق (محمي)؛ يُحزم world-cities.json فقط.
 * الاستعمال: node scripts/native/export-ios-data.mjs [--out <dir>] [--adhkar-json <file>] [--check]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const appRoot = path.resolve(import.meta.dirname, "../..");
const data = `${appRoot}/public/data`;
const out = path.resolve(opt("--out") || `${appRoot}/../../ios-native/Data`);
const check = args.includes("--check");

const holds = new Set(JSON.parse(fs.readFileSync(`${appRoot}/content/content-hold.json`, "utf8")).holds.map((h) => String(h.id)));
const rej = {};
const reject = (area, why) => { rej[area] ??= {}; rej[area][why] = (rej[area][why] || 0) + 1; };
const files = [];
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const put = (rel, buf) => {
  buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  files.push({ path: rel, bytes: buf.length, sha256: sha(buf) });
  if (check) return;
  fs.mkdirSync(path.dirname(`${out}/${rel}`), { recursive: true });
  fs.writeFileSync(`${out}/${rel}`, buf);
};
const json = (rel, v) => put(rel, JSON.stringify(v));
const rd = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const held = (...ids) => ids.some((i) => i != null && holds.has(String(i)));
const pad = (n) => String(n).padStart(3, "0");
const counts = {};

if (!check) fs.rmSync(out, { recursive: true, force: true });

/* القرآن (Tanzil فقط) */
let ayahTotal = 0;
for (let s = 1; s <= 114; s++) {
  const f = `${data}/quran/surah-${pad(s)}.json`;
  const buf = fs.readFileSync(f);
  const j = JSON.parse(buf);
  if (j.number !== s || !Array.isArray(j.ayahs) || j.ayahs.length !== j.numberOfAyahs || j.ayahs.some((a, i) => a.numberInSurah !== i + 1 || !String(a.text || "").trim()))
    throw new Error(`سورة ${s} غير سليمة`);
  ayahTotal += j.ayahs.length;
  put(`quran/surah-${pad(s)}.json`, buf);
}
if (ayahTotal !== 6236) throw new Error(`عدد الآيات ${ayahTotal} ≠ 6236`);
counts.quranAyahs = ayahTotal;

/* التفسير: الميسّر والسعدي */
counts.tafsir = {};
for (const id of ["muyassar", "saadi"]) {
  let n = 0;
  for (let s = 1; s <= 114; s++) {
    const f = `${data}/tafsir/${id}/${pad(s)}.json`;
    const j = rd(f);
    const q = rd(`${data}/quran/surah-${pad(s)}.json`);
    const ks = Object.keys(j.ayahs);
    if (j.surah !== s || ks.some((k) => !(+k >= 1 && +k <= q.numberOfAyahs))) throw new Error(`تفسير ${id} سورة ${s}: مفتاح آية خارج النطاق`);
    for (let a = ks.length; a < q.numberOfAyahs; a++) reject(`tafsir-${id}`, "آية بلا تفسير في المصدر (فجوة موثّقة)");
    const clean = {};
    for (const k of ks) {
      if (!String(j.ayahs[k] || "").trim()) { reject(`tafsir-${id}`, "نص فارغ"); continue; }
      clean[k] = j.ayahs[k];
      n++;
    }
    json(`tafsir/${id}/${pad(s)}.json`, { ...j, ayahs: clean });
  }
  counts.tafsir[id] = n;
}
put("tafsir/tafsir-registry.json", fs.readFileSync(`${data}/tafsir/tafsir-registry.json`));

/* الحديث: البخاري ومسلم الكاملان (ترقيم مسلم تسلسلي محلي: لا يُستشهد به) + المصحّح من hadith-verified (صحيح فقط) */
counts.hadith = {};
for (const c of ["bukhari", "muslim"]) {
  const j = rd(`${data}/hadith/${c}.json`);
  const ok = [];
  for (const h of j.hadiths) {
    if (!String(h.t || "").trim()) { reject(`hadith-${c}`, "نص فارغ"); continue; }
    if (held(h.n, `${c}-${h.n}`)) { reject(`hadith-${c}`, "محجوز"); continue; }
    ok.push(h);
  }
  counts.hadith[c] = ok.length;
  json(`hadith/${c}.json`, { ...j, count: ok.length, hadiths: ok, ...(c === "muslim" ? { numberingNote: "sequential-local: never cite by n" } : {}) });
}
const hv = [];
for (const f of fs.readdirSync(`${data}/hadith-verified`).filter((x) => /^(sahih|daif|mawdu)-\d+\.json$/.test(x))) {
  for (const h of rd(`${data}/hadith-verified/${f}`)) {
    if (h.authenticity_class !== "sahih") { reject("hadith-verified", `درجة ${h.authenticity_class || "غير محددة"}`); continue; }
    if (!String(h.text || "").trim() || !String(h.source_name || "").trim() || !String(h.grade || "").trim()) { reject("hadith-verified", "نقص نص/مصدر/درجة"); continue; }
    if (held(h.id)) { reject("hadith-verified", "محجوز"); continue; }
    hv.push(h);
  }
}
counts.hadith.verifiedSahih = hv.length;
json("hadith/verified-sahih.json", hv);

/* الأذكار: من لقطة صفوف Supabase المعتمدة فقط */
const adh = [];
const adhFile = opt("--adhkar-json");
if (adhFile) {
  for (const r of rd(adhFile)) {
    if (r.deleted_at) { reject("adhkar", "محذوف"); continue; }
    if (r.verification_status !== "verified") { reject("adhkar", `حالة ${r.verification_status}`); continue; }
    if (!String(r.text || "").trim() || !String(r.source_name || r.reference || "").trim() || !String(r.grade || "").trim()) { reject("adhkar", "نقص نص/مصدر/درجة"); continue; }
    if (held(r.id)) { reject("adhkar", "محجوز"); continue; }
    adh.push(r);
  }
}
counts.adhkar = adh.length;
json("adhkar/verified-adhkar.json", adh);
put("adhkar/adhkar-fadl.json", fs.readFileSync(`${appRoot}/src/data/adhkar-fadl.json`));

/* المواقيت: مدن العالم فقط (الحساب في التطبيق) */
put("prayer/world-cities.json", fs.readFileSync(`${data}/prayer/world-cities.json`));

/* الأسئلة: الموثّقة (شرح+مرجع)، أو العامة غير الموثّقة (unsourced) إن لم تكن demo ولا محجوزة ولا فارغة — الأحكام الشرعية بلا مرجع محجوزة في content-hold */
const qdir = `${data}/quiz`;
let qn = 0;
const qchunks = [];
for (const f of fs.readdirSync(qdir).filter((x) => x.endsWith(".json") && x !== "manifest.json")) {
  const live = [];
  for (const q of rd(`${qdir}/${f}`)) {
    if (/^demo[-_]/i.test(String(q.id))) { reject("quiz", "demo"); continue; }
    if (held(q.id)) { reject("quiz", "محجوز"); continue; }
    if (!String(q.question || "").trim() || !String(q.answer || "").trim()) { reject("quiz", "سؤال/جواب فارغ"); continue; }
    if (q.documentation_status !== "unsourced") {
      if (!String(q.explanation || "").trim()) { reject("quiz", "بلا شرح"); continue; }
      if (!String(q.reference || "").trim()) { reject("quiz", "بلا مرجع"); continue; }
    }
    live.push(q);
  }
  if (live.length) { json(`quiz/${f}`, live); qchunks.push({ file: f, count: live.length }); qn += live.length; }
}
json("quiz/manifest.json", { total: qn, chunks: qchunks });
counts.quiz = qn;

json("MANIFEST.json", { version: 1, counts, rejected: rej, files: files.slice().sort((a, b) => a.path.localeCompare(b.path)) });
console.log(JSON.stringify({ out: check ? "(check)" : out, files: files.length, counts, rejected: rej }));
