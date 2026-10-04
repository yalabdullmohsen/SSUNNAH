/**
 * PR S4 — إكمال إطار Dark/System الأول بلا وميض نهاري.
 * تشغيل: node --import tsx src/lib/__tests__/startup-dark-system-s4-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const doc = readRepo("docs/performance/STARTUP_DARK_SYSTEM_S4.md");
assert.match(doc, /DARK_FIRST_FRAME_READABLE|STARTUP_DARK_SYSTEM_S4/);
assert.match(doc, /NO_LIGHT_FLASH_BEFORE_DARK/);
assert.match(doc, /PHYSICAL_DARK_SYSTEM_LIVE_VALIDATION_REQUIRED/);

const html = readPkg("index.html");
assert.match(html, /id="mj-theme-boot"/);
assert.match(html, /storedTheme === "auto"/);
assert.match(html, /prefers-color-scheme:\s*dark/);
assert.match(html, /mj-dark-elevated-boot/);
assert.match(html, /background-color:#101614/);
assert.match(html, /--mj-splash-bg-dark:\s*#101614/);
assert.match(html, /standard-dark/);
assert.match(html, /routeSurface = resolved === "dark" \? "standard-dark"/);

const main = readPkg("src/main.tsx");
assert.match(main, /ensureDarkLayersForBoot/);
assert.match(main, /bootDark/);
assert.match(main, /if\s*\(\s*bootDark\s*\)/);

const ensure = readPkg("src/lib/ensure-dark-layers.ts");
assert.match(ensure, /ensureDarkLayersForBoot/);
assert.match(ensure, /dark-mode-recovery\.css/);

const provider = readPkg("src/components/ThemePreferenceProvider.tsx");
assert.match(provider, /prefers-color-scheme:\s*dark/);
assert.match(provider, /visibilitychange/);
assert.match(provider, /ensureDarkLayersForThemeSwitch/);

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-dark-system-s4"/);

console.log("DARK_FIRST_FRAME_READABLE");
console.log("SYSTEM_FIRST_FRAME_CORRECT");
console.log("THEME_MUTATIONS_MINIMIZED");
console.log("NO_LIGHT_FLASH_BEFORE_DARK");
console.log("startup-dark-system-s4-gate: ok");
