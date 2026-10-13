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
import os from "node:os";
import { execFileSync } from "node:child_process";

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
const written = new Set();
const put = (rel, buf) => {
  if (written.has(rel)) throw new Error(`مسار مكرَّر في التصدير: ${rel} (وحدتان تكتبانه)`);
  written.add(rel);
  buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  files.push({ path: rel, bytes: buf.length, sha256: sha(buf) });
  if (check) return;
  fs.mkdirSync(path.dirname(`${out}/${rel}`), { recursive: true });
  fs.writeFileSync(`${out}/${rel}`, buf);
};
const json = (rel, v) => put(rel, JSON.stringify(v));
const EMBEDDED = { source_origin: "site-embedded", review_status: "pending-owner-review" };
const rd = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const held = (...ids) => ids.some((i) => i != null && holds.has(String(i)));
const pad = (n) => String(n).padStart(3, "0");
const counts = {};
let mushafSources = {};

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

/* الأربعون النووية: ARBAEEN_NAWAWI كما في الموقع (id,title,text,explanation,benefits,source)؛ ما بلا نص أو مصدر يُرفض */
{
  const { loadConsts } = await import("./lib/ts-literal.mjs");
  const rows = [];
  for (const h of loadConsts(`${appRoot}/src/lib/arbaeen-nawawi-seed.ts`)("ARBAEEN_NAWAWI")) {
    if (!String(h.text || "").trim() || !String(h.source || "").trim()) { reject("hadith-arbaeen-nawawi", "نقص نص/مصدر"); continue; }
    if (held(h.id, `arbaeen-nawawi-${h.id}`)) { reject("hadith-arbaeen-nawawi", "محجوز"); continue; }
    rows.push({ ...h, ...EMBEDDED });
  }
  counts.hadith.arbaeenNawawi = rows.length;
  json("hadith/arbaeen-nawawi.json", rows);
}

/* نصوص مضمَّنة في كود الموقع بلا درجة/مراجعة: تمرير حرفي (بقرار المالك 2026-10-12) مع وسمين فقط، وحقل source الأصلي لا يُمسّ */
{
  const { loadConsts } = await import("./lib/ts-literal.mjs");
  const mark = (rows) => rows.map((r) => ({ ...r, ...EMBEDDED }));
  const du = loadConsts(`${appRoot}/src/pages/worship/ui/DuasView.tsx`);
  /* عناوين تصنيفات الأذكار حرفيًا من ADHKAR_CATEGORIES (id/name/slug فقط؛ لا نص ذكر) لتعرضها شاشة /adhkar بدل المعرّف الخام */
  json("adhkar/categories.json", loadConsts(`${appRoot}/src/lib/adhkar-seed.ts`)("ADHKAR_CATEGORIES").map(({ id, name, slug }) => ({ id, name, slug })));
  json("adhkar/duas.json", { categories: du("CATEGORIES"), duas: mark(du("DUAS")) });
  counts.adhkar ??= {}; counts.adhkar.duas = du("DUAS").length;
  const wa = loadConsts(`${appRoot}/src/views/WasayaNabawiyyaPage.tsx`);
  json("hadith/wasaya-nabawiyya.json", {
    kabira: mark(wa("WASAYA_KABIRA")), khasisa: mark(wa("WASAYA_KHASISA")),
    ummah: mark(wa("WASAYA_UMMA")), amal: mark(wa("AMAL_LIST").map((text) => ({ text }))),
  });
  counts.hadith.wasayaNabawiyya = wa("WASAYA_KABIRA").length + wa("WASAYA_KHASISA").length + wa("WASAYA_UMMA").length;
}

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
counts.adhkar = { ...(typeof counts.adhkar === "object" ? counts.adhkar : {}), total: adh.length };
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

