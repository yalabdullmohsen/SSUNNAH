/**
 * Track A1 — ملكية مسار المصحف الإنتاجي.
 * node --import tsx src/lib/__tests__/mushaf-ownership-a1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const routes = read("src/AppRoutes.tsx");
assert.match(
  routes,
  /path="\/mushaf"><SafeLazyRoute component=\{MushafReaderPage\}/,
  "/mushaf must mount MushafReaderPage",
);

const page = read("src/pages/quran/MushafReaderPage.tsx");
assert.match(page, /from ["']@\/features\/mushaf-reader["']/, "page imports mushaf-reader");
assert.match(page, /NewMushafReader/, "page uses NewMushafReader");
assert.doesNotMatch(
  page,
  /@\/features\/mushaf-madinah/,
  "production page must not import mushaf-madinah",
);
assert.doesNotMatch(page, /VerifiedMushafReader/, "VerifiedMushafReader not on /mushaf");

const madinahIndex = read("src/features/mushaf-madinah/index.ts");
assert.match(
  madinahIndex,
  /أرشيفي|مؤرشف|archival|archived/i,
  "madinah index documents archival status",
);

/** مساعدات الصفحة يجب أن تُستورد من shared لا من madinah في مسارات الإنتاج غير الذاتية */
const helperConsumers = [
  "src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx",
  "src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx",
  "src/lib/mushaf-v2/QuranSearchEngine.ts",
  "src/lib/quran/quranRecitationService.ts",
  "src/lib/quran-navigation/validate.ts",
];
for (const rel of helperConsumers) {
  const t = read(rel);
  assert.doesNotMatch(
    t,
    /@\/features\/mushaf-madinah\/mushaf-page-for-ayah/,
    `${rel}: page-for-ayah must come from mushaf-shared`,
  );
}

console.log("mushaf-ownership-a1-gate: ok");
console.log("MUSHAF_OWNERSHIP_DECIDED");
console.log("CANONICAL_PRODUCTION=/mushaf→MushafReaderPage→NewMushafReader");
