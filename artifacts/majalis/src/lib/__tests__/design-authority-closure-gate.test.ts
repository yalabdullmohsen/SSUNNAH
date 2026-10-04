/**
 * PR F — Design authority closure gate (extends css-authority + design-governance).
 * Run: node --import tsx src/lib/__tests__/design-authority-closure-gate.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");

console.log("=== design-authority-closure-report --check ===");
execFileSync(process.execPath, ["scripts/design-authority-closure-report.mjs", "--check"], {
  cwd: majalisRoot,
  stdio: "inherit",
});

const report = JSON.parse(
  readFileSync(resolve(majalisRoot, "reports/design-authority-closure.json"), "utf8"),
) as { failures: string[]; coverage: Record<string, unknown> };

assert.equal(report.failures.length, 0, `closure failures: ${report.failures.join("; ")}`);
assert.equal(report.coverage.emptyRules, 0, "uncommented empty selectors forbidden");
assert.ok(
  (report.coverage.keepSpecialEmptyRules as number) >= 1,
  "expected documented KEEP_SPECIAL empty anchors",
);
assert.equal(report.coverage.commentsOnlyFiles, 0);
assert.equal(report.coverage.circularImports, 0);
assert.equal((report.coverage.deadFilesPresent as string[]).length, 0);
assert.equal((report.coverage.unknownTokenFamilies as string[]).length, 0);
assert.equal(report.coverage.regionsLabeled, true);

const requiredDocs = [
  "docs/audit/DESIGN_AUTHORITY_COVERAGE.md",
  "docs/audit/SELECTOR_OWNER_MAP.md",
  "docs/audit/TOKEN_MIGRATION_STATUS.md",
  "docs/audit/COMPATIBILITY_RETIREMENT_STATUS.md",
  "docs/audit/DEAD_CSS_EVIDENCE.md",
  "docs/audit/CSS_IMPORT_GRAPH.md",
];
for (const rel of requiredDocs) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
  assert.match(readFileSync(resolve(repoRoot, rel), "utf8"), /TASK_CLASSIFICATION|DEAD_CSS|CSS_IMPORT/);
}

assert.match(
  readFileSync(resolve(repoRoot, "docs/audit/DESIGN_AUTHORITY_COVERAGE.md"), "utf8"),
  /NO_PARALLEL_GOVERNANCE_ENGINE = true/,
);

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
assert.match(pkg.scripts["test:design-authority-closure"] || "", /design-authority-closure-gate/);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:design-authority-closure/);
assert.match(pkg.scripts["test:css-authority-graph"] || "", /css-authority-graph-gate/);

console.log("design-authority-closure-gate.test.ts: ok");
console.log("DESIGN_AUTHORITY_REGRESSION_PREVENTED");
console.log("SELECTOR_DUPLICATION_REGRESSION_PREVENTED");
console.log("TOKEN_DRIFT_PREVENTED");
console.log("COMPATIBILITY_GROWTH_PREVENTED");
console.log("DEAD_CSS_GROWTH_PREVENTED");
console.log("NO_PARALLEL_GOVERNANCE_ENGINE");
