/**
 * M4 — Mushaf path ownership classification (no unowned implementation).
 * node --import tsx src/lib/__tests__/mushaf-path-classification-m4-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const allowed = new Set([
  "CANONICAL_PRODUCTION",
  "ACTIVE_SPECIAL",
  "LEGACY_WITH_CONSUMERS",
  "MIGRATE_THEN_REMOVE",
  "DEAD_WITH_PROOF",
]);

const doc = JSON.parse(
  readRepo("docs/audit/MUSHAF_PATH_CLASSIFICATION_a0d14e7d2.json"),
);
assert.equal(doc.unknownCount, 0);
assert.equal(doc.canonicalRoute, "/mushaf");
assert.ok(Array.isArray(doc.paths) && doc.paths.length >= 4);

for (const p of doc.paths) {
  assert.ok(allowed.has(p.classification), `${p.id}: invalid class ${p.classification}`);
  assert.ok(p.id && p.module && p.evidence, `${p.id}: incomplete keep/evidence fields`);
}

const page = readMaj("src/pages/quran/MushafReaderPage.tsx");
assert.match(page, /NewMushafReader/);
assert.doesNotMatch(page, /VerifiedMushafReader/);

const routes = readMaj("src/AppRoutes.tsx");
assert.match(routes, /path="\/mushaf"/);
assert.match(routes, /MushafReaderPage/);
assert.match(routes, /\/mushaf-v2-preview"><Redirect to="\/mushaf"/);

const engine = readMaj("src/pages/quran/QuranEnginePage.tsx");
assert.match(engine, /QuranViewer/);

const madinahIndex = readMaj("src/features/mushaf-madinah/index.ts");
assert.match(madinahIndex, /أرشيفي|archive|VerifiedMushafReader/i);

const reader = readMaj("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /mushaf-madinah\/MushafSearchSheet/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(
  pkg.scripts["test:mushaf-path-classification-m4"] || "",
  /mushaf-path-classification-m4-gate/,
);

console.log(
  `mushaf-path-classification-m4-gate: ok (paths=${doc.paths.length}, unknown=${doc.unknownCount})`,
);
