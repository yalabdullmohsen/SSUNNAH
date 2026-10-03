/**
 * بوابة قاعدة البيانات BK–BO.
 * Run: node --import tsx src/lib/__tests__/database-excellence-gate.test.ts
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

assert.ok(existsSync(resolve(root, "docs/design/DATABASE_EXCELLENCE_PROGRAM.md")));
assert.match(readRepo("docs/design/DATABASE_EXCELLENCE_PROGRAM.md"), /NOT_CONNECTED|DATABASE_URL/);
assert.match(readRepo("docs/design/DATABASE_EXCELLENCE_PROGRAM.md"), /QUERY_OPTIMIZATION_QUEUE/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:database-excellence"] || "", /database-excellence-engine/);
assert.match(pkg.scripts["test:supabase-policy-audit"] || "", /supabase-policy-audit/);

const run = spawnSync(process.execPath, ["scripts/database-excellence-engine.mjs", "--check"], {
  cwd: majalis,
  encoding: "utf8",
});
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/DATABASE_HEATMAP_REPORT.md",
  "docs/audit/QUERY_OPTIMIZATION_QUEUE.md",
  "docs/audit/INDEX_AUTHORITY_REPORT.md",
  "docs/audit/CACHE_OPTIMIZATION_PLAN.md",
  "docs/audit/SUNNAH_DATABASE_HEALTH_SCORECARD.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

const bundle = JSON.parse(readMaj("reports/database-excellence-engine.json"));
assert.equal(bundle.DATABASE_HEATMAP_REPORT.DATABASE_PERFORMANCE_DEEP_AUDIT, true);
assert.ok(bundle.DATABASE_HEATMAP_REPORT.schema.sqlFiles >= 10);
assert.equal(bundle.QUERY_OPTIMIZATION_QUEUE.SUPABASE_QUERY_OPTIMIZATION, true);
// SELECT_STAR_ELIMINATION_PROGRAM: data-fetch select('*') must stay at zero.
assert.equal(bundle.QUERY_OPTIMIZATION_QUEUE.counts.selectStar, 0);
assert.equal(bundle.INDEX_AUTHORITY_REPORT.DATABASE_INDEX_STRATEGY_REVIEW, true);
assert.equal(bundle.CACHE_OPTIMIZATION_PLAN.DATA_CACHING_STRATEGY_REVIEW, true);
assert.equal(bundle.SUNNAH_DATABASE_HEALTH_SCORECARD.DATABASE_READINESS_CERTIFICATION, true);
assert.ok(["EXCELLENT", "GOOD", "NEEDS_WORK", "CRITICAL"].includes(bundle.SUNNAH_DATABASE_HEALTH_SCORECARD.overallRating));
assert.equal(bundle.rlsOpenPolicies.length, 0);

assert.match(readRepo("docs/audit/SUNNAH_DATABASE_HEALTH_SCORECARD.md"), /EXCELLENT|GOOD|NEEDS_WORK|CRITICAL/);
assert.match(readRepo("docs/audit/DATABASE_HEATMAP_REPORT.md"), /NOT_CONNECTED/);

console.log(
  `database-excellence-gate: ok (${bundle.SUNNAH_DATABASE_HEALTH_SCORECARD.overallScore}/${bundle.SUNNAH_DATABASE_HEALTH_SCORECARD.overallRating} select*=${bundle.QUERY_OPTIMIZATION_QUEUE.counts.selectStar})`,
);
