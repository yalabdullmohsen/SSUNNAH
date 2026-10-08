/**
 * FINAL CLOSURE Phase 1 — Route Feedback Priority evidence gate.
 * Forbids COMPLETE without evidence pack fields.
 * node --import tsx src/lib/__tests__/closure-route-feedback-priority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const PRIORITY = [
  "/",
  "/search",
  "/quran-hub",
  "/mushaf",
  "/mushaf/bookmarks",
  "/prayer-times",
  "/lessons",
  "/hadith",
  "/fiqh",
  "/adhkar",
  "/settings",
  "/my-learning",
  "/login",
  "/register",
] as const;

const CORE_STATES = [
  "loading",
  "empty",
  "error",
  "offline",
  "noResults",
  "permissionDenied",
  "rateLimited",
] as const;

const ALLOWED = new Set([
  "COMPLETE",
  "NOT_APPLICABLE",
  "REDIRECT_ONLY",
  "ADMIN_ACCESS",
  "MUSHAF_SPECIAL",
  "PRAYER_SPECIAL",
  "DEVICE_REQUIRED",
  "PARTIAL",
]);

const evidencePath = "docs/audit/ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json";
const reportPath = "docs/audit/ROUTE_FEEDBACK_PRIORITY_CLOSURE_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, evidencePath)), evidencePath);
assert.ok(existsSync(resolve(repoRoot, reportPath)), reportPath);

const evidence = JSON.parse(readRepo(evidencePath));
assert.equal(evidence.phase, "ROUTE_FEEDBACK_PRIORITY");
assert.ok(evidence.testedCommit && String(evidence.testedCommit).length >= 7);
assert.ok(evidence.testedDate);
assert.match(readRepo(reportPath), /ROUTE_FEEDBACK_PRIORITY/);
assert.match(readRepo(reportPath), /Feedback V2/);
assert.doesNotMatch(readRepo(reportPath), /EmptyStateV3|ErrorStateV3|LoadingStateV3|FeedbackV3/);

// No Feedback V3 components
for (const rel of [
  "src/components/design-system/EmptyStateV3.tsx",
  "src/components/design-system/ErrorStateV3.tsx",
  "src/components/design-system/LoadingStateV3.tsx",
]) {
  assert.ok(!existsSync(resolve(majalisRoot, rel)), `forbidden ${rel}`);
}

const settings = read("src/pages/account/ui/SettingsView.tsx");
assert.match(settings, /settings-cache-refresh-error/);
assert.match(settings, /STATUS\.loadError/);

const quranHub = read("src/pages/quran/ui/QuranHubView.tsx");
assert.match(quranHub, /hasGroups/);

const app = read("src/App.tsx");
assert.match(app, /OfflineBanner/);

const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
const by = Object.fromEntries(matrix.routes.map((r: { route: string }) => [r.route, r]));

for (const route of PRIORITY) {
  const row = by[route];
  assert.ok(row, `matrix missing ${route}`);
  assert.ok(row.routeClass, `${route} needs routeClass`);
  assert.ok(row.priorityFeedbackTestRef, `${route} needs priorityFeedbackTestRef`);
  assert.ok(row.priorityFeedbackCommit, `${route} needs priorityFeedbackCommit`);
  assert.ok(row.priorityFeedbackDate, `${route} needs priorityFeedbackDate`);

  const pack = evidence.routes?.[route];
  assert.ok(pack, `evidence missing ${route}`);
  assert.equal(pack.routeClass, row.routeClass, `${route} routeClass mismatch`);

  for (const state of CORE_STATES) {
    const matrixStatus = String(row[state] ?? "UNSET");
    const ev = pack.states?.[state];
    assert.ok(ev, `${route}.${state} missing evidence`);
    assert.ok(ALLOWED.has(ev.status), `${route}.${state} status ${ev.status} not allowed`);

    if (matrixStatus === "COMPLETE") {
      assert.equal(ev.status, "COMPLETE", `${route}.${state} matrix COMPLETE but evidence ${ev.status}`);
      for (const key of ["testRef", "artifact", "expected", "actual"] as const) {
        assert.ok(ev[key] && String(ev[key]).trim().length > 0, `${route}.${state} COMPLETE missing ${key}`);
      }
    }

    if (matrixStatus === "PENDING" || matrixStatus === "UNSET") {
      assert.fail(`${route}.${state} must not remain PENDING/UNSET on priority set (got ${matrixStatus})`);
    }

    if (ev.status === "COMPLETE") {
      assert.equal(
        matrixStatus,
        "COMPLETE",
        `${route}.${state} evidence COMPLETE but matrix ${matrixStatus}`,
      );
    }

    if (ev.status === "NOT_APPLICABLE") {
      assert.ok(
        matrixStatus === "NOT_APPLICABLE" || matrixStatus === "N/A",
        `${route}.${state} evidence N/A but matrix ${matrixStatus}`,
      );
      assert.ok(ev.reason, `${route}.${state} N/A needs reason`);
    }
  }
}

// Quran-hub honesty
assert.equal(by["/quran-hub"].empty, "NOT_APPLICABLE");
assert.equal(by["/quran-hub"].error, "NOT_APPLICABLE");
assert.equal(by["/quran-hub"].noResults, "NOT_APPLICABLE");
assert.equal(by["/settings"].error, "COMPLETE");

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:route-feedback-priority"] || "", /closure-route-feedback-priority-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:route-feedback-priority/);

console.log(
  `closure-route-feedback-priority-gate.test.ts: ok (routes=${PRIORITY.length}, states=${CORE_STATES.length})`,
);
