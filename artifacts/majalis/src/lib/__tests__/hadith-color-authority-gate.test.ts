/**
 * Hadith color-authority drift gate — file-scoped to hadith.css.
 * Prevents new Hex / RGB-HSL literals, page-local palettes, and !important color growth.
 * Run: node --import tsx src/lib/__tests__/hadith-color-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const cssPath = resolve(root, "src/styles/pages/hadith.css");
const css = readFileSync(cssPath, "utf8");

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RGB_HSL_RE = /\b(?:rgba?|hsla?)\s*\(/g;
const IMPORTANT_RE = /!important/g;
const LOCAL_PALETTE_RE = /--hadith-[a-z0-9-]*color|--hadith-palette|--hadith-green|--hadith-gold/gi;

/** Documented KEEP_JUSTIFIED_WITH_EVIDENCE literals (must stay exact). */
const ALLOWED_RGB = [
  "rgba(0,0,0,0.08)", // card hover shadow depth
  "rgba(0,0,0,0.5)", // modal overlay
  "rgba(0,0,0,0.25)", // modal elevation shadow
  "rgba(224, 215, 196, 0.7)", // qa-card ivory divider (content recipe)
  "rgba(255,255,255,0.72)", // on-brand eyebrow (contrast-sensitive)
  "rgba(255,255,255,0.80)", // on-brand subtitle (contrast-sensitive)
];

console.log("=== Hadith CSS — zero unauthorized Hex ===");
const hexHits = css.match(HEX_RE) || [];
assert.equal(
  hexHits.length,
  0,
  `unauthorized Hex in hadith.css: ${hexHits.slice(0, 12).join(", ")}`,
);

console.log("=== Hadith CSS — RGB/HSL only allowlisted KEEP_JUSTIFIED ===");
const rgbHits = css.match(RGB_HSL_RE) || [];
assert.ok(rgbHits.length <= ALLOWED_RGB.length, `rgb/hsl count ${rgbHits.length} > allow ${ALLOWED_RGB.length}`);
for (const allowed of ALLOWED_RGB) {
  assert.ok(css.includes(allowed), `missing KEEP_JUSTIFIED literal: ${allowed}`);
}
// Every rgba?/hsla? occurrence must be one of the allowlisted strings nearby
const lineRgb = /\b(?:rgba?|hsla?)\s*\(/;
const lines = css.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!lineRgb.test(line)) continue;
  const ok = ALLOWED_RGB.some((a) => line.includes(a));
  assert.ok(ok, `unauthorized rgb/hsl at line ${i + 1}: ${line.trim().slice(0, 120)}`);
}

console.log("=== No page-local Hadith color palette family ===");
assert.equal((css.match(LOCAL_PALETTE_RE) || []).length, 0, "no --hadith-* color family");

console.log("=== !important ceiling (hadith.css) — no growth ===");
const importantCount = (css.match(IMPORTANT_RE) || []).length;
assert.ok(
  importantCount <= 79,
  `!important in hadith.css rose to ${importantCount} (ceiling 79)`,
);

console.log("=== Token authority references present ===");
assert.match(css, /--sf-color-deep-emerald-deep/);
assert.match(css, /--sf-color-rich-ink-soft/);
assert.match(css, /--sf-color-rich-ink-muted/);
assert.match(css, /--sf-surface-raised/);
assert.match(css, /--mj-brand/);
assert.match(css, /--mj-warning/);
assert.match(css, /--mj-danger/);
assert.doesNotMatch(css, /--hadith-/);

console.log("hadith-color-authority-gate.test.ts: ok");
console.log("HADITH_COLOR_DRIFT_PREVENTED");
