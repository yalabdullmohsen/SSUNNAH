/**
 * U3 — Light / Dark / System single pipeline.
 * node --import tsx src/lib/__tests__/u3-theme-pipeline-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

console.log("=== U3 Ready Pack + authority ===");
assert.ok(existsSync(resolve(repoRoot, "docs/remediation/U3_LIGHT_DARK_SYSTEM_READY_PACK.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/design/DARK_MODE_AUTHORITY.md")));
const u3 = readRepo("docs/remediation/U3_LIGHT_DARK_SYSTEM_READY_PACK.md");
assert.match(u3, /DARK_LIGHT_UNIFIED|EXECUTION|U3/);
const authority = readRepo("docs/design/DARK_MODE_AUTHORITY.md");
assert.match(authority, /applyThemePreference/);
assert.match(authority, /ensure-dark-layers/);

console.log("=== first paint boot (index.html) ===");
const html = read("index.html");
assert.match(html, /id="mj-theme-boot"/);
assert.match(html, /localStorage\.getItem\("majalis-theme"\)/);
assert.match(html, /html\.dataset\.theme\s*=\s*resolved/);

console.log("=== canonical JS writer ===");
const themePref = read("src/lib/theme-preference.ts");
assert.match(themePref, /export function applyThemePreference/);
assert.match(themePref, /already/);
assert.match(themePref, /THEME_STORAGE_KEY/);

const boot = read("src/lib/boot-sequence.ts");
assert.match(boot, /applyThemePreference\(readThemePreference\(\)\)/);
assert.doesNotMatch(boot, /dataset\.theme\s*=/);

const provider = read("src/components/ThemePreferenceProvider.tsx");
assert.match(provider, /useLayoutEffect/);
assert.match(provider, /applyThemePreference/);
assert.match(provider, /ensureDarkLayersForThemeSwitch/);

console.log("=== ensure-dark-layers = CSS load only ===");
const ensure = read("src/lib/ensure-dark-layers.ts");
assert.doesNotMatch(ensure, /dataset\.theme/);
assert.doesNotMatch(ensure, /classList\.(add|remove|toggle)\(\s*["']dark["']/);
assert.doesNotMatch(ensure, /classList\.(add|remove|toggle)\(\s*["']theme-dark["']/);
assert.match(ensure, /dark-mode-surfaces\.css/);

console.log("=== route-surface must not flip product theme ===");
const routeSurface = read("src/lib/route-surface.ts");
assert.doesNotMatch(routeSurface, /dataset\.theme\s*=/);
assert.doesNotMatch(routeSurface, /classList\.(add|remove).*["']dark["']/);

console.log("=== no parallel dataset.theme writers under src (excl. tests) ===");
const srcRoot = resolve(majalisRoot, "src");
const offenders: string[] = [];
const walk = (dir: string) => {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "__tests__" || ent.name === "node_modules") continue;
      walk(p);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(ent.name)) continue;
    const rel = p.slice(majalisRoot.length + 1);
    if (rel === "src/lib/theme-preference.ts") continue;
    const text = readFileSync(p, "utf8");
    /* assignment only — not reads like dataset.theme === "dark" */
    if (
      /(?:dataset\.theme|\[['"]data-theme['"]\])\s*=(?!=)/.test(text) ||
      /setAttribute\(\s*["']data-theme["']\s*,/.test(text)
    ) {
      offenders.push(rel);
    }
  }
};
walk(srcRoot);
assert.deepEqual(offenders, [], `unexpected theme writers: ${offenders.join(", ")}`);

console.log("u3-theme-pipeline-gate: PASS");
