/**
 * Interaction PR-9 — Legacy CSS retirement matrix + safe-remove lock.
 * Run: node --import tsx src/lib/__tests__/legacy-css-retirement-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md")));
const matrix = readRepo("docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md");
assert.match(matrix, /KEEP|SAFE_REMOVE|BLOCKED/);
assert.match(matrix, /Interaction PR-9|PR-9/);
assert.match(matrix, /not FULLY COMPLETE|غير مكتمل|PARTIAL/i);
assert.match(matrix, /not STORE GO|Store.*HOLD|HOLD/);
assert.match(matrix, /homepage-ad-bar\.css/);
assert.match(matrix, /decreasing-ceilings|Debt gate|visual-system-debt/);
assert.match(matrix, /pages\/\*-legacy\.css|NEEDS_PORT|MIGRATION/);

/* Prior SAFE_REMOVE (PR-7) stay gone */
for (const rel of [
  "src/styles/components/adhan-active-overlay.css",
  "src/styles/pages/fiqh-admin.css",
  "src/styles/pages/fiqh-council.css",
  "src/styles/pages/library.css",
  "src/views/AboutUsPage.tsx",
] as const) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `must stay removed: ${rel}`);
}

/* PR-9 SAFE_REMOVE (HomepageAdBar cluster) — proven zero product import */
for (const rel of [
  "src/styles/components/homepage-ad-bar.css",
  "src/components/home/HomepageAdBar.tsx",
  "src/config/homepage-ad.ts",
] as const) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `PR-9 SAFE_REMOVE must stay gone: ${rel}`);
}

const appGraph =
  read("src/App.tsx") +
  "\n" +
  read("src/AppRoutes.tsx") +
  "\n" +
  read("src/components/NavBar.tsx") +
  "\n" +
  read("src/main.tsx");
assert.doesNotMatch(appGraph, /HomepageAdBar|homepage-ad-bar\.css|config\/homepage-ad/);

/* Live KEEP layers still imported (no mass retirement) */
assert.match(read("src/main.tsx"), /brand-v4\.css/);
assert.match(read("src/main.tsx"), /final-release\.css/);

/* Remaining *-legacy.css still present with consumers — not SAFE_REMOVE by name */
for (const name of [
  "home-legacy.css",
  "lessons-legacy.css",
  "misc-page-legacy.css",
] as const) {
  const path = resolve(majalisRoot, "src/styles/pages", name);
  assert.ok(existsSync(path), `legacy page CSS present: ${name}`);
}

/* PR6 SAFE_REMOVE — proven zero product import / zero TSX class usage */
for (const rel of [
  "src/styles/pages/search-legacy.css",
  "src/styles/pages/section-hub.css",
] as const) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `PR6 SAFE_REMOVE must stay gone: ${rel}`);
}

function collectTsSources(dir: string, acc: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "__tests__") continue;
      collectTsSources(p, acc);
    } else if (/\.(tsx?|mjs|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const corpus = collectTsSources(resolve(majalisRoot, "src"))
  .filter((p) => !p.includes(`${join("lib", "__tests__")}`))
  .filter((p) => !p.endsWith(`${join("lib", "runtime-cache-purge.ts")}`))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");
assert.doesNotMatch(corpus, /homepage-ad-bar\.css/);
assert.doesNotMatch(corpus, /from ["']@\/config\/homepage-ad["']/);
assert.doesNotMatch(corpus, /HomepageAdBar/);
assert.match(
  read("src/lib/runtime-cache-purge.ts"),
  /HomepageAdBar/,
  "purge may retain legacy dismiss key label",
);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:legacy-css-retirement"] || "", /legacy-css-retirement-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:legacy-css-retirement/);

console.log("legacy-css-retirement-gate.test.ts: ok");
