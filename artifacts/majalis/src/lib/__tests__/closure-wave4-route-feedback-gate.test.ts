/**
 * WAVE4 — public feedback + route-quality closure gate.
 * node --import tsx src/lib/__tests__/closure-wave4-route-feedback-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const components = [
  "src/components/design-system/NoResultsState.tsx",
  "src/components/design-system/StaleDataIndicator.tsx",
  "src/components/design-system/PermissionDeniedState.tsx",
  "src/components/design-system/RateLimitedState.tsx",
  "src/components/design-system/EmptyStateV2.tsx",
  "src/components/design-system/ErrorStateV2.tsx",
  "src/components/design-system/OfflineStateV2.tsx",
  "src/components/design-system/LoadingStateV2.tsx",
] as const;

for (const rel of components) {
  assert.ok(existsSync(resolve(majalisRoot, rel)), rel);
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: لا raw button`);
  assert.doesNotMatch(text, /\bwindow\.(confirm|alert)\s*\(/, `${rel}: لا window.confirm/alert`);
}

const idx = read("src/components/design-system/index.ts");
for (const name of [
  "NoResultsState",
  "StaleDataIndicator",
  "PermissionDeniedState",
  "RateLimitedState",
]) {
  assert.match(idx, new RegExp(name));
}

const lessons = read("src/pages/lessons/ui/LessonsView.tsx");
assert.doesNotMatch(lessons, /safeLocationReload/);
assert.match(lessons, /setReloadKey/);

const fiqh = read("src/pages/fiqh/ui/RulingsView.tsx");
assert.doesNotMatch(fiqh, /تعذّر تحميل الأحكام: \$\{/);

const search = read("src/pages/account/ui/SearchView.tsx");
assert.doesNotMatch(search, /setError\([^)]*err\.message/);

const authority = readRepo("docs/design/FORM_FEEDBACK_AUTHORITY.md");
assert.match(authority, /Empty ≠ NoResults/);

const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
const by = Object.fromEntries(matrix.routes.map((r: { route: string }) => [r.route, r]));
const must = ["/", "/search", "/lessons", "/fiqh", "/my-learning", "/login", "/register"] as const;
for (const route of must) {
  const row = by[route];
  assert.ok(row, `matrix missing ${route}`);
  assert.notEqual(row.loading, "PENDING", `${route} loading not PENDING`);
  assert.notEqual(row.error, "PENDING", `${route} error not PENDING`);
  assert.ok(row.wave4TestRef, `${route} needs wave4TestRef`);
  assert.notEqual(row.empty, "PENDING", `${route} empty not PENDING`);
}
assert.equal(by["/search"].noResults, "COMPLETE");
assert.equal(by["/lessons"].noResults, "COMPLETE");
assert.equal(by["/login"].empty, "NOT_APPLICABLE");
assert.equal(by["/admin/v3"].empty, "NOT_APPLICABLE");

const scope = JSON.parse(readRepo("docs/audit/WAVE4_ROUTE_SCOPE_MANIFEST.json"));
assert.equal(scope.IMPLEMENTATION_FROZEN, true);
assert.ok(scope.priorityPublic?.length >= 10);

const baseline = readRepo("docs/audit/WAVE4_ROUTE_FEEDBACK_BASELINE.md");
assert.match(baseline, /WAVE3_MERGED_AND_DEPLOYED/);
assert.match(baseline, /IMPLEMENTATION_FROZEN/);

const report = readRepo("docs/audit/SUNNAH_WAVE4_ROUTE_FEEDBACK_CLOSURE_REPORT.md");
assert.match(report, /## STATUS/);
assert.match(report, /WAVE4_/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.ok(budget.ceilings.rawButtonFiles <= 192);
assert.ok(budget.ceilings.rawButtonElements <= 774);
assert.ok(budget.floors.officialButtonImportFiles >= 176);

console.log(
  `closure-wave4-route-feedback-gate.test.ts: ok (priority=${must.length}, components=${components.length})`,
);
