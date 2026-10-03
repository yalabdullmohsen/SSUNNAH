/**
 * بوابة صقل المنتج AV–AZ.
 * Run: node --import tsx src/lib/__tests__/product-excellence-gate.test.ts
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

assert.ok(existsSync(resolve(root, "docs/design/PRODUCT_EXCELLENCE_PROGRAM.md")));
assert.match(readRepo("docs/design/PRODUCT_EXCELLENCE_PROGRAM.md"), /PRODUCT_COHESION_SCORE/);
assert.match(readRepo("docs/design/PRODUCT_EXCELLENCE_PROGRAM.md"), /TOKEN_MIGRATION_QUEUE/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:product-excellence"] || "", /product-excellence-engine/);

const run = spawnSync(process.execPath, ["scripts/product-excellence-engine.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/PRODUCT_COHESION_REPORT.md",
  "docs/audit/TOKEN_MIGRATION_QUEUE.md",
  "docs/audit/COMPONENT_RATIONALIZATION_REPORT.md",
  "docs/audit/JOURNEY_LENGTH_REPORT.md",
  "docs/audit/POLISH_BACKLOG.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

const bundle = JSON.parse(readMaj("reports/product-excellence-engine.json"));
assert.equal(typeof bundle.PRODUCT_COHESION_SCORE, "number");
assert.ok(bundle.PRODUCT_COHESION_SCORE >= 1);
assert.equal(bundle.PRODUCT_COHESION_REPORT.PRODUCT_COHESION_AUDIT, true);
assert.equal(bundle.TOKEN_MIGRATION_QUEUE.TOKEN_ENFORCEMENT_MIGRATION, true);
assert.ok(bundle.TOKEN_MIGRATION_QUEUE.top.length >= 5);
assert.equal(bundle.COMPONENT_RATIONALIZATION_REPORT.COMPONENT_USAGE_RATIONALIZATION, true);
assert.equal(bundle.JOURNEY_LENGTH_REPORT.NAVIGATION_JOURNEY_COMPRESSION, true);
assert.ok(bundle.JOURNEY_LENGTH_REPORT.journeys.length >= 4);
assert.equal(bundle.POLISH_BACKLOG.PRODUCT_POLISH_PASS, true);

assert.match(readRepo("docs/audit/PRODUCT_COHESION_REPORT.md"), /PRODUCT_COHESION_SCORE/);
assert.match(readRepo("docs/audit/JOURNEY_LENGTH_REPORT.md"), /Home → Mushaf/);

console.log(
  `product-excellence-gate: ok (cohesion=${bundle.PRODUCT_COHESION_SCORE} migration=${bundle.TOKEN_MIGRATION_QUEUE.totalFilesWithViolations} polish=${bundle.POLISH_BACKLOG.total})`,
);
