/**
 * بوابة نضج المنتج BA–BE.
 * Run: node --import tsx src/lib/__tests__/product-maturity-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ICON_SIZE_SCALE } from "../size-authority.ts";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

for (const doc of [
  "docs/design/PRODUCT_MATURITY_PROGRAM.md",
  "docs/design/CONTENT_STYLE_AUTHORITY.md",
  "docs/design/ICON_AUTHORITY_MAP.md",
]) {
  assert.ok(existsSync(resolve(root, doc)), doc);
}

assert.match(readRepo("docs/design/CONTENT_STYLE_AUTHORITY.md"), /CONTENT_DESIGN_UNIFIED|ui-copy/);
assert.match(readRepo("docs/design/ICON_AUTHORITY_MAP.md"), /ICON_SYSTEM_UNIFIED|Lucide/);
assert.equal(ICON_SIZE_SCALE.md, 18);
assert.equal(ICON_SIZE_SCALE.lg, 22);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:product-maturity"] || "", /product-maturity-engine/);

const run = spawnSync(process.execPath, ["scripts/product-maturity-engine.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/PRODUCT_MATURITY_SCORECARD.md",
  "docs/audit/DESIGN_DRIFT_ATLAS.md",
  "docs/audit/MICRO_FRICTION_BACKLOG.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

const bundle = JSON.parse(readMaj("reports/product-maturity-engine.json"));
assert.equal(bundle.PRODUCT_MATURITY_SCORECARD.PRODUCT_MATURITY_AUDIT, true);
assert.ok(["FOUNDATION", "ADVANCED", "MATURE", "EXCELLENT"].includes(bundle.PRODUCT_MATURITY_SCORECARD.overallLevel));
assert.equal(bundle.DESIGN_DRIFT_ATLAS.DESIGN_DRIFT_ERADICATION, true);
assert.ok(bundle.DESIGN_DRIFT_ATLAS.entryCount >= 5);
assert.equal(bundle.MICRO_FRICTION_BACKLOG.UX_MICRO_FRICTION_ELIMINATION, true);
assert.equal(bundle.CONTENT_STYLE_SCAN.CONTENT_DESIGN_UNIFICATION, true);
assert.equal(bundle.ICON_SCAN.ICON_SYSTEM_UNIFICATION, true);
assert.ok(bundle.ICON_SCAN.lucideFiles >= 1);

assert.match(readRepo("docs/audit/PRODUCT_MATURITY_SCORECARD.md"), /FOUNDATION|ADVANCED|MATURE|EXCELLENT/);
assert.ok(existsSync(resolve(majalis, "src/lib/ui-copy.ts")));

console.log(
  `product-maturity-gate: ok (${bundle.PRODUCT_MATURITY_SCORECARD.overallScore}/${bundle.PRODUCT_MATURITY_SCORECARD.overallLevel} drift=${bundle.DESIGN_DRIFT_ATLAS.entryCount})`,
);
