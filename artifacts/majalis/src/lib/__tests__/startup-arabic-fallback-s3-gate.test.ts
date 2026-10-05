/**
 * PR S3 — مواءمة مقاييس بديل العربية + منع فترة نص غير مرئي.
 * تشغيل: node --import tsx src/lib/__tests__/startup-arabic-fallback-s3-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const doc = readRepo("docs/performance/STARTUP_ARABIC_FALLBACK_S3.md");
assert.match(doc, /ARABIC_FALLBACK_METRICS_ALIGNED|STARTUP_ARABIC_FALLBACK_S3/);
assert.match(doc, /size-adjust \*\*97%\*\*|size-adjust:\s*97%/);
assert.match(doc, /NO_QURAN_FONT_CHANGE/);

const metricsPath = resolve(majalisRoot, "reports/ui-fallback-metrics.json");
assert.ok(existsSync(metricsPath), "ui-fallback-metrics.json");
const metrics = JSON.parse(readFileSync(metricsPath, "utf8")) as {
  bestSizeAdjustPercent: number;
  bestSumAbsWidthDelta: number;
  baseline105: number;
};
assert.equal(metrics.bestSizeAdjustPercent, 97);
assert.ok(metrics.bestSumAbsWidthDelta < metrics.baseline105);

const fontsUi = readPkg("src/styles/fonts-ui.css");
/* STARTUP_SMOOTHNESS: البدائل المعايَرة مصدرها الوحيد index.html — تكرارها في CSS متأخر يبدّل الوجه بعد الرسم */
assert.doesNotMatch(fontsUi, /font-family:\s*"Majlis(Amiri)?Fallback"/);
assert.doesNotMatch(fontsUi, /size-adjust:\s*105%/);

const critical = readPkg("src/styles/critical-first-paint.css");
assert.doesNotMatch(critical, /font-family:\s*"MajlisAmiriFallback"/);
assert.doesNotMatch(critical, /size-adjust:\s*105%/);

const html = readPkg("index.html");
assert.match(html, /MajlisAmiriFallback[^}]*size-adjust:97%/);
assert.match(html, /MajlisAmiriFallback[^}]*line-gap-override:0%/);
assert.match(html, /"MajlisFallback"[^}]*local\("GeezaPro"\)[^}]*size-adjust:/);
assert.match(html, /font-display:optional/);
assert.doesNotMatch(html, /font-display:\s*block/i);

const quranFonts = readPkg("src/styles/fonts-quran.css");
assert.doesNotMatch(quranFonts, /MajlisAmiriFallback/);
assert.match(quranFonts, /size-adjust:\s*100%/);

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-arabic-fallback-s3"/);
assert.match(pkg, /"test:startup-typography-fouc-p2"/);

console.log("ARABIC_FALLBACK_METRICS_ALIGNED");
console.log("FONT_METRIC_SHIFT_REDUCED");
console.log("NO_TEXT_INVISIBLE_PERIOD");
console.log("NO_QURAN_FONT_CHANGE");
console.log("startup-arabic-fallback-s3-gate: ok");
