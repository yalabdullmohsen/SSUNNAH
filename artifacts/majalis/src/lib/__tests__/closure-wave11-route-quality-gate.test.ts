/**
 * WAVE11 — route quality expansion gate.
 * node --import tsx src/lib/__tests__/closure-wave11-route-quality-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/audit/WAVE11_ROUTE_QUALITY_EXPANSION_REPORT.md")));
const report = readRepo("docs/audit/WAVE11_ROUTE_QUALITY_EXPANSION_REPORT.md");
assert.match(report, /ACTIVE_PUBLIC_HIGH_TRAFFIC|STATIC_CONTENT|MUSHAF_SPECIAL|PRAYER_SPECIAL/);
assert.match(report, /wave11TestRef|DEVICE_REQUIRED/);

const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
assert.match(String(matrix.wave11Note || ""), /WAVE11/);
const by = Object.fromEntries(matrix.routes.map((r: { route: string }) => [r.route, r]));

const mustClass: Record<string, string> = {
  "/": "ACTIVE_PUBLIC_HIGH_TRAFFIC",
  "/search": "ACTIVE_PUBLIC_HIGH_TRAFFIC",
  "/lessons": "ACTIVE_PUBLIC_HIGH_TRAFFIC",
  "/mushaf": "MUSHAF_SPECIAL",
  "/prayer-times": "PRAYER_SPECIAL",
  "/login": "AUTH",
  "/about": "STATIC_CONTENT",
  "/privacy": "STATIC_CONTENT",
  "/terms": "STATIC_CONTENT",
  "/library": "ACTIVE_PUBLIC_SECONDARY",
  "/prophets": "ACTIVE_PUBLIC_SECONDARY",
  "/admin/v3": "ADMIN_ACCESS",
};

for (const [route, cls] of Object.entries(mustClass)) {
  const row = by[route];
  assert.ok(row, `missing ${route}`);
  assert.equal(row.routeClass, cls, `${route} routeClass`);
  assert.equal(row.wave11TestRef, "closure-wave11-route-quality-gate.test.ts");
  assert.ok(row.wave11TestedAt, `${route} testedAt`);
  assert.ok(row.wave11Commit, `${route} commit`);
  assert.notEqual(row.loading, "PENDING", `${route} loading`);
  assert.notEqual(row.rtl, "PENDING", `${route} rtl`);
}

assert.equal(by["/about"].empty, "NOT_APPLICABLE");
assert.equal(by["/privacy"].error, "NOT_APPLICABLE");
assert.equal(by["/search"].noResults, "COMPLETE");
assert.notEqual(by["/library"].visualSystem, "PENDING");

// Honest: unaudited public routes may remain PENDING
const pendingPublic = matrix.routes.filter(
  (r: { public?: boolean; loading?: string }) => r.public && r.loading === "PENDING",
);
assert.ok(pendingPublic.length > 0, "PENDING must remain for unaudited routes (no fake COMPLETE)");

console.log(
  `closure-wave11-route-quality-gate.test.ts: ok (classified=${Object.keys(mustClass).length}, pendingPublic=${pendingPublic.length})`,
);
