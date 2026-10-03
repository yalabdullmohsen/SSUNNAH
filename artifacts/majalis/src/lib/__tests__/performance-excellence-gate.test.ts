/**
 * بوابة أداء BF–BJ — أرقام/إشارات ساكنة أولًا.
 * Run: node --import tsx src/lib/__tests__/performance-excellence-gate.test.ts
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

assert.ok(existsSync(resolve(root, "docs/design/PERFORMANCE_EXCELLENCE_PROGRAM.md")));
assert.match(readRepo("docs/design/PERFORMANCE_EXCELLENCE_PROGRAM.md"), /No speculative fixes|أرقام/);
assert.match(readRepo("docs/design/PERFORMANCE_EXCELLENCE_PROGRAM.md"), /RENDER_COST_REPORT/);
assert.match(readRepo("docs/design/PERFORMANCE_EXCELLENCE_PROGRAM.md"), /MUSHAF_BOTTLENECK/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:performance-excellence"] || "", /performance-excellence-engine/);
assert.match(pkg.scripts["test:bundle-budget"] || "", /test-bundle-budget/);
assert.ok(existsSync(resolve(majalis, "performance-budget.json")));

const run = spawnSync(process.execPath, ["scripts/performance-excellence-engine.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/RENDER_COST_REPORT.md",
  "docs/audit/MUSHAF_BOTTLENECK_REPORT.md",
  "docs/audit/STARTUP_PERFORMANCE_REPORT.md",
  "docs/audit/NETWORK_EFFICIENCY_REPORT.md",
  "docs/audit/PERFORMANCE_BUDGET_REPORT.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

const bundle = JSON.parse(readMaj("reports/performance-excellence-engine.json"));
assert.equal(bundle.RENDER_COST_REPORT.REACT_RENDER_COST_AUDIT, true);
assert.ok(bundle.RENDER_COST_REPORT.surfaces.length >= 4);
assert.equal(bundle.MUSHAF_BOTTLENECK_REPORT.MUSHAF_PERFORMANCE_DEEP_DIVE, true);
assert.match(String(bundle.MUSHAF_BOTTLENECK_REPORT.measured.pageTurnLatencyMs), /NOT_MEASURED|DEVICE/);
assert.equal(bundle.STARTUP_PERFORMANCE_REPORT.STARTUP_PERFORMANCE_ELIMINATION, true);
assert.ok(bundle.STARTUP_PERFORMANCE_REPORT.syncCssImportsInMain >= 1);
assert.equal(bundle.NETWORK_EFFICIENCY_REPORT.NETWORK_EFFICIENCY_PROGRAM, true);
assert.equal(bundle.PERFORMANCE_BUDGET_REPORT.PERFORMANCE_BUDGET_ENFORCEMENT, true);
assert.ok(Array.isArray(bundle.PERFORMANCE_BUDGET_REPORT.PERFORMANCE_DRIFT_ALERTS));

assert.match(readRepo("docs/audit/MUSHAF_BOTTLENECK_REPORT.md"), /No speculative fixes/);
assert.ok(existsSync(resolve(root, "docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md")));

console.log(
  `performance-excellence-gate: ok (top=${bundle.RENDER_COST_REPORT.highestCpuConsumersProxy[0]} alerts=${bundle.PERFORMANCE_BUDGET_REPORT.PERFORMANCE_DRIFT_ALERTS.length})`,
);
