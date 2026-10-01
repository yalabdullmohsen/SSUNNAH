/**
 * ZERO STARTUP FLICKER — عقد الهوية من أول طلاء.
 * Run: node --import tsx src/lib/__tests__/zero-startup-flicker-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const html = read("index.html");
const crit = html.match(/<style id="mj-lcp-critical">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.ok(crit.length > 0, "mj-lcp-critical present");

console.log("=== critical = final identity contract ===");
assert.match(crit, /background-color:#F8F6F1/i, "canvas final");
assert.match(crit, /color:#15382[Dd]/, "ink final");
assert.match(crit, /body\{[^}]*font-size:1\.0625rem/, "body 17px from first paint");
assert.match(crit, /--text-body:1\.0625rem/, "text-body token");
assert.match(crit, /html\.pts-immersive/, "prayer surface in critical");
assert.match(crit, /\.app-back-btn--bar\.fixed-back-bar/, "back-control geometry in critical");
const cfp = read("src/styles/critical-first-paint.css");
assert.match(cfp, /font-size:\s*1\.0625rem/, "font authority in critical-first-paint");

console.log("=== theme boot applies route surface before paint ===");
assert.match(html, /pts-immersive/);
assert.match(html, /chrome-immersive/);
assert.match(html, /dataset\.routeSurface\s*=\s*"prayer-dark"/);

console.log("=== deferred design-system must not re-paint body font/bg ===");
const ds = read("src/styles/design-system.css");
assert.doesNotMatch(
  ds,
  /body\s*\{[^}]*font-size:\s*var\(--ds-text-base\)/s,
  "no deferred body font-size override",
);
assert.doesNotMatch(
  ds,
  /body\s*\{[^}]*background:\s*var\(--ds-parchment\)/s,
  "no deferred body parchment override",
);

console.log("=== sync index/theme body uses final canvas + absolute 17px ===");
const indexCss = read("src/index.css");
assert.match(indexCss, /background-color:\s*var\(--mj-bg\)/);
assert.match(indexCss, /font-size:\s*1\.0625rem/);
assert.doesNotMatch(
  indexCss,
  /--text-body:\s*var\(--msk-text-2/,
  "index must not overwrite --text-body as a color",
);
const themeCss = read("src/app/styles/theme.css");
assert.match(themeCss, /--mj-fs-body:\s*1\.0625rem/);
assert.match(themeCss, /background:\s*var\(--mj-bg\)/);
assert.doesNotMatch(
  themeCss,
  /body\s*\{[^}]*background:\s*var\(--surface-app\)/s,
  "theme body must not paint splash beige",
);
const typeScale = read("src/styles/typography-scale.css");
assert.match(typeScale, /body\s*\{[^}]*font-size:\s*1\.0625rem/s);

console.log("=== no identity re-import after final-release ===");
const main = read("src/main.tsx");
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,600}visual-identity-unify\.css/,
);
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,600}dark-mode-recovery\.css/,
);

console.log("=== page chrome must not inline-paint html/body beige ===");
const applyChrome = read("src/lib/apply-page-chrome.ts");
assert.doesNotMatch(
  applyChrome,
  /root\.style\.backgroundColor\s*=\s*chrome\.statusBarColorHex/,
  "no inline html paint from status bar hex",
);
assert.doesNotMatch(
  applyChrome,
  /document\.body\.style\.backgroundColor\s*=\s*chrome\.statusBarColorHex/,
  "no inline body paint from status bar hex",
);

console.log("zero-startup-flicker-gate: ok");
