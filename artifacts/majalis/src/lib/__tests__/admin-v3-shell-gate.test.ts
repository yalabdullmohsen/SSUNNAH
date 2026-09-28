/**
 * Wave 1 — Admin v3 Shell gate (IA: 7 وجهات).
 * تشغيل: node --import tsx src/lib/__tests__/admin-v3-shell-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADMIN_V3_AUDIT_EVENT_TYPES,
  emitAdminV3AuditEvent,
  listAdminV3AuditEvents,
} from "@/admin-v3/audit-events";
import {
  ADMIN_V3_BASE,
  ADMIN_V3_NAV,
  resolveAdminV3Center,
} from "@/admin-v3/nav";
import { isAdminPath } from "@/lib/admin-surface";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

assert.equal(ADMIN_V3_BASE, "/admin/v3");
assert.ok(existsSync(resolve(root, "src/admin-v3/AdminV3App.tsx")));
assert.ok(existsSync(resolve(root, "src/styles/pages/admin-v3-shell.css")));

assert.equal(isAdminPath("/admin/v3"), true);
assert.equal(isAdminPath("/admin/v3/reviews"), true);
assert.equal(resolveAdminV3Center("/admin/v3").id, "overview");
assert.equal(resolveAdminV3Center("/admin/v3/content").id, "content");
assert.equal(resolveAdminV3Center("/admin/v3/reviews").id, "reviews");
assert.equal(resolveAdminV3Center("/admin/v3/taxonomy").id, "taxonomy");
assert.equal(resolveAdminV3Center("/admin/v3/community").id, "community");
assert.equal(resolveAdminV3Center("/admin/v3/review").id, "reviews");
assert.equal(resolveAdminV3Center("/admin/v3/users").id, "community");

assert.ok(ADMIN_V3_NAV.some((n) => n.id === "overview"));
assert.equal(ADMIN_V3_NAV.length, 7);
assert.ok(ADMIN_V3_NAV.filter((n) => n.mobilePrimary).length === 4);
assert.ok(ADMIN_V3_AUDIT_EVENT_TYPES.includes("admin.shell.open"));
assert.equal(typeof emitAdminV3AuditEvent, "function");
assert.equal(listAdminV3AuditEvents().length, 0);

const app = read("src/App.tsx");
const routes = read("src/AppRoutes.tsx");
const adminLazy = read("src/app/routes/lazy/admin.ts");
const shell = read("src/admin-v3/AdminV3Shell.tsx");
const v3app = read("src/admin-v3/AdminV3App.tsx");
const catalog = read("src/app/router/routes.ts");

assert.doesNotMatch(app, /admin-v3|AdminV3App/, "لا Admin v3 في الهيكل العام");
assert.match(routes, /AdminV3App/);
assert.match(routes, /AdminLazyRoute component=\{AdminV3App\}/);
assert.match(adminLazy, /lazyWithRetry\(\(\) => import\("@\/admin-v3\/AdminV3App"\)/);
assert.match(routes, /\/admin\/v3\/reviews/);
assert.match(routes, /\/admin\/v3\/taxonomy/);
assert.match(routes, /\/admin\/v3\/community/);
assert.match(catalog, /"\/admin\/v3"/);
assert.match(catalog, /"\/admin\/v3\/taxonomy"/);

assert.match(shell, /av3-sidebar/);
assert.match(shell, /av3-bottom/);
assert.match(shell, /av3-breadcrumbs/);
assert.match(shell, /av3-search/);
assert.match(shell, /إشعارات/);
assert.match(shell, /dir="rtl"/);
assert.match(shell, /AdminV3Offline|online/);
assert.match(v3app, /AdminV3ErrorBoundary/);
assert.match(v3app, /noindex/);
assert.doesNotMatch(shell, /AdminSiteEditBar|AdminQuickEdit/);
assert.doesNotMatch(v3app, /AdminSiteEditBar|AdminQuickEdit/);

const seo = read("src/lib/seo-routes.json");
assert.match(seo, /"path": "\/admin\/v3"/);
assert.match(seo, /noindex, nofollow/);

const legacy = read("src/views/AdminPage.tsx");
assert.match(legacy, /AdminShell/, "Legacy AdminPage يبقى");

console.log("admin-v3-shell-gate.test.ts: ok");
