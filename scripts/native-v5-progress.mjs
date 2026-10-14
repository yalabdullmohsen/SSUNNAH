#!/usr/bin/env node
// نسبة اكتمال تصميم v5 من الـ212 مسارًا: node scripts/native-v5-progress.mjs [--md]
import { readFileSync, writeFileSync } from "node:fs";
const map = JSON.parse(readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json", "utf8"));
const t = JSON.parse(readFileSync("docs/native/V5_TRACKING.json", "utf8"));
const tm = new Set(t.templatesMigrated), rd = new Set(t.routesDone);
const rows = map.routes.map((r) => ({ ...r, done: tm.has(r.template) || rd.has(r.path) }));
const done = rows.filter((r) => r.done).length;
const pct = ((done / rows.length) * 100).toFixed(1);
console.log(`v5: ${done}/${rows.length} = ${pct}%`);
const by = {};
for (const r of rows) { (by[r.template] ??= [0, 0])[1]++; if (r.done) by[r.template][0]++; }
for (const [k, [d, n]] of Object.entries(by)) console.log(`  ${k}: ${d}/${n}`);
if (process.argv.includes("--md")) {
  const md = [`# تتبّع v5 — ${done}/${rows.length} (${pct}%)`, "", "| المسار | القالب | القسم | منجز |", "|---|---|---|---|",
    ...rows.map((r) => `| \`${r.path}\` | ${r.template} | ${r.section} | ${r.done ? "✅" : "—"} |`)].join("\n");
  writeFileSync("docs/native/V5_TRACKING.md", md + "\n");
}
