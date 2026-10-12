import * as M from "../audit-main/artifacts/majalis/src/lib/miracles-seed";
import { langIssues, findQuran, writeJSON } from "./lib.mjs";
const arr: any[] = (Object.values(M).find((v) => Array.isArray(v) && v.length > 20) as any[]) || [];
const out: any[] = [];
const keys = arr[0] ? Object.keys(arr[0]) : [];
for (const [i, x] of arr.entries()) {
  const ref = `${x.id ?? x.slug ?? i}`; const F = "src/lib/miracles-seed.ts";
  const src = x.sources ?? x.source ?? x.reference ?? x.references;
  if (!src || (Array.isArray(src) && !src.length)) out.push({ section: "الإعجاز", file: F, ref, type: "بلا مصدر", sev: "متوسط", fix: "" });
  const all = JSON.stringify(x);
  for (const m of all.matchAll(/﴿([^﴾]+)﴾/g)) { const r: any = findQuran(m[1]); if (!r.found && !r.tooShort && (r.prefixRatio ?? 0) < 0.6) out.push({ section: "الإعجاز", file: F, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: `«${m[1].slice(0, 40)}…» أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true }); }
  for (const k of Object.keys(x)) if (typeof x[k] === "string") for (const li of langIssues(x[k])) out.push({ section: "الإعجاز", file: F, ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" ? "متوسط" : "تحسين", fix: li.detail });
}
writeJSON("b7-miracles.json", out);
console.log(arr.length, keys, out.length, out.filter((x) => x.sev !== "تحسين").map((x) => `${x.ref} ${x.type} ${x.fix}`).slice(0, 15));
