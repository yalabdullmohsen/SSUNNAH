/**
 * بوابة محرك امتثال نظام التصميم (AQ–AU).
 * Run: node --import tsx src/lib/__tests__/design-compliance-engine-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

assert.ok(existsSync(resolve(root, "docs/design/DESIGN_SYSTEM_COMPLIANCE_ENGINE.md")));
const doc = readRepo("docs/design/DESIGN_SYSTEM_COMPLIANCE_ENGINE.md");
assert.match(doc, /DESIGN_SYSTEM_COMPLIANCE_ENGINE/);
assert.match(doc, /DESIGN_COMPLIANCE_SCORE/);
assert.match(doc, /Prevent future visual drift|Prevents future visual drift/i);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:design-compliance-engine"] || "", /design-compliance-engine/);

const run = spawnSync(process.execPath, ["scripts/design-compliance-engine.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/DESIGN_COMPLIANCE_REPORT.md",
  "docs/audit/DESIGN_COMPLIANCE_SCORE.md",
  "docs/audit/TOKEN_COVERAGE_SCORECARD.md",
  "docs/audit/UI_DUPLICATION_REPORT.md",
  "docs/audit/CONSISTENCY_PRIORITY_MATRIX.md",
  "docs/audit/PRODUCT_SURFACE_MAP.md",
  "docs/audit/SUNNAH_PRODUCT_CERTIFICATION_REPORT.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), `missing ${rel}`);
}

const engine = JSON.parse(readMaj("reports/design-compliance-engine.json"));
assert.equal(typeof engine.DESIGN_COMPLIANCE_SCORE, "number");
assert.ok(engine.DESIGN_COMPLIANCE_SCORE >= 1);
assert.equal(engine.TOKEN_COVERAGE_SCORECARD.TOKEN_COVERAGE_AUDIT, true);
assert.equal(engine.UI_DUPLICATION_REPORT.UI_DUPLICATION_ELIMINATION, true);
assert.equal(engine.VISUAL_HEATMAP.CONSISTENCY_HEATMAP, true);
assert.equal(engine.PRODUCT_SURFACE_MAP.COMPLETE_PRODUCT_SURFACE_INVENTORY, true);
assert.equal(engine.PRODUCT_SURFACE_MAP.unclassified, 0);
assert.equal(engine.SUNNAH_PRODUCT_CERTIFICATION_REPORT.FINAL_PRODUCT_CERTIFICATION, true);
assert.ok(["CERTIFIED", "PARTIAL", "NOT_CERTIFIED"].includes(engine.SUNNAH_PRODUCT_CERTIFICATION_REPORT.overallRating));
assert.ok(Array.isArray(engine.COMPONENT_COMPLIANCE_INDEX));
assert.ok(engine.COMPONENT_COMPLIANCE_INDEX.length >= 5);

const cert = readRepo("docs/audit/SUNNAH_PRODUCT_CERTIFICATION_REPORT.md");
assert.match(cert, /CERTIFIED|PARTIAL|NOT_CERTIFIED/);
assert.match(cert, /NOT UNIFIED_100|لا UNIFIED_100|NOT UNIFIED/);

console.log(
  `design-compliance-engine-gate: ok (score=${engine.DESIGN_COMPLIANCE_SCORE} cert=${engine.SUNNAH_PRODUCT_CERTIFICATION_REPORT.overallRating})`,
);
