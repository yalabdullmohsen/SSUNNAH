import fs from "node:fs"; import path from "node:path";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, writeJSON } from "./lib.mjs";
const dir = `${ROOT}/supabase`;
const files = fs.readdirSync(dir).filter((f) => /^learn_library.*\.sql$/.test(f)).sort();
const issues = []; const add = (o) => issues.push({ section: "الدروس", ...o });
let nA = 0, nH = 0, ok = 0;
for (const f of files) {
  const lines = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
  const F = `artifacts/majalis/supabase/${f}`;
  lines.forEach((l, i) => {
    const ref = `س${i + 1}`;
    for (const m of l.matchAll(/﴿([^﴾]+)﴾\s*[(\[]?([^)\]\n']{0,25})/g)) {
      nA++;
      const segs = m[1].split(/[۝]|\s\(\d+\)\s/);
      const r = findQuran(m[1].replace(/[(\[]\d+[)\]]/g, ""));
      if (r.found) { ok++; continue; }
      if (r.tooShort) continue;
      add({ file: F, ref, type: "مطابقة آية: اختلاف حرفي", sev: "حرج", fix: `«${m[1].slice(0, 45)}…» ${m[2].trim()}؛ أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true });
    }
    for (const m of l.matchAll(/«([^»]{10,})»\s*[(\[]?\s*((?:رواه|أخرجه|متفق)[^)\].;'؛]{0,50})?/g)) {
      nH++;
      const src = m[2] || "";
      if (!src && /(ﷺ|النبي|رسول الله)/.test(l.slice(Math.max(0, m.index - 30), m.index))) add({ file: F, ref, type: "حديث بلا تخريج", sev: "حرج", fix: `«${m[1].slice(0, 45)}…»` });
      if (src && !/\d/.test(src)) add({ file: F, ref, type: "حديث بلا رقم في التخريج", sev: "متوسط", fix: `«${m[1].slice(0, 35)}…» ${src.trim()}` });
      const cols = collectionsCited(src);
      if (cols.length && !/أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|أحمد|الحاكم|مالك/.test(src) && sk1(m[1]).length >= 15) {
        const h = matchHadith(m[1], cols);
        if (h.status === "partial" && h.ratio < 0.8) add({ file: F, ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: h.ratio < 0.6 ? "حرج" : "متوسط", fix: `«${m[1].slice(0, 40)}…» ${src.trim()}؛ أقرب ${h.col} ${h.n} (${Math.round(h.ratio * 100)}%)؛ غير موجود: ${h.missing.slice(0, 6).join("، ")}`, review: true });
      }
    }
    if (/[؀-ۿ]/.test(l)) for (const li of langIssues(l.replace(/'[^']*'::[a-z_]+|https?:\S+/g, ""))) if (["رمز غير مرئي", "أرقام هندية", "تشكيل مكسور (حركة بلا حرف)", "لاتيني داخل نص عربي"].includes(li.type)) {
      if (li.type === "لاتيني داخل نص عربي" && /^(insert|values|select|update|on conflict|returning|coalesce|null|true|false)/i.test(li.detail)) continue;
      add({ file: F, ref, type: li.type, sev: li.type === "رمز غير مرئي" ? "متوسط" : "تحسين", fix: li.detail });
    }
  });
}
writeJSON("b4-issues.json", issues);
const s = {}, t = {}; issues.forEach((x) => { s[x.sev] = (s[x.sev] || 0) + 1; t[x.type] = (t[x.type] || 0) + 1; });
console.log({ files: files.length, ayahQuotes: nA, ayahOk: ok, hadithQuotes: nH }, s, t);
