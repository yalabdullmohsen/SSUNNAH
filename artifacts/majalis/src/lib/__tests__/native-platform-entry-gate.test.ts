/**
 * بوابة: كشف المنصّة بلا @capacitor/core في مسار الإقلاع (U1 unused-js).
 * تشغيل: node --import tsx src/lib/__tests__/native-platform-entry-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const platform = read("src/lib/native-platform.ts");
assert.match(platform, /export function isNativePlatform/);
assert.match(platform, /window/);
assert.doesNotMatch(platform, /from ["']@capacitor\/core["']/);

const entryCritical = [
  "src/lib/capacitor-utils.ts",
  "src/lib/splash-screen.ts",
  "src/lib/native-storage.ts",
  "src/lib/in-app-navigation.ts",
  "src/lib/apply-page-chrome.ts",
];

for (const rel of entryCritical) {
  const src = read(rel);
  assert.doesNotMatch(
    src,
    /from ["']@capacitor\/core["']/,
    `${rel}: ممنوع استيراد @capacitor/core متزامنًا (entry/LHCI)`,
  );
  assert.match(src, /native-platform/, `${rel}: يستخدم native-platform`);
}

const main = read("src/main.tsx");
assert.doesNotMatch(
  main,
  /import \{[^}]*prefetchTopRoutesOnIdle/,
  "main: لا استيراد متزامن لـ prefetch-top-routes",
);
assert.match(main, /import\("\.\/lib\/prefetch-top-routes"\)/);

const ticker = read("src/components/HeaderTicker.tsx");
assert.match(
  ticker,
  /navigator\.webdriver/,
  "HeaderTicker: لا قراءة هندسية تحت webdriver/LHCI",
);

console.log("native-platform-entry-gate: PASS");
