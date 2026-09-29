/**
 * Interaction PR-9 — Mushaf CSS boundary (live vs archived Madinah).
 * Run: node --import tsx src/lib/__tests__/mushaf-css-boundary-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/MUSHAF_CSS_BOUNDARY.md")));
const boundary = readRepo("docs/design/MUSHAF_CSS_BOUNDARY.md");
assert.match(boundary, /mushaf-reader/);
assert.match(boundary, /mushaf-madinah/);
assert.match(boundary, /NewMushafReader|LIVE/);
assert.match(boundary, /VerifiedMushafReader|ARCHIVED|archived/i);
assert.match(boundary, /IMMUTABLE|Quran text|نص القرآن|tashkeel|تشكيل/i);
assert.match(boundary, /!important/);
assert.match(boundary, /data-mushaf-appearance|MUSHAF_SPECIAL|appearance/i);
assert.match(boundary, /HOLD|not STORE GO|WEB_RELEASED_NATIVE_HOLD/);
assert.match(boundary, /not.*FULLY COMPLETE|Forbidden claims|غير مكتمل/i);

/* Live entry */
const page = read("src/pages/quran/MushafReaderPage.tsx");
assert.match(page, /NewMushafReader/);
assert.doesNotMatch(page, /VerifiedMushafReader/);

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /mushaf-reader\.css/);
assert.match(reader, /mushaf-madinah\.css/, "documented mm-* bridge import required until extraction");
assert.match(reader, /CSS archived reader|BLOCKED/);

const madinahIndex = read("src/features/mushaf-madinah/index.ts");
assert.match(madinahIndex, /أرشيفي|archive|VerifiedMushafReader/i);

/* CSS files exist on both sides of the boundary */
assert.ok(existsSync(resolve(majalisRoot, "src/features/mushaf-reader/mushaf-reader.css")));
assert.ok(existsSync(resolve(majalisRoot, "src/features/mushaf-madinah/mushaf-madinah.css")));
assert.ok(existsSync(resolve(majalisRoot, "src/styles/fonts-quran.css")));

const madinahCss = read("src/features/mushaf-madinah/mushaf-madinah.css");
assert.match(madinahCss, /fonts-quran\.css/);
assert.match(
  madinahCss,
  /لا letter-spacing على نص القرآن/,
  "Madinah CSS must document no letter-spacing on Quran/QPC text",
);
assert.match(
  madinahCss,
  /\.mm-ayah-line__word[\s\S]{0,120}?letter-spacing:\s*0/,
  "ayah/QPC word glyphs keep letter-spacing: 0",
);

/* Isolation: product brand layers must not own .nm-root / .mm-viewport page contracts */
const brand = read("src/styles/brand-v4.css");
assert.doesNotMatch(brand, /\.nm-root\s*\{/);
assert.doesNotMatch(brand, /\.mm-viewport\s*\{/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:mushaf-css-boundary"] || "", /mushaf-css-boundary-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:mushaf-css-boundary/);

console.log("mushaf-css-boundary-gate.test.ts: ok");
