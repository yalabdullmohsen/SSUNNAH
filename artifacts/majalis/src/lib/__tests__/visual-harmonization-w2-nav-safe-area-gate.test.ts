/**
 * Visual Harmonization Wave 2 — inset مشترك + نهاية صفحة + شريط سفلي هادئ.
 * Run: node --import tsx src/lib/__tests__/visual-harmonization-w2-nav-safe-area-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readDoc = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

const v2 = read("src/styles/sunnah-foundation-v2.css");
const nav = read("src/styles/m2030/navigation.css");
const theme = read("src/app/styles/theme.css");
const critical = read("src/styles/critical-first-paint.css");

/* Shared content inset alias */
assert.match(v2, /--sf2-content-bottom-inset:\s*var\(\s*--content-pb/);
assert.match(v2, /--sf2-page-end-gap/);
assert.match(v2, /\.sf2-page-end\b/);
assert.match(v2, /\.sf2-page-end__nav\b/);
assert.match(v2, /\.sf2-page-end__meta\b/);

/* #main-content already owns --content-pb */
assert.match(critical, /#main-content\.app-main[\s\S]{0,120}?padding-block-end:\s*var\(--content-pb\)/);
assert.match(theme, /--content-pb:\s*calc\(var\(--bottom-nav-height\)/);

/* Bottom nav: calmer chrome, no drop shadow, emerald selected (light) */
assert.match(nav, /\.bottom-nav[\s\S]{0,400}?box-shadow:\s*none\s*!important/);
assert.match(nav, /\.bottom-nav[\s\S]{0,400}?background-color:\s*var\(--surface-app/);
assert.match(nav, /\.bottom-nav__tab\.is-active[\s\S]{0,200}?--sf2-action-primary/);
assert.match(nav, /\.bottom-nav__tab\.is-active[\s\S]{0,200}?--sf2-selected-bg/);
assert.match(nav, /min-height:\s*2\.75rem/);

/* surface-app splash contract preserved; mj-bg already Foundation ivory */
assert.match(theme, /--surface-app:\s*#F7F3EB/i);
assert.match(theme, /--mj-bg:\s*var\(--sf-color-warm-ivory/i);

for (const doc of [
  "docs/design/NAVIGATION_AND_SAFE_AREA.md",
  "docs/design/PAGE_ENDING_SYSTEM.md",
  "docs/remediation/waves/WAVE_VISUAL_HARMONIZATION_W2.md",
]) {
  assert.ok(existsSync(resolve(repo, doc)), `missing ${doc}`);
  assert.match(readDoc(doc), /sf2-content-bottom-inset|content-pb|PAGE_ENDING|WAVE_VISUAL_HARMONIZATION_W2/);
}

console.log("visual-harmonization-w2-nav-safe-area-gate.test.ts: ok");
