// ن8 دفعة 5 — سؤال وجواب + سين جيم (قراءة فقط)
import fs from "node:fs";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, writeJSON } from "./lib.mjs";
const issues = []; const add = (o) => issues.push(o);
const load = (p) => { const j = JSON.parse(fs.readFileSync(p, "utf8")); return Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || []; };
const stats = {};
const st = (k, v) => { stats[k] = stats[k] || {}; stats[k][v] = (stats[k][v] || 0) + 1; };

function quotes(text, section, file, ref) {
  for (const m of String(text || "").matchAll(/﴿([^﴾]+)﴾/g)) {
    stats.ayah = (stats.ayah || 0) + 1;
    const r = findQuran(m[1].replace(/\.\.\.|…/g, " "));
    if (!r.found && !r.tooShort && (r.prefixRatio ?? 0) < 0.6) add({ section, file, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: `«${m[1].slice(0, 45)}…»؛ أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true });
  }
  for (const m of String(text || "").matchAll(/[«'"“]([^»'"”]{12,})[»'"”]\s*[(\[]?\s*((?:رواه|أخرجه|متفق)[^)\].؛\n]{0,50})/g)) {
    stats.hadith = (stats.hadith || 0) + 1;
    const src = m[2];
    const cols = collectionsCited(src);
    if (cols.length && !/أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|أحمد|الحاكم|مالك/.test(src) && sk1(m[1]).length >= 15) {
      const h = matchHadith(m[1], cols);
      if (h.status === "partial" && h.ratio < 0.75) add({ section, file, ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: h.ratio < 0.6 ? "حرج" : "متوسط", fix: `«${m[1].slice(0, 40)}…» ${src.trim()}؛ أقرب ${h.col} ${h.n} (${Math.round(h.ratio * 100)}%)؛ غير موجود: ${h.missing.slice(0, 6).join("، ")}`, review: true });
    }
  }
}

// ===== سؤال وجواب =====
const qaDir = `${ROOT}/public/data/qa/`;
const qaIds = {}, qaQ = {};
for (const f of fs.readdirSync(qaDir).filter((f) => /^seed-cat-.*\.json$/.test(f)).sort()) {
  const F = `public/data/qa/${f}`;
  load(qaDir + f).forEach((q, i) => {
    const ref = `${q.id} (#${i})`; const S = "سؤال وجواب";
    stats.qa = (stats.qa || 0) + 1;
    st("qa.takhrij_status", q.takhrij_status); st("qa.status", q.status); st("qa.review", q.review_status + "/" + q.editorial_review_status);
    qaIds[q.id] = (qaIds[q.id] || 0) + 1;
    const k = sk1(q.question); (qaQ[k] = qaQ[k] || []).push(q.id);
    const published = /approved|published/.test(q.status || "");
    if (!String(q.answer || "").trim()) add({ section: S, file: F, ref, type: "جواب فارغ", sev: "متوسط", fix: "" });
    const hasHadithOrRuling = /ﷺ|رواه|حديث|حكم|يجب|يحرم|لا يجوز|سنة|واجب/.test(q.answer || "");
    if (!String(q.reference || "").trim() && !String(q.evidence || "").trim()) add({ section: S, file: F, ref, type: "جواب بلا مصدر ولا دليل", sev: published && hasHadithOrRuling ? "حرج" : "متوسط", fix: q.ruling_type || "" });
    if (/NEEDS_HUMAN|PENDING|UNVERIFIED/i.test(q.takhrij_status || "") && published) add({ section: S, file: F, ref, type: "منشور والتخريج NEEDS_HUMAN", sev: "متوسط", fix: q.takhrij_status, review: true });
    for (const fld of ["question", "answer", "evidence", "reference"]) for (const li of langIssues(q[fld])) add({ section: S, file: F, ref: `${ref} [${fld}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail });
    quotes(q.answer, S, F, ref);
    if (/'[^']{6,}'/.test(q.answer || "") && /ﷺ/.test(q.answer || "")) add({ section: S, file: F, ref, type: "حديث بين علامتي ' بدل «»", sev: "تحسين", fix: "" });
  });
}
for (const [id, n] of Object.entries(qaIds)) if (n > 1) add({ section: "سؤال وجواب", file: "public/data/qa/*", ref: id, type: "معرّف مكرر", sev: "متوسط", fix: `${n}` });
for (const ids of Object.values(qaQ)) if (ids.length > 1) add({ section: "سؤال وجواب", file: "public/data/qa/*", ref: ids.join("، "), type: "سؤال مكرر", sev: "تحسين", fix: "" });
const emptyFiles = fs.readdirSync(qaDir).filter((f) => f.endsWith(".json") && fs.statSync(qaDir + f).size < 10);
emptyFiles.forEach((f) => add({ section: "سؤال وجواب", file: `public/data/qa/${f}`, ref: "الملف", type: "ملف فارغ ([])", sev: "تحسين", fix: "حذفه من manifest أو ملؤه" }));

// ===== سين جيم =====
const quizDirs = [["public/data/quiz/", `${ROOT}/public/data/quiz/`], ["public/data/knowledge/quiz/", `${ROOT}/public/data/knowledge/quiz/`]];
const qzIds = {}, qzQ = {};
for (const [rel, dir] of quizDirs) for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes("manifest")).sort()) {
  const F = rel + f; const S = "سين جيم";
  load(dir + f).forEach((q, i) => {
    const ref = `${q.id} (#${i})`;
    stats.quiz = (stats.quiz || 0) + 1;
    st("quiz.idPrefix", String(q.id).split("-")[0]); st("quiz.review", q.editorial_review_status ?? "-"); st("quiz.trust", q.trust_level ?? "-");
    qzIds[q.id] = (qzIds[q.id] || 0) + 1;
    const k = sk1(q.question); (qzQ[k] = qzQ[k] || []).push(q.id);
    const isK = rel.includes("knowledge");
    const isDemo = /^demo[-_]/i.test(String(q.id));
    const sevPub = (sv) => (isDemo ? "تحسين" : sv);
    if (isK) {
      if (!q.sources?.length) add({ section: S, file: F, ref, type: "سؤال بلا مصادر", sev: "متوسط", fix: "" });
      for (const e of q.evidences || []) if (e.type === "ayah" && e.ref) { const [s1, a1] = e.ref.split(":").map(Number); /* النص من المصحف المحلي — لا حاجة لمطابقة */ }
      for (const li of langIssues(q.title)) add({ section: S, file: F, ref: `${ref} [title]`, type: li.type, sev: "تحسين", fix: li.detail });
      return;
    }
    const ans = q.answer ?? q.correct ?? q.correctAnswer;
    if (ans == null || !String(typeof ans === "object" ? JSON.stringify(ans) : ans).trim()) add({ section: S, file: F, ref, type: "جواب ناقص", sev: "متوسط", fix: "" });
    if (Array.isArray(q.options) && typeof ans === "string" && !q.options.includes(ans)) add({ section: S, file: F, ref, type: "الجواب ليس بين الخيارات", sev: "متوسط", fix: ans.slice(0, 40) });
    if (!String(q.reference || q.source || "").trim()) add({ section: S, file: F, ref, type: isDemo ? "سؤال تجريبي (غير معروض) بلا مرجع" : "سؤال بلا مرجع", sev: sevPub("متوسط"), fix: "" });
    for (const fld of ["question", "answer", "explanation", "reference"]) for (const li of langIssues(typeof q[fld] === "string" ? q[fld] : "")) add({ section: S, file: F, ref: `${ref} [${fld}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail });
    const n0 = issues.length; quotes(`${q.question ?? ""} ${typeof ans === "string" ? ans : ""} ${q.explanation ?? ""}`, S, F, ref); if (isDemo) for (let z = n0; z < issues.length; z++) { issues[z].sev = "تحسين"; issues[z].type += " (سؤال تجريبي غير معروض)"; }
  });
}
for (const [id, n] of Object.entries(qzIds)) if (n > 1) add({ section: "سين جيم", file: "public/data/quiz/*", ref: id, type: "معرّف مكرر", sev: "متوسط", fix: `${n}` });
let dupQ = 0; for (const ids of Object.values(qzQ)) if (ids.length > 1) { dupQ++; add({ section: "سين جيم", file: "public/data/quiz/*", ref: ids.slice(0, 6).join("، ") + (ids.length > 6 ? ` +${ids.length - 6}` : ""), type: "سؤال مكرر حرفيًا", sev: "تحسين", fix: `${ids.length} نسخ` }); }

writeJSON("b5-issues.json", issues);
const s = {}, t = {}; issues.forEach((x) => { s[x.sev] = (s[x.sev] || 0) + 1; t[x.section + "|" + x.type] = (t[x.section + "|" + x.type] || 0) + 1; });
console.log(JSON.stringify(stats, null, 0)); console.log(s); console.log(t);
