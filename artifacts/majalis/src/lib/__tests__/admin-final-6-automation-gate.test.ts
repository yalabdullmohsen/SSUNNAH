/**
 * ADMIN-FINAL-6 — Automation & Integrations (honest status hub + read-only API)
 * Run: node --import tsx src/lib/__tests__/admin-final-6-automation-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = join(root, "src");
const api = join(root, "lib/api-handlers/admin/v3.js");

function read(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

assert.ok(existsSync(api), "admin v3 API handler missing");
const v3 = readFileSync(api, "utf8");
assert.match(v3, /handleAutomation/);
assert.match(v3, /entity === "automation"/);
assert.match(v3, /view === "sources"/);
assert.match(v3, /view === "auto-content"/);
assert.match(v3, /view === "integrations"/);
assert.match(v3, /listTrustedSources/);
assert.match(v3, /getAutoContentPipelineStats/);
assert.match(v3, /getInstagramGraphStatus|isInstagramGraphConfigured/);
assert.doesNotMatch(v3, /accessTokenPreview/);
assert.doesNotMatch(v3, /TELEGRAM_BOT_TOKEN/);
assert.match(v3, /requireAdminAccess/);
assert.match(v3, /method_not_allowed/);
// No mutating automation actions inside handleAutomation
const autoFn = v3.match(/async function handleAutomation[\s\S]*?(?=\nexport default async function handler)/);
assert.ok(autoFn, "handleAutomation body missing");
assert.match(autoFn[0], /req\.method !== "GET"/);
assert.doesNotMatch(autoFn[0], /action === "run"/);
assert.doesNotMatch(autoFn[0], /setWebhook|sendBroadcast|upsertTrustedSource|upsert-source/);

const router = read("admin-v3/AdminV3Router.tsx");
assert.match(router, /AutomationHubPage/);
assert.match(router, /\/admin\/v3\/automation\/sources/);
assert.match(router, /\/admin\/v3\/automation\/auto-content/);
assert.match(router, /\/admin\/v3\/automation\/integrations/);

const page = read("admin-v3/domains/ops/AutomationHubPage.tsx");
assert.match(page, /data-admin-final6-automation/);
assert.match(page, /V3_PARTIAL|LEGACY_REQUIRED|BLOCKED_CREDENTIAL/);
assert.match(page, /وجود رابط Legacy لا يُعد ترحيلًا كاملًا/);
assert.doesNotMatch(page, /window\.(prompt|confirm|alert)\s*\(/);

const appRoutes = read("AppRoutes.tsx");
assert.match(appRoutes, /path="\/admin\/v3\/automation"/);
assert.match(appRoutes, /path="\/admin\/v3\/automation\/sources"/);
assert.doesNotMatch(
  appRoutes,
  /path="\/admin\/v3\/automation"><Redirect to="\/admin\/v3\/settings"/,
);

const routes = read("app/router/routes.ts");
assert.match(routes, /\/admin\/v3\/automation\/sources/);
assert.match(routes, /\/admin\/v3\/automation\/integrations/);

const catalog = read("admin-v3/centers/catalog.ts");
assert.match(catalog, /\/admin\/v3\/automation"/);
assert.match(catalog, /\/admin\/v3\/automation\/sources/);
assert.match(catalog, /LEGACY_REQUIRED/);

const reportPath = join(root, "../../docs/admin/ADMIN_FINAL_6_AUTOMATION_AND_INTEGRATIONS_REPORT.md");
const reportFallback = join(root, "../../docs/admin/ADMIN_FINAL_6_AUTOMATION_REPORT.md");
assert.ok(existsSync(reportPath) || existsSync(reportFallback), "FINAL-6 report missing");
const report = readFileSync(existsSync(reportPath) ? reportPath : reportFallback, "utf8");

assert.match(report, /ADMIN_FINAL_6/);
assert.match(report, /V3_PARTIAL/);
assert.match(report, /LEGACY_REQUIRED|BLOCKED_CREDENTIAL|OWNER_ACTION/);
assert.match(report, /Sources|المصادر/);
assert.match(report, /Telegram|Instagram/);
assert.match(report, /وجود رابط.*لا يُعد ترحيلًا|not.*full migration|V3_LINK_ONLY/i);
assert.doesNotMatch(report, /ZERO_SECURITY_RISK|ADMIN_FULLY_SECURE|V3_COMPLETE.*Instagram/i);

console.log("admin-final-6-automation-gate.test.ts: ok");
