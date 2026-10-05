#!/usr/bin/env node
/**
 * بوابة Lighthouse للصفحات المفتاحية — مقارنة وسيط الجولات بخط أساس مقاس.
 *
 * المدخل: .lighthouseci/lhr-*.json (من `lhci collect --config=./lighthouserc.key-pages.cjs`).
 * خط الأساس: config/lhci-key-pages-baseline.json (وسيط قياس main على مشغّل CI).
 *
 * سياسة: المشاكل القائمة لا تُفشل الفحص. يفشل فقط عند الأسوأ من خط الأساس بما يتجاوز الهامش:
 *   - التوقيتات (FCP/LCP/SI): > الأساس × 1.10 (نفس هامش lhci-thresholds.cjs) و+150ms على الأقل
 *   - TBT (متذبذب تحت simulate): > max(الأساس × 1.25، الأساس + 200ms)
 *   - CLS: > الأساس + 0.05
 *   - الدرجات: أداء < الأساس − 0.05؛ وصول/ممارسات/SEO < الأساس − 0.03
 *
 *   node scripts/lhci-key-pages-gate.mjs            # فحص
 *   node scripts/lhci-key-pages-gate.mjs --update   # كتابة خط الأساس من القياس الحالي
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LHR_DIR = resolve(majalisRoot, ".lighthouseci");
const BASELINE_PATH = resolve(
  majalisRoot,
  "config/lhci-key-pages-baseline.json",
);
const UPDATE = process.argv.includes("--update");

const METRICS = {
  fcpMs: {
    audit: "first-contentful-paint",
    worse: (b, v) => v > Math.max(b * 1.1, b + 150),
  },
  lcpMs: {
    audit: "largest-contentful-paint",
    worse: (b, v) => v > Math.max(b * 1.1, b + 150),
  },
  siMs: {
    audit: "speed-index",
    worse: (b, v) => v > Math.max(b * 1.1, b + 150),
  },
  tbtMs: {
    audit: "total-blocking-time",
    worse: (b, v) => v > Math.max(b * 1.25, b + 200),
  },
  cls: { audit: "cumulative-layout-shift", worse: (b, v) => v > b + 0.05 },
};
const SCORES = {
  performance: 0.05,
  accessibility: 0.03,
  "best-practices": 0.03,
  seo: 0.03,
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

if (!existsSync(LHR_DIR)) {
  console.error(`لا توجد نتائج في ${LHR_DIR} — شغّل lhci collect أولًا.`);
  process.exit(1);
}
const lhrs = readdirSync(LHR_DIR)
  .filter((f) => /^lhr-.*\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(resolve(LHR_DIR, f), "utf8")));

const byPath = {};
for (const lhr of lhrs) {
  if (lhr.runtimeError) {
    console.error(
      `خطأ تشغيل Lighthouse على ${lhr.requestedUrl}: ${lhr.runtimeError.message}`,
    );
    process.exit(1);
  }
  const path = new URL(lhr.requestedUrl).pathname.replace(/\/$/, "") || "/";
  (byPath[path] ??= []).push(lhr);
}

const current = {};
for (const [path, runs] of Object.entries(byPath)) {
  const entry = { runs: runs.length };
  for (const [key, { audit }] of Object.entries(METRICS)) {
    const v = median(runs.map((r) => r.audits[audit]?.numericValue ?? NaN));
    entry[key] = key === "cls" ? Math.round(v * 10000) / 10000 : Math.round(v);
  }
  for (const cat of Object.keys(SCORES)) {
    entry[cat] = median(runs.map((r) => r.categories[cat]?.score ?? 0));
  }
  current[path] = entry;
}

if (UPDATE) {
  const out = {
    $comment:
      "وسيط قياس الصفحات المفتاحية (LHCI، 3 جولات، PSI Slow 4G، 412×823). يُولَّد بـ: node scripts/lhci-key-pages-gate.mjs --update",
    source: process.env.LHCI_BASELINE_SOURCE || "local",
    pages: current,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`خط الأساس كُتب: ${BASELINE_PATH}`);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(`لا خط أساس في ${BASELINE_PATH} — شغّل مع --update`);
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")).pages;

const regressions = [];
const rows = [];
for (const [path, now] of Object.entries(current)) {
  const base = baseline[path];
  if (!base) {
    regressions.push(`${path}: لا خط أساس لهذه الصفحة`);
    continue;
  }
  for (const [key, { worse }] of Object.entries(METRICS)) {
    if (worse(base[key], now[key]))
      regressions.push(`${path} ${key}: ${base[key]} → ${now[key]}`);
  }
  for (const [cat, slack] of Object.entries(SCORES)) {
    if (now[cat] < base[cat] - slack - 1e-9)
      regressions.push(`${path} ${cat}: ${base[cat]} → ${now[cat]}`);
  }
  rows.push(
    `| ${path} | ${Math.round(now.performance * 100)} | ${Math.round(now.accessibility * 100)} | ${Math.round(now["best-practices"] * 100)} | ${Math.round(now.seo * 100)} | ${now.fcpMs} | ${now.lcpMs} | ${now.tbtMs} | ${now.cls} | ${now.siMs} |`,
  );
}
for (const path of Object.keys(baseline)) {
  if (!current[path])
    regressions.push(`${path}: لم تُقَس (موجودة في خط الأساس)`);
}

const summary = [
  "### Lighthouse — الصفحات المفتاحية (جوال، وسيط 3 جولات)",
  "",
  "| الصفحة | أداء | وصول | ممارسات | SEO | FCP | LCP | TBT | CLS | SI |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...rows,
  "",
  regressions.length
    ? `**${regressions.length} تراجع عن خط الأساس (يُفشل الفحص):**\n${regressions.map((r) => `- ${r}`).join("\n")}`
    : "**لا تراجع عن خط الأساس.**",
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
console.log(`\nCURRENT_JSON ${JSON.stringify(current)}`);

process.exit(regressions.length ? 1 : 0);
