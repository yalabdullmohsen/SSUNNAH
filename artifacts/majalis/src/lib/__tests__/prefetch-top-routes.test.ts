/**
 * بوابة: تسخين خفيف عند الخمول — بلا مصحف ثقيل ولا بحث على إقلاع الرئيسية.
 * تشغيل: npx tsx src/lib/__tests__/prefetch-top-routes.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = readFileSync(resolve(root, "src/lib/prefetch-top-routes.ts"), "utf8");
const main = readFileSync(resolve(root, "src/main.tsx"), "utf8");

assert.match(src, /SectionsPage/);
assert.match(src, /QuranHubPage/);
assert.match(src, /PrayerTimesPage/);
assert.match(src, /LessonsPage/);
assert.match(src, /HadithPage|FiqhPage/);
assert.match(src, /prefetchAppRoutesShell/);
assert.match(src, /prefetchHomeWarmRoutes/);
assert.doesNotMatch(src, /MushafReaderPage|SearchPage|HomePage/);
assert.match(src, /requestIdleCallback/);
assert.match(src, /runPrefetchTopRoutes/);
assert.match(src, /(?:10_000|25_000)/);
assert.doesNotMatch(main, /import \{[^}]*prefetchTopRoutesOnIdle/);
assert.match(main, /import\("\.\/lib\/prefetch-top-routes"\)/);
assert.match(main, /runPrefetchTopRoutes/);
assert.match(main, /25_000/);
console.log("  ✓ prefetch-top-routes ديناميكي متأخر (مراكز التبويب + هيكل المسارات)");
