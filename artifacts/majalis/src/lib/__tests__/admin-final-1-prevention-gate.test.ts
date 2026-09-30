/**
 * ADMIN-FINAL-1 — Initial prevention gates (baseline freeze).
 * Behavioral contracts only — not variable-name theater.
 *
 * Run: node --import tsx src/lib/__tests__/admin-final-1-prevention-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const BASELINE = "docs/admin/ADMIN_FINAL_MIGRATION_AND_SECURITY_BASELINE.md";
const SCOPE = "docs/admin/ADMIN_FINAL_SCOPE_MANIFEST.md";
const ROUTES = "docs/admin/ADMIN_FINAL_ROUTE_AND_OWNERSHIP_MATRIX.md";
const AUTH = "docs/security/ADMIN_SERVER_AUTHORIZATION_CLOSURE_REPORT.md";

console.log("=== docs present + freeze ===");
for (const rel of [BASELINE, SCOPE, ROUTES, AUTH]) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
}
const scope = readRepo(SCOPE);
assert.match(scope, /IMPLEMENTATION_FROZEN/);
assert.match(scope, /ADMIN-FINAL-1/);
assert.doesNotMatch(scope, /^\s*Status:.*ADMIN_FULLY_SECURE/m);
assert.doesNotMatch(scope, /ZERO_SECURITY_RISK/);

const baseline = readRepo(BASELINE);
assert.match(baseline, /WEB_RELEASED_NATIVE_HOLD/);
assert.match(baseline, /BASELINE_LOCKED|BASELINE/);
assert.match(baseline, /no `ADMIN_FULLY_SECURE`|Explicit non-claims/);

const routeDoc = readRepo(ROUTES);
assert.match(routeDoc, /V3_CANONICAL/);
assert.match(routeDoc, /LEGACY_KEEP_JUSTIFIED/);
assert.match(routeDoc, /SAFE_REMOVE_CANDIDATE/);

const authDoc = readRepo(AUTH);
assert.match(authDoc, /AUTH_INVENTORY_BASELINED|requireAdminAccess/);
assert.match(authDoc, /not.*ADMIN_FULLY_SECURE|AUTH_INVENTORY_BASELINED/);
assert.doesNotMatch(authDoc, /\*\*Status:\*\*\s*`ADMIN_FULLY_SECURE`/);

console.log("=== every AppRoutes /admin path classified in matrix ===");
const appRoutes = read("src/AppRoutes.tsx");
const pathRe = /path="(\/admin[^"]*)"/g;
const paths = new Set<string>();
for (let m = pathRe.exec(appRoutes); m; m = pathRe.exec(appRoutes)) {
  paths.add(m[1]!);
}
assert.ok(paths.size >= 40, `expected ≥40 admin paths, got ${paths.size}`);
const missing: string[] = [];
for (const p of paths) {
  if (!routeDoc.includes(`\`${p}\``) && !routeDoc.includes(`| ${p} |`) && !routeDoc.includes(p)) {
    missing.push(p);
  }
}
assert.deepEqual(missing, [], `unclassified admin routes: ${missing.join(", ")}`);

console.log("=== admin API handlers resolve to requireAdminAccess ===");
const handlersDir = resolve(root, "lib/api-handlers/admin");
const handlerFiles = readdirSync(handlersDir).filter((f) => f.endsWith(".js"));
assert.ok(handlerFiles.length >= 30, `expected ≥30 handlers, got ${handlerFiles.length}`);

function resolvesAdminAuth(file: string, depth = 0): boolean {
  if (depth > 3) return false;
  const text = readFileSync(join(handlersDir, file), "utf8");
  if (text.includes("requireAdminAccess")) return true;
  const reExport = text.match(/export\s+\{\s*default\s*\}\s+from\s+["']\.\/([^"']+)["']/);
  if (reExport) {
    const target = reExport[1]!.endsWith(".js") ? reExport[1]! : `${reExport[1]}.js`;
    return resolvesAdminAuth(target, depth + 1);
  }
  return false;
}

const unauth: string[] = [];
for (const f of handlerFiles) {
  if (!resolvesAdminAuth(f)) unauth.push(f);
}
assert.deepEqual(unauth, [], `handlers without requireAdminAccess chain: ${unauth.join(", ")}`);

console.log("=== Admin v3: no prompt / confirm / alert ===");
function walkTsx(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkTsx(p, out);
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
  }
  return out;
}
const v3Files = walkTsx(resolve(root, "src/admin-v3"));
const banned =
  /\bwindow\.(prompt|confirm|alert)\s*\(|(?<![\w$.])(prompt|confirm|alert)\s*\(/;
const offenders: string[] = [];
for (const f of v3Files) {
  const text = readFileSync(f, "utf8");
  // Allow comments mentioning the ban
  const code = text
    .split("\n")
    .filter((l) => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l))
    .join("\n");
  if (banned.test(code)) offenders.push(f.replace(root + "/", ""));
}
assert.deepEqual(offenders, [], `v3 prompt/confirm/alert: ${offenders.join(", ")}`);

console.log("=== Admin CSS not in public main.tsx sync graph ===");
const main = read("src/main.tsx");
assert.doesNotMatch(main, /admin(-v3)?[^"']*\.css|styles\/admin\.css|admin-gate\.css|admin-v3-shell\.css/);
assert.doesNotMatch(main, /from ["']@\/admin-v3/);
assert.doesNotMatch(main, /from ["']@\/views\/AdminPage/);

console.log("=== AdminLazyRoute wraps AdminRouteGuard (lazy surface) ===");
const lazy = read("src/app/routes/safe-lazy-route.tsx");
assert.match(lazy, /export function AdminLazyRoute/);
assert.match(lazy, /AdminRouteGuard/);
assert.match(appRoutes, /AdminLazyRoute component=\{AdminV3App\}/);
assert.match(appRoutes, /AdminLazyRoute component=\{AdminEntryBridge\}/);

console.log("=== UI permissions declare non-authority ===");
const perms = read("src/admin-v3/permissions.ts");
assert.match(perms, /API remains the authority|not security|UI may hide/i);

console.log("=== middleware public deny remains 404 (not Home) ===");
const mw = read("middleware.js");
assert.match(mw, /غير متاح/);
assert.match(mw, /htmlStatusPage\(404/);
assert.doesNotMatch(mw, /Location:\s*["']\/["']/);

console.log("admin-final-1-prevention-gate.test.ts: ok");
