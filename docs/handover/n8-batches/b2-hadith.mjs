// ن8 دفعة 2 — الأحاديث (قراءة فقط)
import fs from "node:fs";
import { ROOT, langIssues, matchHadith, sk1, writeJSON, hadithCorpus, findQuran, lcsAgainst } from "./lib.mjs";

const issues = [];
const add = (o) => issues.push({ section: "الأحاديث", ...o });
const d = `${ROOT}/public/data/hadith-verified/`;
const all = [];
for (const f of fs.readdirSync(d).filter((f) => !f.includes("manifest")).sort()) {
  const arr = JSON.parse(fs.readFileSync(d + f, "utf8"));
  arr.forEach((h, i) => all.push({ ...h, _file: `public/data/hadith-verified/${f}`, _idx: i }));
}
const ref = (h) => `${h.id} (#${h._idx})`;
const classOf = (g = "") =>
  /^(صحيح|حسن|ثابت|أصل)/.test(g) && !/موضوع|لا أصل|باطل/.test(g.split("—")[0]) ? "accepted"
  : /موضوع|لا أصل|باطل|ليس بحديث|كذب/.test(g) ? "mawdu"
  : /ضعيف|واه|لا يصح|لا يثبت|منكر/.test(g) ? "daif" : "other";

// معرّفات مكررة
const idc = {};
all.forEach((h) => (idc[h.id] = (idc[h.id] || 0) + 1));
for (const [id, n] of Object.entries(idc)) if (n > 1) add({ file: "public/data/hadith-verified/*", ref: id, type: "معرّف مكرر", sev: "متوسط", fix: `${n} مرات` });
// نصوص مكررة
const byT = {};
all.forEach((h) => { const k = sk1(h.text); if (k.length > 15) (byT[k] = byT[k] || []).push(h); });
for (const hs of Object.values(byT)) if (hs.length > 1) {
  const gs = new Set(hs.map((h) => classOf(h.grade)));
  add({ file: hs[0]._file, ref: hs.map((h) => h.id).join("، "), type: gs.size > 1 ? "نص مكرر بدرجتين متعارضتين" : "نص مكرر", sev: gs.size > 1 ? "حرج" : "تحسين", fix: hs.map((h) => `${h.id}: ${h.grade}`).join(" / "), review: gs.size > 1 });
}

