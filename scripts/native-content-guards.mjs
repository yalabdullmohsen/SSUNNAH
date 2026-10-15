#!/usr/bin/env node
// حراس جودة المحتوى العامة (كل أقسام ios-native/Data لا قسمًا بعينه). سقف تنازلي (ratchet) في docs/native/content-guards-baseline.json:
// أي زيادة في عدد المخالفات لقسم تُفشل الفحص؛ الانخفاض يُسجَّل بـ UPDATE_GUARD_BASELINE=1. الاستخدام: node scripts/native-content-guards.mjs [--list]
//  G1 عبارات قالبية: نفس بداية الجملة (أول 5 كلمات بعد التطبيع) في ≥ TEMPLATE_N بندًا داخل الملف الواحد.
//  G2 خلاصة/ملخّص: كل حقل summary/abstract/خلاصة/ملخص يجب أن يكون منسوبًا (source/sources/reference غير فارغ) أو موسومًا summaryOrigin:"editorial"،
//     ولا يُقبل مصدر في ملف يعدّه docs/native/source-registry.json «pending» إلا ضمن السقف.
//  G3 وصف فارغ/مكرر: subtitle/description/summary/abstract فارغ؛ أو يساوي العنوان؛ أو مكرر حرفيًا (>12 حرفًا) في ≥3 بنود؛ أو source==reference في البند نفسه؛ أو عناصر sources مكررة.
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA = process.env.NATIVE_DATA_DIR ?? "ios-native/Data", BASE = "docs/native/content-guards-baseline.json";
const SKIP_DIRS = new Set(["mushaf", "tafsir", "graph", "home", "audio", "seed", "prayer"]); // نص القرآن/محمي أو بيانات غير نصية
const TEXT_KEYS = ["body", "subtitle", "summary", "abstract", "description", "desc", "explanation", "text"];
const DESC_KEYS = ["subtitle", "description", "desc", "summary", "abstract"];
const SUMMARY_KEYS = ["summary", "abstract", "khulasa", "tafsirSummary", "خلاصة", "ملخص", "ملخّص"];
const SRC_KEYS = ["source", "sources", "source_url", "sourceUrl", "reference", "references", "ref"];
const TEMPLATE_N = 10, DUP_N = 3;

