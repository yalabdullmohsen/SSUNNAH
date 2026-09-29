/**
 * Admin v3 Analytics Platform — security + wiring gate.
 * node --import tsx src/lib/__tests__/admin-v3-analytics-platform-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canAccessAnalyticsPlatform, can } from "@/admin-v3/permissions";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

for (const rel of [
  "src/admin-v3/domains/analytics/AnalyticsPlatformPage.tsx",
  "lib/analytics-platform/aggregate.mjs",
  "lib/analytics-platform/access.mjs",
  "lib/api-handlers/admin/analytics-platform.js",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

const router = read("src/admin-v3/AdminV3Router.tsx");
assert.match(router, /AnalyticsPlatformPage/);
assert.match(router, /\/admin\/v3\/analytics/);

const dispatch = read("lib/api-dispatch.mjs");
assert.match(dispatch, /\/api\/admin\/analytics-platform/);
const registry = read("lib/api-security-registry.mjs");
assert.match(registry, /"\/api\/admin\/analytics-platform": "ADMIN"/);

const handler = read("lib/api-handlers/admin/analytics-platform.js");
assert.match(handler, /requireAdminAccess/);
assert.match(handler, /canAccessAnalyticsPlatform/);
assert.match(handler, /analytics\.read/);
assert.doesNotMatch(handler, /Math\.random|faker|mockData|dummy/i);

const aggregate = read("lib/analytics-platform/aggregate.mjs");
assert.match(aggregate, /NO DATA AVAILABLE/);
assert.doesNotMatch(aggregate, /fakeUsers|MOCK_|placeholderStats\s*=\s*\{/);

const page = read("src/admin-v3/domains/analytics/AnalyticsPlatformPage.tsx");
assert.match(page, /canAccessAnalyticsPlatform/);
assert.match(page, /exportAnalyticsCsv|exportAnalyticsExcel|exportAnalyticsJson/);
assert.doesNotMatch(page, /user\.email|access_token|password_hash|Bearer\s/i);

// RBAC: platform is stricter than analytics.read
assert.equal(can("content_manager", "analytics.read"), true);
assert.equal(canAccessAnalyticsPlatform("content_manager"), false);
assert.equal(canAccessAnalyticsPlatform("analytics_viewer"), false);
assert.equal(canAccessAnalyticsPlatform("editor"), false);
assert.equal(canAccessAnalyticsPlatform("super_admin"), true);
assert.equal(canAccessAnalyticsPlatform("system_admin"), true);
assert.equal(canAccessAnalyticsPlatform("read_only", { profile: { is_owner: true } }), true);

const report = readFileSync(resolve(root, "../../docs/admin/ANALYTICS_PLATFORM_REPORT.md"), "utf8");
for (const h of [
  "## DATA SOURCES",
  "## DASHBOARDS",
  "## SECURITY",
  "## NO_DATA_AREAS",
  "## FINAL STATUS",
]) {
  assert.match(report, new RegExp(h));
}

console.log("admin-v3-analytics-platform-gate.test.ts: ok");
