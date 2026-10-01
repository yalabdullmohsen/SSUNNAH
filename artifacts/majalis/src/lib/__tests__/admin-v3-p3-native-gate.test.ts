/**
 * Phase 3 — Admin v3 native CRUD + permissions gate.
 * node --import tsx src/lib/__tests__/admin-v3-p3-native-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { can, permissionsForRole, resolveGovernanceRole } from "@/admin-v3/permissions";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const repoRoot = resolve(root, "../..");

// Routes
const routes = read("src/AppRoutes.tsx");
for (const p of [
  "/admin/v3/reviews",
  "/admin/v3/content/lessons",
  "/admin/v3/content/sheikhs",
  "/admin/v3/content/fawaid",
  "/admin/v3/taxonomy",
  "/admin/v3/community",
  "/admin/v3/community/roles",
  "/admin/legacy",
  "/admin",
]) {
  assert.match(routes, new RegExp(p.replace(/\//g, "\\/")));
}
assert.match(routes, /AdminEntryBridge/);
assert.match(routes, /path="\/admin\/legacy"/);

// Native modules exist
for (const rel of [
  "src/admin-v3/AdminV3Router.tsx",
  "src/admin-v3/domains/reviews/ReviewInboxPage.tsx",
  "src/admin-v3/domains/content/EntityCrudPage.tsx",
  "src/admin-v3/domains/taxonomy/TaxonomyPage.tsx",
  "src/admin-v3/domains/community/UsersPage.tsx",
  "src/admin-v3/domains/community/RolesPage.tsx",
  "src/admin-v3/permissions.ts",
  "src/admin-v3/data/admin-v3-api.ts",
  "lib/api-handlers/admin/v3.js",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

// Router wires native pages
const router = read("src/admin-v3/AdminV3Router.tsx");
assert.match(router, /ReviewInboxPage/);
assert.match(router, /EntityCrudPage/);
assert.match(router, /TaxonomyPage/);
assert.match(router, /UsersPage/);

// API registered
const dispatch = read("lib/api-dispatch.mjs");
assert.match(dispatch, /\/api\/admin\/v3/);
const registry = read("lib/api-security-registry.mjs");
assert.match(registry, /"\/api\/admin\/v3": "ADMIN"/);

// No Legacy section imports inside v3 domains
const review = read("src/admin-v3/domains/reviews/ReviewInboxPage.tsx");
assert.doesNotMatch(review, /views\/admin\/SubmissionsSection/);
const entity = read("src/admin-v3/domains/content/EntityCrudPage.tsx");
assert.doesNotMatch(entity, /views\/admin\/LessonsSection/);

// Permissions model
assert.equal(can("read_only", "content.read"), true);
assert.equal(can("read_only", "content.edit"), false);
assert.equal(can("editor", "content.edit"), true);
assert.equal(can("editor", "users.manage"), false);
assert.equal(can("scientific_reviewer", "review.approve"), true);
assert.equal(can("content_manager", "publish"), true);
assert.equal(can("super_admin", "users.manage"), true);
assert.equal(can("moderator", "content.moderate"), true);

// Fake local role must not invent super_admin from empty user
assert.equal(resolveGovernanceRole(null), "read_only");
assert.equal(resolveGovernanceRole({ profile: { role: "user" } }), "read_only");
assert.ok(permissionsForRole("read_only").has("content.read"));

// Fail-closed: unknown role → read_only perms
assert.equal(can("totally_fake_role", "users.manage"), false);

// Legacy kept
assert.ok(existsSync(resolve(root, "src/views/AdminPage.tsx")));
assert.ok(existsSync(resolve(root, "src/views/admin/AdminShell.tsx")));

// Retirement matrix
const matrix = readFileSync(resolve(repoRoot, "docs/admin/ADMIN_V3_RETIREMENT_MATRIX.md"), "utf8");
assert.match(matrix, /MIGRATED|KEEP|REDIRECT_READY|SAFE_REMOVE_CANDIDATE|BLOCKED/);

console.log("admin-v3-p3-native-gate.test.ts: ok");
