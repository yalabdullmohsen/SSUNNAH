#!/usr/bin/env node
// date-readable: لا تاريخ يُعرض خامًا أو بلا لغة صريحة (يتبع لغة الجهاز فيخرج لاتينيًا/إنجليزيًا في واجهة عربية).
// ratchet: العدّ لكل ملف في docs/native/date-readable-baseline.json لا يرتفع؛ ما يُهاجَر إلى SunnahDate/locale صريح يُخفَّض ولا يُرفع.
// قواعد: (1) formatted(date:|.dateTime) بلا locale على السطر؛ (2) DateFormatter بلا locale خلال 6 أسطر؛ (3) Text(<حقل تاريخ خام>).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const ROOTS = ["artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative", "artifacts/majalis/ios/App/SunnahPrayer/Sources/SunnahPrayer"];
const BASE = "docs/native/date-readable-baseline.json";
const files = []; const walk = (d) => { if (!existsSync(d)) return; for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : p.endsWith(".swift") && files.push(p); } };
ROOTS.forEach(walk);
const RAW = /\bText\(\s*(?:[\w.]+\.)?(createdAt|updatedAt|publishedAt|created_at|isoDate|dateString|date|time|timestamp)\s*\)/;
const hits = {};
const add = (f, i, why) => { (hits[relative(".", f)] ??= []).push(`${i + 1}:${why}`); };
for (const f of files) {
  if (/\/Mushaf\//.test(f)) continue;
  const L = readFileSync(f, "utf8").split("\n");
  L.forEach((l, i) => {
    if (/^\s*\/\//.test(l)) return;
    if (/\.formatted\((?:date:|\.dateTime)/.test(l) && !/locale\(|Locale\(/.test(l)) add(f, i, "formatted بلا locale");
    if (/(?<!ISO8601)DateFormatter\(\)/.test(l) && !L.slice(i, i + 7).some((x) => /\.locale\s*=|locale:/.test(x)) && !L.slice(i, i + 7).some((x) => /en_US_POSIX/.test(x))) add(f, i, "DateFormatter بلا locale");
    if (RAW.test(l)) add(f, i, "Text(تاريخ خام)");
  });
}
const counts = Object.fromEntries(Object.entries(hits).map(([k, v]) => [k, v.length]));
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (process.argv.includes("--list")) { console.log(JSON.stringify(hits, null, 1)); process.exit(0); }
if (process.argv.includes("--write")) { writeFileSync(BASE, JSON.stringify({ total, files: counts }, null, 1) + "\n"); console.log(`كُتب الأساس: ${total} في ${Object.keys(counts).length} ملفًا`); process.exit(0); }
const base = JSON.parse(readFileSync(BASE, "utf8"));
const errs = [];
for (const [f, n] of Object.entries(counts)) if (n > (base.files[f] ?? 0)) errs.push(`${f}: ${n} > الأساس ${base.files[f] ?? 0}\n   ${hits[f].join(" | ")}`);
console.log(`مخالفات تاريخ: ${total} (الأساس ${base.total})`);
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log("✓ date-readable");
