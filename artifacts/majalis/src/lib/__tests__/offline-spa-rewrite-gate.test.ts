/**
 * Ensures /offline is served as SPA shell (not bare 404.html).
 * node --import tsx src/lib/__tests__/offline-spa-rewrite-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const vercel = readFileSync(resolve(majalisRoot, "vercel.json"), "utf8");
const routes = readFileSync(resolve(majalisRoot, "src/app/router/routes.ts"), "utf8");
const appRoutes = readFileSync(resolve(majalisRoot, "src/AppRoutes.tsx"), "utf8");

assert.match(routes, /"\/offline"/);
assert.match(appRoutes, /path="\/offline"/);
assert.match(vercel, /"source":\s*"\/offline"/);
assert.match(vercel, /"source":\s*"\/offline\/:path\*"/);
assert.match(vercel, /"destination":\s*"\/index\.html"/);
/* SW fallback page must remain a different URL */
assert.ok(
  readFileSync(resolve(majalisRoot, "public/offline.html"), "utf8").includes("غير متصل"),
  "public/offline.html retained for SW offline fallback",
);

console.log("offline-spa-rewrite-gate.test.ts: ok");
