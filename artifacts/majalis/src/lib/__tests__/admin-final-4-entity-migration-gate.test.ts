/**
 * ADMIN-FINAL-4 — Remaining entity migration (Library · Stories · Arbaeen + honest residuals)
 * Run: node --import tsx src/lib/__tests__/admin-final-4-entity-migration-gate.test.ts
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
assert.match(v3, /handleLibrary/);
assert.match(v3, /handleIslamicStories/);
assert.match(v3, /handleProphetStories/);
assert.match(v3, /handleArbaeen/);
assert.match(v3, /entity === "library"/);
assert.match(v3, /entity === "islamic-stories"/);
assert.match(v3, /entity === "prophet-stories"/);
assert.match(v3, /entity === "arbaeen"/);
assert.match(v3, /pickFields/);
assert.match(v3, /requireAdminAccess/);
assert.doesNotMatch(v3, /role\s*=\s*req\.body\.role/);

const router = read("admin-v3/AdminV3Router.tsx");
assert.match(router, /RemainingEntityCrudPage kind="library"/);
assert.match(router, /RemainingEntityCrudPage kind="islamic-stories"/);
assert.match(router, /RemainingEntityCrudPage kind="prophet-stories"/);
assert.match(router, /RemainingEntityCrudPage kind="arbaeen"/);

const page = read("admin-v3/domains/content/RemainingEntityCrudPage.tsx");
assert.match(page, /emitAdminV3AuditEvent/);
assert.match(page, /AdminConfirmDialog/);
assert.match(page, /emptyTitle/);
assert.match(page, /data-admin-final4-entity/);
assert.doesNotMatch(page, /setLocation\s*\(/);
assert.doesNotMatch(page, /window\.(prompt|confirm|alert)\s*\(/);

const catalog = read("admin-v3/centers/catalog.ts");
assert.match(catalog, /\/admin\/v3\/content\/library/);
assert.match(catalog, /\/admin\/v3\/content\/islamic-stories/);
assert.match(catalog, /\/admin\/v3\/content\/prophet-stories/);
assert.match(catalog, /\/admin\/v3\/content\/arbaeen/);
// Honest residuals — not fake V3_COMPLETE via link-only
assert.match(catalog, /LEGACY_REQUIRED|seed/);
assert.match(catalog, /ADMIN-FINAL-6|\/admin\/sources/);
assert.match(catalog, /\/admin\/universities/);

const hub = read("admin-v3/domains/content/ContentHubPage.tsx");
assert.match(hub, /\/admin\/v3\/content\/library/);
assert.match(hub, /\/admin\/v3\/content\/arbaeen/);

const appRoutes = read("AppRoutes.tsx");
assert.match(appRoutes, /path="\/admin\/v3\/content\/library"/);
assert.match(appRoutes, /path="\/admin\/v3\/content\/islamic-stories"/);
assert.match(appRoutes, /path="\/admin\/v3\/content\/prophet-stories"/);
assert.match(appRoutes, /path="\/admin\/v3\/content\/arbaeen"/);

const routes = read("app/router/routes.ts");
assert.match(routes, /\/admin\/v3\/content\/library/);
assert.match(routes, /\/admin\/v3\/content\/arbaeen/);

const report = readFileSync(
  join(root, "../../docs/admin/ADMIN_FINAL_4_ENTITY_MIGRATION_REPORT.md"),
  "utf8",
);
assert.match(report, /ADMIN_FINAL_4/);
assert.match(report, /V3_COMPLETE|V3_PARTIAL/);
assert.match(report, /LEGACY_REQUIRED|BLOCKED_SOURCE/);
assert.match(report, /Library|المكتبة/);
assert.match(report, /Adhkar|الأذكار/);
assert.match(report, /Universities|الجامعات/);
assert.match(report, /Sources|المصادر/);
// Link-only must not be claimed as full migration
assert.match(report, /وجود رابط.*لا يُعد ترحيلًا|not.*full migration|V3_LINK_ONLY/i);

console.log("admin-final-4-entity-migration-gate.test.ts: ok");
