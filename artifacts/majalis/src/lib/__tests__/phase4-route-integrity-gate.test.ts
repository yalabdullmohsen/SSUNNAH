/**
 * بوابة Phase 4: لا تكرار مسارات/تحويلات، لا lazy corpora في AppRoutes، Admin منفصل.
 * التشغيل: node --import tsx src/lib/__tests__/phase4-route-integrity-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const routesSrc = readFileSync(resolve(root, "src/AppRoutes.tsx"), "utf8");
const lazyDir = resolve(root, "src/app/routes/lazy");

assert.ok(existsSync(lazyDir), "lazy domain modules exist");
const lazyFiles = readdirSync(lazyDir).filter((f) => /\.(ts|tsx)$/.test(f));
assert.ok(lazyFiles.includes("admin.ts"), "admin lazy module");
assert.ok(lazyFiles.includes("quran.tsx") || lazyFiles.includes("quran.ts"), "quran lazy module");
assert.ok(lazyFiles.includes("fiqh.ts"), "fiqh lazy module");
assert.ok(lazyFiles.includes("hadith.ts"), "hadith lazy module");
assert.ok(lazyFiles.includes("search.ts"), "search lazy module");

assert.match(routesSrc, /from ["']@\/app\/routes\/lazy["']/, "AppRoutes imports domain lazy modules");
assert.match(routesSrc, /from ["']@\/app\/routes\/safe-lazy-route["']/, "SafeLazyRoute extracted");
assert.doesNotMatch(routesSrc, /^const \w+ = lazy(WithRetry)?\(/m, "no local lazy defs in AppRoutes");
assert.doesNotMatch(routesSrc, /verified-hadith-fill|fawaid-seed|prophetic-medicine-seed|content\/fiqh\/books/, "AppRoutes must not import giant corpora");

const pathRe = /<Route\s+path=["']([^"']+)["']/g;
const paths: string[] = [];
let m: RegExpExecArray | null;
while ((m = pathRe.exec(routesSrc))) paths.push(m[1]!);
assert.ok(paths.length > 50, `expected many routes, got ${paths.length}`);
const dupPaths = paths.filter((p, i) => paths.indexOf(p) !== i);
assert.equal(dupPaths.length, 0, `duplicate Route paths: ${[...new Set(dupPaths)].join(", ")}`);

const redirectRe = /<Route\s+path=["']([^"']+)["']><Redirect\s+to=["']([^"']+)["']\s*\/>/g;
const redirects: Array<{ from: string; to: string }> = [];
while ((m = redirectRe.exec(routesSrc))) redirects.push({ from: m[1]!, to: m[2]! });
const redirectMap = new Map(redirects.map((r) => [r.from, r.to]));
for (const { from, to } of redirects) {
  let cur = to;
  const seen = new Set([from]);
  let hops = 0;
  while (redirectMap.has(cur) && hops < 8) {
    assert.ok(!seen.has(cur), `redirect loop involving ${from} → ${cur}`);
    seen.add(cur);
    cur = redirectMap.get(cur)!;
    hops++;
  }
  assert.ok(hops < 6, `redirect chain too long from ${from}`);
}

assert.match(routesSrc, /path=["']\/library["']><Redirect to=["']\/search["']/, "library → search retained");
assert.match(routesSrc, /path=["']\/library\/:id["']><Redirect to=["']\/search["']/, "library/:id → search retained");

const adminLazy = readFileSync(resolve(lazyDir, "admin.ts"), "utf8");
assert.match(adminLazy, /AdminV3App/, "AdminV3 in admin module");
const entryish = readFileSync(resolve(root, "src/main.tsx"), "utf8");
assert.doesNotMatch(entryish, /admin-v3\/AdminV3App|from ["']@\/app\/routes\/lazy\/admin/, "main must not import admin graph");

console.log("phase4-route-integrity-gate: ok", { routes: paths.length, redirects: redirects.length, lazyFiles: lazyFiles.length });
