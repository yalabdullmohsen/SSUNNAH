/**
 * Dark Mode authority (Interaction PR-8).
 * node --import tsx src/lib/__tests__/dark-mode-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/DARK_MODE_AUTHORITY.md")));
const authority = readRepo("docs/design/DARK_MODE_AUTHORITY.md");
assert.match(authority, /ThemePreferenceProvider/);
assert.match(authority, /data-theme/);
assert.match(authority, /--sf-/);
assert.match(authority, /--ss-/);
assert.match(authority, /--mj-/);
assert.match(authority, /MUSHAF_SPECIAL|Mushaf/);
assert.match(authority, /HOLD/);
assert.match(authority, /Forbidden|ممنوع|page-local/i);
assert.match(authority, /--surface-app|#0F1613/i);

const themePref = read("src/lib/theme-preference.ts");
assert.match(themePref, /root\.dataset\.theme\s*=\s*resolved/);
assert.match(themePref, /classList\.add\("dark"/);
assert.match(themePref, /THEME_STORAGE_KEY/);
assert.doesNotMatch(themePref, /filter:\s*invert/);

const provider = read("src/components/ThemePreferenceProvider.tsx");
assert.match(provider, /applyThemePreference/);
assert.match(provider, /ensureDarkLayersForThemeSwitch/);
assert.match(provider, /setPreference/);

const ensure = read("src/lib/ensure-dark-layers.ts");
assert.match(ensure, /dark-mode-surfaces\.css/);
assert.match(ensure, /dark-design-system\.css/);
assert.match(ensure, /premium-dark-refine\.css/);

const app = read("src/App.tsx");
assert.match(app, /ThemePreferenceProvider/);

// Single product switch: only theme-preference + boot may assign dataset.theme
const writers = [
  "src/lib/theme-preference.ts",
  "src/lib/boot-sequence.ts",
].map((rel) => read(rel));
for (const src of writers) {
  assert.match(src, /dataset\.theme\s*=/);
}

const themeCss = read("src/app/styles/theme.css");
assert.match(themeCss, /html\[data-theme="dark"\]/);
assert.match(themeCss, /--surface-app:\s*#0F1613/i);
assert.match(themeCss, /--mj-bg:\s*var\(--surface-app\)/);

const designTokens = read("src/styles/design-tokens.css");
assert.match(
  designTokens,
  /--bg:\s*var\(--surface-app/,
  "design-tokens dark --bg must inherit product night canvas",
);
assert.match(designTokens, /--ss-warm-bg:\s*var\(--mj-bg/);
assert.doesNotMatch(
  designTokens.replace(/\/\*[\s\S]*?\*\//g, ""),
  /html\[data-theme="dark"\][\s\S]{0,400}--bg:\s*#131A18/i,
  "no competing #131A18 canvas in design-tokens dark block",
);

const hajj = read("src/styles/pages/hajj.css");
assert.doesNotMatch(
  hajj,
  /html\[data-theme="dark"\]\s*\.hj-page\s*\{[^}]*#[0-9a-fA-F]{3,8}/,
  "hajj must not page-local dark canvas hex",
);
assert.match(hajj, /\.hj-page[^{]*\{[^}]*var\(--mj-bg\)/);

const darkSurfaces = read("src/styles/dark-mode-surfaces.css");
assert.match(
  darkSurfaces,
  /\.bottom-nav[\s\S]{0,200}var\(--dm-bottom-nav/,
  "bottom nav dark uses --dm-bottom-nav",
);
assert.doesNotMatch(
  darkSurfaces.match(
    /Bottom nav[\s\S]*?\.bottom-nav--v2\s*\{[\s\S]{0,220}\}/,
  )?.[0] ?? "",
  /background:\s*#131a18/i,
  "bottom nav must not hardcode #131a18",
);

assert.doesNotMatch(read("src/styles/dark-design-system.css"), /filter:\s*invert/);
assert.doesNotMatch(read("src/styles/premium-dark-refine.css"), /filter:\s*invert/);
assert.doesNotMatch(read("src/styles/dark-mode-recovery.css"), /filter:\s*invert/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:dark-mode-authority"] || "", /dark-mode-authority-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:dark-mode-authority/);

console.log("dark-mode-authority-gate.test.ts: ok");
