/**
 * Final Internal Closure PR6 — page authority + legacy CSS SAFE_REMOVE.
 * node --import tsx src/lib/__tests__/closure-pr6-page-legacy-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

for (const rel of [
  "src/styles/pages/search-legacy.css",
  "src/styles/pages/section-hub.css",
] as const) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `removed: ${rel}`);
}

const patterns = read("src/components/design-system/screens/patterns.tsx");
assert.match(patterns, /compose === "mark"/);

const topic = read("src/components/topic/TopicPage.tsx");
assert.match(topic, /export function SectionTemplatePage/);
assert.match(topic, /sectionTemplateChrome/);
assert.match(topic, /<TopicPage/);

const idx = read("src/components/design-system/index.ts");
assert.match(idx, /TopicPage as AppPage/);
assert.match(idx, /SectionTemplatePage/);

const utilityGate = spawnSync(
  process.execPath,
  ["--import", "tsx", "src/lib/__tests__/no-new-utility-screen-gate.test.ts"],
  { cwd: majalisRoot, encoding: "utf8" },
);
assert.equal(utilityGate.status, 0, utilityGate.stderr || utilityGate.stdout);

const legacyGate = spawnSync(
  process.execPath,
  ["--import", "tsx", "src/lib/__tests__/legacy-css-retirement-gate.test.ts"],
  { cwd: majalisRoot, encoding: "utf8" },
);
assert.equal(legacyGate.status, 0, legacyGate.stderr || legacyGate.stdout);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.cssFiles <= 357, `cssFiles ceiling ≤357 (got ${budget.ceilings.cssFiles})`);
assert.equal(budget.ceilings.mjDeclOutsideAllowlist, 0);

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const report = readRepo("docs/design/PR6_PAGE_LEGACY_CLOSURE_REPORT.md");
assert.match(report, /## Page authority contract/);
assert.match(report, /\*\*REMOVED\*\* \(PR6\)/);
assert.match(report, /cssFiles/);


console.log("closure-pr6-page-legacy-gate.test.ts: ok");
