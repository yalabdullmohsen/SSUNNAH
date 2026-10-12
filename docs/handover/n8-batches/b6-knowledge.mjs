// ن8 دفعة 6 — القصص/المعرفة/التاريخ/المذكورون (قراءة فقط)
import fs from "node:fs"; import path from "node:path";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, writeJSON, ayahText, lcsAgainst } from "./lib.mjs";
const issues = []; const add = (o) => issues.push(o);
const stats = { items: 0, ayahEv: 0, hadEv: 0, ayahInline: 0 };
const load = (p) => { const j = JSON.parse(fs.readFileSync(p, "utf8")); return Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || (typeof j === "object" ? [j] : []); };
const langFields = ["title", "summary", "body", "full_content", "definition", "whyMentioned", "description", "text", "name", "nameAr"];

function inline(text, S, F, ref) {
  for (const m of String(text || "").matchAll(/﴿([^﴾]+)﴾/g)) {
    stats.ayahInline++;
    const r = findQuran(m[1].replace(/\.\.\.|…/g, " "));
    if (!r.found && !r.tooShort && (r.prefixRatio ?? 0) < 0.6) add({ section: S, file: F, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: `«${m[1].slice(0, 45)}…»؛ أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true });
  }
  for (const m of String(text || "").matchAll(/«([^»]{12,})»\s*[(\[]?\s*((?:رواه|أخرجه|متفق)[^)\].؛\n]{0,50})/g)) {
    const cols = collectionsCited(m[2]);
    if (cols.length && !/أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|أحمد|الحاكم|مالك/.test(m[2]) && sk1(m[1]).length >= 15) {
      const h = matchHadith(m[1], cols);
      if (h.status === "partial" && h.ratio < 0.7) add({ section: S, file: F, ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: h.ratio < 0.55 ? "حرج" : "متوسط", fix: `«${m[1].slice(0, 40)}…» ${m[2].trim()}؛ أقرب ${h.col} ${h.n} (${Math.round(h.ratio * 100)}%)`, review: true });
    }
  }
}
function evidences(evs, S, F, ref) {
  for (const e of evs || []) {
    if (e.type === "ayah") {
      stats.ayahEv++;
      const mm = String(e.ref || "").match(/^(\d+):(\d+)(?:-(\d+))?$/);
      if (!mm) { add({ section: S, file: F, ref, type: "مرجع آية غير قياسي", sev: "متوسط", fix: String(e.ref) }); continue; }
      const [s, a, b] = [Number(mm[1]), Number(mm[2]), Number(mm[3] || mm[2])];
      let t = ""; for (let k = a; k <= b; k++) t += " " + (ayahText(s, k) || "");
      if (!t.trim()) { add({ section: S, file: F, ref, type: "مرجع آية غير موجود", sev: "حرج", fix: e.ref }); continue; }
      if (e.text) { const r = lcsAgainst(e.text.replace(/\.\.\.|…/g, " "), t); if (r.ratio < 0.85) add({ section: S, file: F, ref, type: "نص الآية لا يطابق مرجعها", sev: "حرج", fix: `${e.ref} (${Math.round(r.ratio * 100)}%) غير موجود: ${r.missing.slice(0, 6).join("، ")}`, review: true }); }
    } else if (e.type === "hadith") {
      stats.hadEv++;
      if (!String(e.grade || "").trim()) add({ section: S, file: F, ref, type: "حديث بلا درجة", sev: "حرج", fix: `${e.ref || ""} «${String(e.text || "").slice(0, 35)}…»` });
      else if (!String(e.graded_by || "").trim()) add({ section: S, file: F, ref, type: "درجة بلا محكِّم", sev: "تحسين", fix: e.grade });
      if (!/\d/.test(String(e.ref || ""))) add({ section: S, file: F, ref, type: "حديث بلا رقم في المرجع", sev: "متوسط", fix: String(e.ref || "") });
      const cols = collectionsCited(e.ref);
      if (cols.length && e.text && sk1(e.text).length >= 15 && !/أبو داود|الترمذي|النسائي|ابن ماجه|أحمد/.test(e.ref)) {
        const h = matchHadith(e.text, cols);
        if (h.status === "partial" && h.ratio < 0.7) add({ section: S, file: F, ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: h.ratio < 0.55 ? "حرج" : "متوسط", fix: `${e.ref} «${String(e.text).slice(0, 35)}…»؛ أقرب ${h.col} ${h.n} (${Math.round(h.ratio * 100)}%)`, review: true });
      }
    }
  }
}
function item(x, S, F, i) {
  stats.items++;
  const ref = `${x.id ?? x.slug ?? "#"} (#${i})`;
  for (const k of langFields) if (typeof x[k] === "string") for (const li of langIssues(x[k])) add({ section: S, file: F, ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail });
  for (const k of ["body", "full_content", "summary", "definition", "whyMentioned"]) inline(x[k], S, F, ref);
  if (Array.isArray(x.evidences)) evidences(x.evidences, S, F, ref);
  if ("sources" in x && (!Array.isArray(x.sources) || !x.sources.length)) add({ section: S, file: F, ref, type: "بلا مصادر", sev: "متوسط", fix: "" });
  if (x.full_content !== undefined && String(x.full_content).split(/\s+/).length < 120) add({ section: S, file: F, ref, type: "نص قصير جدًا (<120 كلمة)", sev: "تحسين", fix: "" });
  if (x.is_approved === false || /needs|draft|pending/.test(String(x.review_status || x.editorial_review_status || ""))) stats.unreviewed = (stats.unreviewed || 0) + 1;
  for (const o of x.occurrences || []) { const r = String(o.ref || o.key || o).match(/(\d+):(\d+)/); if (r && !ayahText(+r[1], +r[2])) add({ section: S, file: F, ref, type: "موضع آية غير موجود", sev: "متوسط", fix: r[0] }); }
}
const walk = (S, rel) => {
  const abs = path.join(ROOT, rel);
  const files = fs.statSync(abs).isDirectory() ? fs.readdirSync(abs, { recursive: true }).filter((f) => f.endsWith(".json") && !/manifest|aliases/.test(f)).map((f) => path.join(rel, f)) : [rel];
  for (const f of files) load(path.join(ROOT, f)).forEach((x, i) => {
    if (x && x.type && x.ref && x.text && !x.id) { evidences([x], S, f, `#${i}`); return; } // ملفات evidences مستقلة (nations/prophets)
    item(x, S, f, i);
  });
};
walk("القصص", "public/data/stories");
walk("المعرفة", "public/data/knowledge/discover-islam");
walk("المعرفة", "public/data/knowledge/intro-islam");
walk("المعرفة", "public/data/knowledge/history");
walk("المعرفة", "public/data/knowledge/nations");
walk("المعرفة", "public/data/knowledge/prophets");
walk("المعرفة", "public/data/knowledge/quran-people");
walk("المذكورون في القرآن", "public/data/quran-people/people.json");
walk("التاريخ", "src/data/islamic-history");
walk("سين جيم (المعرفة)", "public/data/knowledge/quiz");
walk("التفسير", "public/data/knowledge/tafsir");
writeJSON("b6-issues.json", issues);
const s = {}, t = {}; issues.forEach((x) => { s[x.sev] = (s[x.sev] || 0) + 1; t[x.section + "|" + x.type] = (t[x.section + "|" + x.type] || 0) + 1; });
console.log(stats, s, t);
