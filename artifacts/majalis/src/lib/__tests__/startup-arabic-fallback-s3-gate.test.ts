/**
 * PR S3 — منع فترة نص غير مرئي في نظام الخطوط الجديد (Almarai).
 * (قياس البدائل المعايَرة أُلغي مع إزالة الخطوط القديمة.)
 * تشغيل: node --import tsx src/lib/__tests__/startup-arabic-fallback-s3-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fontSystemCss, renderedIndexHtml } from "./font-system-test-helper";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const fonts = fontSystemCss();
const faces = fonts.match(/@font-face\s*\{[^}]*\}/g) ?? [];
assert.equal(faces.length, 8, "8 أوجه");
for (const f of faces) {
  assert.match(f, /font-display:\s*swap/, "swap — لا فترة نص غير مرئي");
  assert.doesNotMatch(f, /font-display:\s*(block|optional|fallback)/);
}
assert.doesNotMatch(fonts, /size-adjust:\s*105%/);

const html = renderedIndexHtml();
assert.doesNotMatch(html, /MajlisFallback/, "لا بدائل معايَرة قديمة");
assert.doesNotMatch(html, /font-display:\s*block/i);
assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);

const critical = readPkg("src/styles/critical-first-paint.css");
assert.doesNotMatch(critical, /@font-face/);

const quranFonts = readPkg("src/styles/fonts-quran.css");
assert.doesNotMatch(quranFonts, /@font-face/, "تعريف الخط في font-system.css وfont-faces-deferred.css فقط");

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-arabic-fallback-s3"/);
assert.match(pkg, /"test:startup-typography-fouc-p2"/);

console.log("NO_TEXT_INVISIBLE_PERIOD");
console.log("NO_QURAN_FONT_CHANGE");
console.log("startup-arabic-fallback-s3-gate: ok");
