/**
 * Visual debt V1/V2 (PHASE C) — ratchet for files migrated from literals to tokens.
 * Literal hex / radius px / raw z-index → existing tokens with IDENTICAL resolved values
 * (theme-invariant, or the dark value inside html-anchored dark selectors).
 * node --import tsx src/lib/__tests__/visual-debt-v1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const count = (text: string, re: RegExp) => (text.match(re) || []).length;

/* Same regexes as scripts/visual-system-inventory.mjs */
const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RADIUS_PX_RE = /border-radius\s*:\s*[^;]*\d+px/g;
const Z_RAW_RE = /z-index\s*:\s*\d+/g;
const IMPORTANT_RE = /!important/g;

type Ceil = { hex: number; radiusPx: number; zRaw: number; important: number };
const ceilings: Array<[string, Ceil]> = [
  ["src/styles/admin.css", { hex: 197, radiusPx: 1, zRaw: 5, important: 6 }],
  ["src/styles/dark-mode-recovery.css", { hex: 77, radiusPx: 1, zRaw: 0, important: 167 }],
  ["src/styles/dark-mode-surfaces.css", { hex: 110, radiusPx: 1, zRaw: 0, important: 161 }],
  ["src/styles/pages/app-shell-v2.css", { hex: 31, radiusPx: 1, zRaw: 0, important: 46 }],
  ["src/styles/app-state-v2.css", { hex: 5, radiusPx: 0, zRaw: 0, important: 0 }],
  ["src/styles/sunnah-identity-luxury-night.css", { hex: 8, radiusPx: 0, zRaw: 0, important: 0 }],
  ["src/styles/pages/luxury-night-v2.css", { hex: 6, radiusPx: 0, zRaw: 0, important: 1 }],
  ["src/styles/visual-redesign-v2-tokens.css", { hex: 4, radiusPx: 0, zRaw: 0, important: 0 }],
  ["src/styles/pages/knowledge-dashboards-v2.css", { hex: 17, radiusPx: 1, zRaw: 0, important: 11 }],
  ["src/styles/pages/lessons-sections-v2.css", { hex: 13, radiusPx: 1, zRaw: 0, important: 17 }],
  ["src/styles/pages/lessons.css", { hex: 83, radiusPx: 4, zRaw: 1, important: 63 }],
  ["src/styles/islamic-landmarks.css", { hex: 30, radiusPx: 2, zRaw: 2, important: 8 }],
  ["src/styles/mind-map.css", { hex: 22, radiusPx: 0, zRaw: 2, important: 0 }],
  ["src/styles/pages/stories-seerah-v2.css", { hex: 9, radiusPx: 3, zRaw: 0, important: 1 }],
  ["src/styles/dark-design-system.css", { hex: 30, radiusPx: 0, zRaw: 0, important: 113 }],
  ["src/styles/nations.css", { hex: 13, radiusPx: 0, zRaw: 1, important: 3 }],
  ["src/components/sections/section-cards.css", { hex: 0, radiusPx: 0, zRaw: 1, important: 0 }],
  ["src/styles/brand-v4-contrast-fixes.css", { hex: 21, radiusPx: 0, zRaw: 0, important: 85 }],
  ["src/styles/final-release.css", { hex: 9, radiusPx: 4, zRaw: 4, important: 221 }],
  ["src/styles/index-deferred-pages.css", { hex: 45, radiusPx: 4, zRaw: 8, important: 136 }],
  ["src/styles/premium-dark-refine.css", { hex: 28, radiusPx: 0, zRaw: 0, important: 211 }],
  ["src/styles/sunnah-visual-language.css", { hex: 42, radiusPx: 0, zRaw: 1, important: 10 }],
  ["src/styles/visual-layer-contrast-fix.css", { hex: 3, radiusPx: 0, zRaw: 0, important: 134 }],
  ["src/styles/majlisilm-shell.css", { hex: 19, radiusPx: 0, zRaw: 2, important: 0 }],
  ["src/styles/green-surface-system.css", { hex: 28, radiusPx: 0, zRaw: 0, important: 44 }],
];

for (const [rel, c] of ceilings) {
  const css = read(rel);
  assert.ok(count(css, HEX_RE) <= c.hex, `${rel}: hex ${count(css, HEX_RE)} > ${c.hex}`);
  assert.ok(count(css, RADIUS_PX_RE) <= c.radiusPx, `${rel}: border-radius px ${count(css, RADIUS_PX_RE)} > ${c.radiusPx}`);
  assert.ok(count(css, Z_RAW_RE) <= c.zRaw, `${rel}: raw z-index ${count(css, Z_RAW_RE)} > ${c.zRaw}`);
  assert.ok(count(css, IMPORTANT_RE) <= c.important, `${rel}: !important ${count(css, IMPORTANT_RE)} > ${c.important}`);
}

/* Replacement tokens must stay defined (sync-loaded :root) with the exact migrated values. */
const sf = read("src/styles/sunnah-foundation-tokens.css");
for (const [name, value] of [
  ["--sf-color-ivory-raised", "#ffffff"],
  ["--sf-radius-xs", "12px"],
  ["--sf-radius-sm", "16px"],
  ["--sf-radius-md", "20px"],
  ["--sf-radius-lg", "24px"],
  ["--sf-radius-pill", "999px"],
]) {
  assert.match(sf, new RegExp(`${name}:\\s*${value};`, "i"), `${name} must remain ${value}`);
}
const indexCss = read("src/index.css");
for (const [name, value] of [
  ["--z-base", "0"],
  ["--z-sticky", "100"],
  ["--z-nav", "200"],
  ["--z-modal", "400"],
  ["--z-toast", "500"],
  ["--z-overlay-drawer", "10040"],
  ["--z-overlay-sheet", "10050"],
]) {
  assert.match(indexCss, new RegExp(`${name}:\\s*${value};`), `${name} must remain ${value}`);
}

const budget = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(budget.status, 0, `visual-system-inventory --check failed:\n${budget.stderr || budget.stdout}`);

console.log("visual-debt-v1-gate: ok");
