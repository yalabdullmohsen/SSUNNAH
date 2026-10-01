/**
 * ADMIN-FINAL-3 — Core CRUD for Lessons · Sheikhs · Fawaid · Categories · Users · Roles
 * Run: node --import tsx src/lib/__tests__/admin-final-3-core-crud-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = join(root, "src");

function read(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

const router = read("admin-v3/AdminV3Router.tsx");
assert.match(router, /EntityCrudPage kind="lessons"/);
assert.match(router, /EntityCrudPage kind="sheikhs"/);
assert.match(router, /EntityCrudPage kind="fawaid"/);
assert.match(router, /TaxonomyPage/);
assert.match(router, /UsersPage/);
assert.match(router, /RolesPage/);
assert.match(router, /\/admin\/v3\/community\/roles/);

const appRoutes = read("AppRoutes.tsx");
assert.match(appRoutes, /path="\/admin\/v3\/community\/roles"/);

const entity = read("admin-v3/domains/content/EntityCrudPage.tsx");
assert.match(entity, /تصفية الحالة|supportsStatus/);
assert.match(entity, /onRestore|استعادة/);
assert.match(entity, /emptyTitle/);
assert.match(entity, /emitAdminV3AuditEvent/);
assert.doesNotMatch(entity, /setLocation\s*\(/);

const taxonomy = read("admin-v3/domains/taxonomy/TaxonomyPage.tsx");
assert.match(taxonomy, /AdminSearchInput/);
assert.match(taxonomy, /تصفية الحالة/);
assert.match(taxonomy, /استعادة/);
assert.match(taxonomy, /emptyTitle/);

const users = read("admin-v3/domains/community/UsersPage.tsx");
assert.match(users, /كتالوج الأدوار/);
assert.match(users, /OWNER_ACTION/);
assert.match(users, /emitAdminV3AuditEvent/);
assert.match(users, /AdminConfirmDialog/);

const roles = read("admin-v3/domains/community/RolesPage.tsx");
assert.match(roles, /GOVERNANCE_ROLE_IDS/);
assert.match(roles, /admin-v3-roles-catalog/);
assert.match(roles, /OWNER_ACTION/);

const perms = read("admin-v3/permissions.ts");
assert.match(perms, /export const ROLE_PERMS/);
assert.match(perms, /export const GOVERNANCE_ROLE_IDS/);

const report = readFileSync(
  join(root, "../../docs/admin/ADMIN_FINAL_3_CORE_CRUD_CLOSURE_REPORT.md"),
  "utf8",
);
assert.match(report, /ADMIN_FINAL_3/);
assert.match(report, /Lessons|الدروس/);
assert.match(report, /Roles|الأدوار/);

console.log("admin-final-3-core-crud-gate.test.ts: ok");
