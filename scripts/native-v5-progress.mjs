#!/usr/bin/env node
// نسبة اكتمال تصميم v5 من الـ212 مسارًا: node scripts/native-v5-progress.mjs [--md]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const map = JSON.parse(readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json", "utf8"));
let t = JSON.parse(readFileSync("docs/native/V5_TRACKING.json", "utf8"));
// --from-snapshots <dir>: يحتسب المسار فقط إن كانت لقطته صالحة (ليست في invalid.txt ولا مكرّرة/خطأ)،
// وبكسل الخلفية الفاتحة (x=8, y=h/2) ≈ #F7F4EC ±6، وقالبه ضمن candidateTemplates (القوالب المهاجَرة لنمط v5).
const fsIdx = process.argv.indexOf("--from-snapshots");
if (fsIdx > 0) {
  const dir = process.argv[fsIdx + 1];
  const invalid = new Set(readFileSync(`${dir}/invalid.txt`, "utf8").split("\n").filter(Boolean).map((l) => l.split("|")[0]));
  const ticks = new Set(readFileSync(`${dir}/ticks.txt`, "utf8").split("\n").filter(Boolean));
  const cands = new Set(t.candidateTemplates ?? ["قائمة", "بحث", "أقسام"]);
  const files = map.routes.map((r) => `${dir}/snapshots/${r.section_dir ?? "misc"}/${r.path.replace(/^\//, "").replace(/[\/:]/g, "_")}-light.png`);
  const px = JSON.parse(execFileSync("python3", ["-c", `import sys,json
from PIL import Image
out={}
for f in json.loads(sys.argv[1]):
    try:
        im=Image.open(f).convert("RGB"); out[f]=list(im.getpixel((8,im.height//2)))
    except Exception: out[f]=None
print(json.dumps(out))`, JSON.stringify(files)], { maxBuffer: 1 << 26 }).toString());
  const ok = (c) => c && Math.abs(c[0] - 0xF7) <= 6 && Math.abs(c[1] - 0xF4) <= 6 && Math.abs(c[2] - 0xEC) <= 6;
  t.candidateTemplates = [...cands];
  t.routesDone = map.routes.filter((r, i) => ticks.has(r.path) && !invalid.has(r.path) && cands.has(r.template) && ok(px[files[i]])).map((r) => r.path);
  t.measuredAt = new Date().toISOString().slice(0, 10);
  writeFileSync("docs/native/V5_TRACKING.json", JSON.stringify(t, null, 2) + "\n");
  Object.assign(t, { templatesMigrated: [] });
}
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
