/**
 * FINAL CLOSURE Phase 2 — public route feedback classification gate.
 * node --import tsx src/lib/__tests__/closure-route-feedback-public-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const ALLOWED = new Set([
  "COMPLETE",
  "NOT_APPLICABLE",
  "REDIRECT_ONLY",
  "ADMIN_ACCESS",
  "MUSHAF_SPECIAL",
  "PRAYER_SPECIAL",
  "DEVICE_REQUIRED",
  "PARTIAL",
  "N/A",
]);

const CORE = [
  "loading",
  "empty",
  "error",
  "offline",
  "noResults",
  "permissionDenied",
  "rateLimited",
] as const;

const classPath = "docs/audit/ROUTE_FEEDBACK_PUBLIC_CLASSIFICATION.json";
const reportPath = "docs/audit/ROUTE_FEEDBACK_PUBLIC_EXPANSION_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, classPath)), classPath);
assert.ok(existsSync(resolve(repoRoot, reportPath)), reportPath);
assert.match(readRepo(reportPath), /ROUTE_FEEDBACK_PUBLIC/);
assert.match(readRepo(reportPath), /Feedback V2/);
assert.doesNotMatch(readRepo(reportPath), /EmptyStateV3\.tsx|ErrorStateV3\.tsx/);

const classification = JSON.parse(readRepo(classPath));
assert.equal(classification.phase, "ROUTE_FEEDBACK_PUBLIC");
assert.ok(classification.classDefaults);
assert.ok(classification.routes);

const app = read("src/App.tsx");
assert.match(app, /OfflineBanner/);
assert.match(app, /ErrorBoundary/);
const routesFile = read("src/AppRoutes.tsx");
assert.match(routesFile, /SafeLazyRoute/);

for (const rel of [
  "src/components/design-system/EmptyStateV3.tsx",
  "src/components/design-system/ErrorStateV3.tsx",
]) {
  assert.ok(!existsSync(resolve(majalisRoot, rel)), `forbidden ${rel}`);
}

const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
assert.equal(matrix.publicFeedbackPhase, "ROUTE_FEEDBACK_PUBLIC");

let publicRows = 0;
let pending = 0;
for (const row of matrix.routes as Array<Record<string, string>>) {
  const route = row.route;
  if (!route || route.startsWith("/admin")) continue;
  publicRows += 1;
  assert.ok(row.routeClass, `${route} missing routeClass`);
  for (const state of CORE) {
    const v = String(row[state] ?? "UNSET");
    if (v === "PENDING" || v === "UNSET" || v === "") {
      pending += 1;
      assert.fail(`${route}.${state} still ${v}`);
    }
    assert.ok(ALLOWED.has(v), `${route}.${state}=${v} not allowed`);
  }

  if (row.publicFeedbackPhase === "PRIORITY_CLOSED") continue;

  const pack = classification.routes[route];
  assert.ok(pack, `classification missing ${route}`);
  assert.equal(pack.routeClass, row.routeClass, `${route} class mismatch`);
  for (const state of CORE) {
    const ev = pack.states?.[state];
    assert.ok(ev, `${route}.${state} missing class/route evidence`);
    assert.equal(ev.status, row[state], `${route}.${state} matrix/evidence mismatch`);
    if (ev.status === "COMPLETE") {
      for (const key of ["testRef", "artifact", "expected", "actual"] as const) {
        assert.ok(ev[key], `${route}.${state} COMPLETE missing ${key}`);
      }
    }
    if (ev.status === "NOT_APPLICABLE" || ev.status === "REDIRECT_ONLY" || ev.status === "ADMIN_ACCESS") {
      assert.ok(ev.reason || ev.status === "REDIRECT_ONLY", `${route}.${state} needs reason`);
    }
  }
}

assert.equal(pending, 0);
assert.ok(publicRows >= 300, `expected large public set, got ${publicRows}`);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:route-feedback-public"] || "", /closure-route-feedback-public-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:route-feedback-public/);

// Priority gate still present
assert.ok(
  existsSync(resolve(majalisRoot, "src/lib/__tests__/closure-route-feedback-priority-gate.test.ts")),
);

console.log(
  `closure-route-feedback-public-gate.test.ts: ok (publicRows=${publicRows}, classified=${Object.keys(classification.routes).length})`,
);
