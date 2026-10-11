#!/usr/bin/env node
/**
 * عزو الآيات: كل اقتباس ﴿…﴾ أو {…} يتبعه مرجع «سورة X: N» يجب أن يقع نصه في
 * سورة X ضمن آية N (±1) من مصحف المشروع (public/data/quran). نص غير موجود في
 * القرآن يغطيه test-quran-quotes-guard؛ هذا الحارس يغطي «النص صحيح والعزو خاطئ».
 * التشغيل: node scripts/scan-quran-attribution.mjs [--list]
 * الاستثناءات الموثقة: scripts/quran-attribution-known.json (مفتاح: ملف|نص مطبّع مختصر).
 */
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIAC=/[ؐ-ًؚ-ٟۖ-ۭـ۝]/g;
const norm=(t)=>t.replace(/﻿/g,"").replace(/وٰ/g,"ا").replace(/ٰ/g,"ا").replace(/[ٕٓٔ]/g,"")
 .replace(DIAC,"").replace(/بصۜ?ط/g,"بسط").replace(/[آأإٱىي]/g,"ا").replace(/ة/g,"ه")
 .replace(/[^ء-ي]/g,"").replace(/[اءئؤ]/g,"").replace(/ل{2,}/g,"ل");
const nn=(x)=>x.replace(DIAC,"").replace(/ٰ/g,"ا").replace(/[آأإٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[^ء-ي]/g,"").replace(/^سوره/,"");
const surahs = [];
for (let i = 1; i <= 114; i++) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/quran", `surah-${String(i).padStart(3, "0")}.json`), "utf8"));
  let joined = ""; const starts = [];
  for (const a of d.ayahs) { starts.push(joined.length); joined += norm(a.text); }
  surahs.push({ n: i, name: nn(d.name), joined, starts, count: d.ayahs.length });
}
const byName = new Map(surahs.map((s) => [s.name, s]));
const ayahAt = (s, off) => { let k = 0; while (k + 1 < s.starts.length && s.starts[k + 1] <= off) k++; return k + 1; };
const known = fs.existsSync(path.join(ROOT, "scripts/quran-attribution-known.json"))
  ? new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/quran-attribution-known.json"), "utf8")).keys) : new Set();
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".") || e.name === "dist") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/public\/data\/(quran|tafsir)|reports|docs/.test(p)) walk(p); }
    else if (/\.(tsx?|mjs|json|md)$/.test(e.name) && fs.statSync(p).size < 6e6) files.push(p);
  }
})(path.join(ROOT, "src")); walk2(path.join(ROOT, "public/data")); walk2(path.join(ROOT, "scripts"));
function walk2(d) { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!/data\/(quran|tafsir)$/.test(p) && !/seo-prerender/.test(p)) walk2(p); } else if (/\.(tsx?|mjs|json)$/.test(e.name) && fs.statSync(p).size < 6e6) files.push(p); } }
const corpus = surahs.map((x) => x.joined).join("|");
const REFG = /سورة\s*([ء-ي]{3,14})\s*[:،]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/g;
const SEG = /﴿([^﴾]{8,700})﴾|\{([^{}\n]{8,500})\}|"((?:[^"\\\n]|\\.){12,700})"/g;
const issues = []; let checked = 0;
for (const f of new Set(files)) {
  const s = fs.readFileSync(f, "utf8");
  if (!/سورة/.test(s)) continue;
  const rel = path.relative(ROOT, f);
  const segs = [];
  for (const m of s.matchAll(SEG)) {
    const t = m[1] ?? m[2] ?? m[3]; if (!/[ً-ْ]/.test(t) && m[3] !== undefined && !/﴿|\{/.test(m[0])) { /* نص مقتبس بلا تشكيل: يبقى مرشحًا */ }
    const q = norm(t); if (q.length < 15 || !corpus.includes(q)) continue;
    segs.push({ start: m.index, end: m.index + m[0].length, t, q });
  }
  if (!segs.length) continue;
  for (const r of s.matchAll(REFG)) {
    const su = byName.get(nn(r[1])); if (!su) continue;
    const pos = r.index;
    let best = null, bd = 1e9;
    for (const g of segs) {
      if (g.start <= pos && pos < g.end) continue;
      const d = g.end <= pos ? pos - g.end : g.start - (pos + r[0].length);
      if (d < 0 || d > 800) continue;
      if (d < bd) { bd = d; best = g; }
    }
    if (!best) continue;
    checked++;
    const lo = +r[2], hi = r[3] ? +r[3] : lo;
    let ok = false, found = false, off = -1;
    while ((off = su.joined.indexOf(best.q, off + 1)) !== -1) {
      found = true;
      const a1 = ayahAt(su, off), a2 = ayahAt(su, off + best.q.length - 1);
      if (a2 >= lo - 1 && a1 <= hi + 1) { ok = true; break; }
    }
    if (ok) continue;
    const key = `${rel}|${best.q.slice(0, 24)}`;
    if (known.has(key)) continue;
    issues.push({ rel, line: s.slice(0, pos).split("\n").length, key, text: best.t.trim().slice(0, 60), ref: `${r[1]}:${r[2]}${r[3] ? "-" + r[3] : ""}`, kind: found ? "عزو خاطئ" : "ليس في السورة المذكورة" });
  }
}
console.log(`ملفات: ${new Set(files).size}`);
console.log(`اقتباسات مقرونة بمرجع: ${checked} | مخالفات عزو: ${issues.length}`);
if (process.argv.includes("--list")) issues.forEach((i) => console.log(`${i.rel}:${i.line} | ${i.kind} | ${i.ref} | ${i.text} | ${i.key}`));
else issues.slice(0, 30).forEach((i) => console.log(`✗ ${i.rel}:${i.line} [${i.kind}] ${i.ref} «${i.text}»`));
if (issues.length) { console.log("\x1b[31m✗ عزو الآيات: مخالفات\x1b[0m"); process.exit(1); }
console.log("\x1b[32m✓ عزو الآيات مطابق\x1b[0m");
