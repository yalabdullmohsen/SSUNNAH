/**
 * Polish wave AL–AP — interaction / coverage / consistency / admin / journeys.
 * Run: node --import tsx src/lib/__tests__/polish-consistency-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { INTERACTION_STATE_AUTHORITY } from "../interaction/tokens.ts";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

for (const doc of [
  "docs/design/INTERACTION_AUTHORITY_MAP.md",
  "docs/design/ADMIN_UI_AUTHORITY_MAP.md",
  "docs/design/EMPTY_STATE_STANDARD.md",
  "docs/audit/USER_JOURNEY_OPTIMIZATION_PLAN.md",
]) {
  assert.ok(existsSync(resolve(root, doc)), `missing ${doc}`);
}

const interaction = readRepo("docs/design/INTERACTION_AUTHORITY_MAP.md");
assert.match(interaction, /INTERACTION_SYSTEM_UNIFIED/);
assert.match(interaction, /hovered|focused|pressed|loading|disabled/i);
assert.match(interaction, /EmptyStateV2|LoadingStateV2|ErrorStateV2/);

assert.equal(INTERACTION_STATE_AUTHORITY.focused.includes("focus"), true);
assert.ok(INTERACTION_STATE_AUTHORITY.loading.includes("LoadingStateV2"));

const admin = readRepo("docs/design/ADMIN_UI_AUTHORITY_MAP.md");
assert.match(admin, /ADMIN_UI_STANDARDIZED/);
assert.match(admin, /EmptyStateV2/);

const empty = readRepo("docs/design/EMPTY_STATE_STANDARD.md");
assert.match(empty, /EMPTY_STATE_EXCELLENCE/);
assert.match(empty, /nextStep/);

const journey = readRepo("docs/audit/USER_JOURNEY_OPTIMIZATION_PLAN.md");
assert.match(journey, /USER_JOURNEY_SIMPLIFICATION/);
assert.match(journey, /read Quran|القرآن|Mushaf/i);
assert.match(journey, /prayer|الصلاة/i);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:authority-coverage"] || "", /authority-coverage-report/);
assert.match(pkg.scripts["test:polish-consistency"] || "", /polish-consistency-gate/);

const cov = spawnSync(process.execPath, ["scripts/authority-coverage-report.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(cov.status, 0, cov.stderr || cov.stdout);

assert.ok(existsSync(resolve(majalis, "reports/authority-coverage.json")));
assert.ok(existsSync(resolve(root, "docs/audit/AUTHORITY_COVERAGE_REPORT.md")));

const coverage = JSON.parse(readMaj("reports/authority-coverage.json"));
assert.ok(typeof coverage.AUTHORITY_ADOPTION_PERCENTAGE === "number");
assert.ok(coverage.AUTHORITY_ADOPTION_PERCENTAGE >= 1);

const gov = readMaj("scripts/design-governance-report.mjs");
assert.match(gov, /driftScore/);
assert.match(gov, /authorityAdoptionRatio/);
assert.match(gov, /easiestWins/);
assert.match(gov, /authority-coverage-report/);
assert.match(gov, /DESIGN_CONSISTENCY_SCORING/);

const scoreRun = spawnSync(process.execPath, ["scripts/design-governance-report.mjs"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(scoreRun.status, 0, scoreRun.stderr || scoreRun.stdout);

const score = JSON.parse(readMaj("reports/DESIGN_CONSISTENCY_SCORE.json"));
assert.equal(typeof score.consistencyScore, "number");
assert.equal(typeof score.driftScore, "number");
assert.equal(typeof score.authorityAdoptionRatio, "number");
assert.ok(Array.isArray(score.topDivergenceSources));
assert.ok(Array.isArray(score.easiestWins));
assert.equal(score.DESIGN_CONSISTENCY_SCORING, true);
assert.ok(existsSync(resolve(root, "docs/audit/DESIGN_CONSISTENCY_SCORE.md")));

console.log(
  `polish-consistency-gate: ok (consistency=${score.consistencyScore} adoption=${score.authorityAdoptionRatio})`,
);
