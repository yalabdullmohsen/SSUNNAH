/**
 * PR S2 — خفض الرسم الناعم المتأخر: لا سلطة html/body في الطبقات المؤجّلة + توجيه enrichment.
 * تشغيل: node --import tsx src/lib/__tests__/startup-deferred-css-s2-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const main = read("src/main.tsx");
const fn = main.match(/function loadNonCriticalCss\(\)\s*\{([\s\S]*?)\nfunction scheduleNonCriticalCss/);
assert.ok(fn, "loadNonCriticalCss body");
const body = fn![1]!;

/* enrichment ليس على مسار Home/Mushaf idle المبكر */
assert.match(
  body,
  /if\s*\(\s*!deferAppChromeCss\s*\)\s*\{\s*void import\("\.\/styles\/visual-enrichment\.css"\)/,
);
assert.match(
  body,
  /deferAppChromeCss[\s\S]*?void import\("\.\/styles\/visual-enrichment\.css"\)/,
);

/* فروع حصرية: لا تحميل مزدوج لنفس الملف على نفس المسار */
assert.ok(
  (body.match(/void import\("\.\/styles\/modern-ui-refresh\.css"\)/g) || []).length === 2,
);
assert.match(body, /if\s*\(\s*!deferAppChromeCss\s*\)[\s\S]*?modern-ui-refresh/);
assert.match(body, /if\s*\(\s*deferAppChromeCss\s*\)[\s\S]*?modern-ui-refresh/);

const deferredSheets = [
  "src/styles/design-system.css",
  "src/styles/final-release.css",
  "src/styles/visual-enrichment.css",
  "src/styles/card-system.css",
  "src/styles/card-system-v2.css",
  "src/styles/modern-islamic-editorial.css",
  "src/styles/m2030/foundation.css",
];

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

for (const rel of deferredSheets) {
  const css = stripComments(read(rel));
  /* ممنوع مطلق 16px/17px على html — الصيغة الكانونية calc(--ui-font-scale) مسموحة للمواءمة */
  assert.doesNotMatch(
    css,
    /(?:^|\n)\s*html\s*\{[^}]*font-size\s*:\s*\d+px/m,
    `${rel}: no absolute html font-size in deferred`,
  );
  assert.doesNotMatch(
    css,
    /(?:^|\n)\s*body\s*\{[^}]*font-size\s*:\s*\d+px/m,
    `${rel}: no absolute body font-size in deferred`,
  );
  assert.doesNotMatch(
    css,
    /(?:^|\n)\s*(?:html|body)\s*\{[^}]*(?:background|background-color)\s*:/m,
    `${rel}: no deferred html/body background authority`,
  );
}

const sync = [...main.split("function loadNonCriticalCss")[0]!.matchAll(/^\s*import\s+"\.\/[^"]+\.css"/gm)];
assert.equal(sync.length, 14, "CRITICAL_CSS_BUDGET_HELD");

console.log("DEFERRED_STYLESHEET_COUNT_REDUCED");
console.log("LATE_VISIBLE_RESTYLE_REDUCED");
console.log("NO_DEFERRED_HTML_BODY_AUTHORITY");
console.log("CRITICAL_CSS_BUDGET_HELD");
console.log("startup-deferred-css-s2-gate: ok");