/* المصحف الأصلي (SwiftUI): بيانات صفحات QPC V2 الحالية + خطوطها مُعاد تغليفها TTF — لا بيانات ولا خطوط جديدة */
{
  const q2 = `${data}/quran-v2`;
  const chapters = rd(`${q2}/chapters.json`);
  const chById = new Map(chapters.map((c) => [c.id, c]));
  const surahs = chapters.map((c) => ({ id: c.id, name: c.name_arabic, ayahs: c.verses_count, firstPage: c.pages[0], lastPage: c.pages[1], place: c.revelation_place, bismillahPre: c.bismillah_pre }));
  const juzStart = {};
  const ayahPage = {};
  for (let p = 1; p <= 604; p++) {
    const verses = rd(`${q2}/pages/page-${pad(p)}.json`);
    const lines = new Map();
    const starts = new Map();
    for (const v of verses) {
      const key = v.verse_key;
      if (ayahPage[key] === undefined) ayahPage[key] = p;
      juzStart[v.juz_number] ??= p;
      // 2:181 في مصدر quran-v2 بلا كلمة من نوع end؛ آخر كلمة فيها هي رمز العلامة نفسه (التالي مباشرةً لما قبله) فتُعلَّم كغيرها دون مسّ الرمز أو النص
      const noEnd = !v.words.some((w) => w.char_type_name === "end");
      for (const [wi, w] of v.words.entries()) {
        if (!lines.has(w.line_number)) lines.set(w.line_number, []);
        const isEnd = w.char_type_name === "end" || (noEnd && wi === v.words.length - 1);
        lines.get(w.line_number).push({ id: w.id, c: w.code_v2, v: key, ...(isEnd ? { e: 1 } : {}) });
      }
      if (v.verse_number === 1 && !starts.has(Number(key.split(":")[0]))) starts.set(Number(key.split(":")[0]), Math.min(...v.words.map((w) => w.line_number)));
    }
    const used = [...lines.keys()].sort((a, b) => a - b);
    const rows = [];
    let prev = 0;
    for (const ln of used) {
      const gap = ln - prev - 1;
      const startSurah = [...starts.entries()].find(([, fl]) => fl === ln)?.[0];
      const ch = startSurah ? chById.get(startSurah) : null;
      let filled = 0;
      if (ch) { rows.push({ k: "h", s: ch.id }); filled++; if (ch.bismillah_pre) { rows.push({ k: "b" }); filled++; } }
      for (; filled < gap; filled++) rows.push({ k: "x" });
      rows.push({ k: "l", n: ln, w: lines.get(ln).sort((a, b) => a.id - b.id).map(({ id, ...r }) => r) });
      prev = ln;
    }
    json(`mushaf/pages/${pad(p)}.json`, { page: p, opening: p <= 2, rows });
  }
  if (Object.keys(ayahPage).length !== 6236) throw new Error("فهرس الآيات→الصفحات ناقص");
  json("mushaf/index.json", { surahs, juzStart: Array.from({ length: 30 }, (_, i) => juzStart[i + 1]), ayahPage });
  const tmp = fs.mkdtempSync(`${os.tmpdir()}/qpc-ttf-`);
  execFileSync("python3", [`${appRoot}/scripts/native/woff2-to-ttf.py`, `${appRoot}/public/fonts/qpc-v2`, tmp], { stdio: "inherit" });
  for (let p = 1; p <= 604; p++) put(`mushaf/fonts/p${p}.ttf`, fs.readFileSync(`${tmp}/p${p}.ttf`));
  fs.rmSync(tmp, { recursive: true, force: true });
  counts.mushafPages = 604;
  // أصل كل ملف يُصدَّر: sha256 للمصدر (الصفحات JSON وخطوط woff2) كي يقارنها اختبار البوابة بالمستودع
  mushafSources = {};
  for (let p = 1; p <= 604; p++) {
    mushafSources[`public/data/quran-v2/pages/page-${pad(p)}.json`] = sha(fs.readFileSync(`${q2}/pages/page-${pad(p)}.json`));
    mushafSources[`public/fonts/qpc-v2/p${p}.woff2`] = sha(fs.readFileSync(`${appRoot}/public/fonts/qpc-v2/p${p}.woff2`));
  }
  mushafSources["public/data/quran-v2/chapters.json"] = sha(fs.readFileSync(`${q2}/chapters.json`));
}

/* أقسام التطبيق الأصلي: كل ملف في scripts/native/sections يصدّر دالة افتراضية تكتب Data/<قسم>/ (يبدأ بـ_ = مساعد) */
{
  const dir = path.join(import.meta.dirname, "sections");
  const ctx = { put, json, rd, held, reject, counts, appRoot, data, check };
  if (fs.existsSync(dir))
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".mjs") && !x.startsWith("_")).sort())
      await (await import(path.join(dir, f))).default(ctx);
}

json("MANIFEST.json", { version: 1, counts, rejected: rej, mushafSources, files: files.slice().sort((a, b) => a.path.localeCompare(b.path)) });
console.log(JSON.stringify({ out: check ? "(check)" : out, files: files.length, counts, rejected: rej }));