if (!existsSync(DATA)) { console.log(`content-guards: ${DATA} غير موجود (يُولَّد بـnative-export-data.sh) — تخطٍّ`); process.exit(0); }
const walk = (d, o = []) => { for (const e of readdirSync(d)) { const p = join(d, e), s = statSync(p); s.isDirectory() ? (SKIP_DIRS.has(e) && d === DATA ? 0 : walk(p, o)) : e.endsWith(".json") && e !== "MANIFEST.json" && !/^(surah|page)-\d+\.json$|^(chapters|page-boundaries|SOURCE)\.json$/.test(e) && o.push(p); } return o; };
const recs = v => Array.isArray(v) ? v.flatMap(x => x && typeof x === "object" && !Array.isArray(x) ? [x] : recs(x)) : v && typeof v === "object" ? Object.values(v).flatMap(x => Array.isArray(x) || (x && typeof x === "object") ? recs(x) : []) : [];
const str = x => typeof x === "string" ? x.trim() : "";
const norm = s => s.replace(/[ً-ٰٟـ]/g, "").replace(/[0-9٠-٩]+/g, "#").replace(/[^\p{L}#\s]/gu, " ").replace(/\s+/g, " ").trim();
const filled = x => Array.isArray(x) ? x.some(filled) : x && typeof x === "object" ? Object.values(x).some(filled) : !!str(x);
const key = x => JSON.stringify(x);

const reg = existsSync("docs/native/source-registry.json") ? JSON.parse(readFileSync("docs/native/source-registry.json", "utf8")) : {};
const pending = new Set(Object.keys(reg.pending ?? {}).map(k => k.replace(/:.*$/, "")));
const G = { templates: {}, summaries: {}, descriptions: {} }, LIST = [];
const add = (g, sec, file, msg) => { G[g][sec] = (G[g][sec] ?? 0) + 1; LIST.push(`${g} ${file}: ${msg}`); };

for (const p of walk(DATA)) {
  const rel = p.slice(DATA.length + 1), sec = rel.split("/")[0];
  let v; try { v = JSON.parse(readFileSync(p, "utf8")); } catch { continue; }
  const rs = recs(v); if (!rs.length) continue;
  // G1
  const tmpl = new Map();
  for (const r of rs) for (const k of TEXT_KEYS) for (const t of str(r[k]).split(/\n\s*\n/).map(x => x.trim())) { // على مستوى الفقرة: يكشف القوالب داخل النص الطويل
    if (t.length < 30) continue;
    const w = norm(t).split(" "); if (w.length < 8) continue;
    for (const n of [5, 3]) { const kk = `${k}|${w.slice(0, n).join(" ")}`; (tmpl.get(kk) ?? tmpl.set(kk, new Set()).get(kk)).add(r); }
  }
  for (const [kk, set] of tmpl) if (set.size >= (kk.split("|")[1].split(" ").length === 3 ? TEMPLATE_N * 3 : TEMPLATE_N)) add("templates", sec, rel, `«${kk.split("|")[1]} …» ×${set.size} (${kk.split("|")[0]})`);
  // G2 + G3
  const seen = new Map();
  for (const r of rs) {
    const title = norm(str(r.title ?? r.name ?? r.question ?? ""));
    for (const k of SUMMARY_KEYS) if (k in r && str(r[k])) {
      const attributed = SRC_KEYS.some(s => filled(r[s])), editorial = str(r.summaryOrigin) === "editorial";
      if (!attributed && !editorial) add("summaries", sec, rel, `${k} بلا مصدر ولا وسم summaryOrigin:"editorial" (id=${r.id ?? "?"})`);
      else if (attributed && pending.has(rel) && !editorial) add("summaries", sec, rel, `${k} منسوب في ملف pending بالسجل (id=${r.id ?? "?"})`);
    }
    // فقرة «خلاصة التفسير:» داخل النص تُوهم نقلًا من التفسير: يجب وسمها «ملخّص من إعداد سُنّة»
    if (typeof r.body === "string" && /(^|\n)\s*خلاصة التفسير\s*:/.test(r.body)) add("summaries", sec, rel, `فقرة «خلاصة التفسير:» غير موسومة ملخّصًا (id=${r.id ?? "?"})`);
    for (const k of DESC_KEYS) if (k in r) {
      const t = str(r[k]);
      if (!t) { add("descriptions", sec, rel, `${k} فارغ (id=${r.id ?? "?"})`); continue; }
      if (title && norm(t) === title) add("descriptions", sec, rel, `${k} يساوي العنوان (id=${r.id ?? "?"})`);
      if (t.length > 12) (seen.get(`${k}|${t}`) ?? seen.set(`${k}|${t}`, []).get(`${k}|${t}`)).push(r);
    }
    const s1 = str(r.source), s2 = str(r.reference ?? r.ref);
    if (s1 && s1 === s2) add("descriptions", sec, rel, `source==reference (id=${r.id ?? "?"})`);
    if (Array.isArray(r.sources)) { const ks = r.sources.map(key); if (new Set(ks).size < ks.length) add("descriptions", sec, rel, `sources مكررة (id=${r.id ?? "?"})`); }
  }
  for (const [kk, l] of seen) if (l.length >= DUP_N) add("descriptions", sec, rel, `${kk.split("|")[0]} مكرر حرفيًا ×${l.length}: «${kk.split("|")[1].slice(0, 40)}»`);
}

const base = existsSync(BASE) ? JSON.parse(readFileSync(BASE, "utf8")) : null;
if (process.env.UPDATE_GUARD_BASELINE === "1") { writeFileSync(BASE, JSON.stringify(G, null, 2) + "\n"); console.log("كُتب السقف:", BASE); }
let bad = 0;
for (const g of Object.keys(G)) {
  const tot = Object.values(G[g]).reduce((a, b) => a + b, 0);
  console.log(`${g}: ${tot} ` + Object.entries(G[g]).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s}=${n}`).join(" "));
  if (!base || process.env.UPDATE_GUARD_BASELINE === "1") continue;
  for (const [s, n] of Object.entries(G[g])) if (n > (base[g]?.[s] ?? 0)) { bad++; console.log(`  ✗ ${g}/${s}: ${n} > السقف ${base[g]?.[s] ?? 0}`); }
  for (const [s, n] of Object.entries(base[g] ?? {})) if ((G[g][s] ?? 0) < n) console.log(`  ↓ ${g}/${s}: انخفض إلى ${G[g][s] ?? 0} — اخفض السقف بـUPDATE_GUARD_BASELINE=1`);
}
if (process.argv.includes("--list") || bad) console.log(LIST.slice(0, process.argv.includes("--list") ? 5000 : 40).join("\n"));
if (!base) console.log("لا سقف مسجَّل بعد (شغّل مرة بـUPDATE_GUARD_BASELINE=1)");
process.exit(bad ? 1 : 0);