const H = hadithCorpus();
const gradeForms = new Set();
for (const h of all) {
  const f = h._file, r = ref(h);
  gradeForms.add(h.grade);
  for (const k of ["text", "grade", "source_name", "authenticity_class"]) if (!String(h[k] ?? "").trim()) add({ file: f, ref: r, type: `حقل ناقص (${k})`, sev: k === "text" || k === "grade" || k === "source_name" ? "حرج" : "متوسط", fix: "" });
  if (/يحتاج تخريج/.test(h.grade || "")) add({ file: f, ref: r, type: "حديث منشور بلا تخريج", sev: "حرج", fix: `الدرجة «${h.grade}»؛ لا يُعرض حتى يُخرَّج`, review: true });
  // اتساق الدرجة مع التصنيف
  const c = classOf(h.grade);
  const ac = h.authenticity_class;
  if ((ac === "sahih" && c !== "accepted" && c !== "other") || (ac === "daif" && c === "accepted") || (ac === "mawdu" && c === "accepted"))
    add({ file: f, ref: r, type: "الدرجة تخالف authenticity_class", sev: "حرج", fix: `class=${ac} والدرجة «${h.grade}»`, review: true });
  if (c === "other" && !/تمييز|أثر|مختلف|منسوخ/.test(h.grade || "")) add({ file: f, ref: r, type: "درجة غير قياسية", sev: "متوسط", fix: `«${h.grade}»` });
  // رقم الحديث
  const cited = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "mutafaq"].includes(h.collection);
  if (cited && !String(h.hadith_number ?? "").trim() && !/\d/.test(h.source_name || "")) add({ file: f, ref: r, type: "مصدر بلا رقم حديث", sev: c === "accepted" ? "حرج" : "متوسط", fix: `${h.collection} — «${h.source_name}»` });
  if (h.collection === "various" && c === "accepted" && !/\d/.test(h.source_name || "")) add({ file: f, ref: r, type: "صحيح بلا رقم في المصدر", sev: "متوسط", fix: `«${h.source_name}»` });
  if (h.hadith_number && !/^\d+[a-z]?$/i.test(String(h.hadith_number).trim())) add({ file: f, ref: r, type: "رقم حديث غير قياسي", sev: "تحسين", fix: String(h.hadith_number) });
  // مطابقة الصحيحين: البخاري بالرقم القياسي أولًا، ومسلم بالنص (ترقيم الطبعة المحلية غير قياسي)
  const isB = h.collection === "bukhari" || h.collection === "mutafaq" || /البخاري/.test(h.source_name || "");
  const isM = h.collection === "muslim" || h.collection === "mutafaq" || /مسلم/.test(h.source_name || "");
  if ((isB || isM) && c === "accepted" && sk1(h.text).length >= 15 && ["bukhari", "muslim", "mutafaq"].includes(h.collection)) {
    const num = parseInt(String(h.hadith_number || "").match(/\d+/)?.[0] || (h.source_name || "").match(/البخاري\D{0,4}\(?(\d+)/)?.[1] || "0", 10);
    let okB = false, atNum = null;
    if (isB && num) { const e = H.bukhari.find((x) => x.n === num); if (e) { atNum = lcsAgainst(h.text, e.t); okB = atNum.ratio >= 0.75; } }
    if (!okB) {
      const bestB = isB ? matchHadith(h.text, ["bukhari"]) : null;
      const bestM = isM || isB ? matchHadith(h.text, ["muslim"]) : null;
      const good = (m) => m && (m.status === "exact" || m.status === "rasm" || (m.status === "partial" && m.ratio >= 0.9));
      if (isB && good(bestB) && num) { if (bestB.n !== num) add({ file: f, ref: r, type: atNum && atNum.ratio >= 0.5 ? "رقم الحديث لرواية أخرى" : "رقم الحديث لا يطابق النص", sev: atNum && atNum.ratio >= 0.5 ? "تحسين" : "متوسط", fix: `مذكور البخاري ${num} (تطابق ${Math.round((atNum?.ratio ?? 0) * 100)}%)؛ اللفظ في البخاري ${bestB.n}` }); }
      else if (isB && !isM && good(bestM)) add({ file: f, ref: r, type: "اللفظ لمسلم والعزو للبخاري", sev: "متوسط", fix: `مذكور البخاري ${num || ""}؛ اللفظ في مسلم (رقم الطبعة المحلية ${bestM.n})`, review: true });
      else if (!good(bestB) && !good(bestM)) {
        const near = atNum && atNum.ratio >= ((bestB?.ratio) ?? 0) ? { at: `البخاري ${num}`, ...atNum } : bestB?.status === "partial" ? { at: `البخاري ${bestB.n}`, ratio: bestB.ratio, missing: bestB.missing } : bestM?.status === "partial" ? { at: `مسلم ${bestM.n}`, ratio: bestM.ratio, missing: bestM.missing } : null;
        if (near) add({ file: f, ref: r, type: "مطابقة: اللفظ لا يطابق المصدر المذكور", sev: near.ratio < 0.7 ? "حرج" : "متوسط", fix: `${h.collection} ${h.hadith_number ?? ""}؛ أقرب ${near.at} (${Math.round(near.ratio * 100)}%)؛ غير موجود: ${near.missing.slice(0, 8).join("، ")}`, review: true });
      }
    }
  }
  // لغة
  for (const k of ["text", "title", "explanation", "source_name", "narrator", "grade"]) for (const li of langIssues(h[k])) add({ file: f, ref: `${r} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail });
}

// ===== متن البخاري ومسلم الكامل (فحص بنيوي فقط) =====
for (const c of ["bukhari", "muslim"]) {
  const arr = H[c];
  const f = `public/data/hadith/${c}.json`;
  const nums = {}; let inv = 0, fffd = 0, empty = 0, digits = 0;
  for (const h of arr) {
    nums[h.n] = (nums[h.n] || 0) + 1;
    if (!h.t?.trim()) empty++;
    const li = langIssues(h.t);
    if (li.some((x) => x.type === "رمز غير مرئي")) { inv++; if (/�/.test(h.t)) fffd++; }
  }
  const dups = Object.entries(nums).filter(([, v]) => v > 1);
  if (dups.length) add({ file: f, ref: dups.slice(0, 6).map(([k]) => k).join("، "), type: "رقم حديث مكرر", sev: "متوسط", fix: `${dups.length} رقمًا مكررًا` });
  if (empty) add({ file: f, ref: `${empty} حديثًا`, type: "متن فارغ", sev: "متوسط", fix: "" });
  if (inv) add({ file: f, ref: `${inv} حديثًا`, type: "رمز غير مرئي في المتن", sev: "متوسط", fix: fffd ? `منها ${fffd} فيها U+FFFD (حرف تالف)` : "U+200F/RLM وغيرها" });
}

writeJSON("b2-issues.json", issues);
const bySev = {}, byType = {};
for (const i of issues) { bySev[i.sev] = (bySev[i.sev] || 0) + 1; byType[i.type] = (byType[i.type] || 0) + 1; }
console.log("verified:", all.length, "gradeForms:", gradeForms.size);
console.log(bySev); console.log(byType);
