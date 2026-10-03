/**
 * Hadith Design Language color-authority drift gate — file-scoped.
 * Prevents Hex / RGB-HSL / page-local palette / unsafe fallbacks / !important color growth.
 * Run: node --import tsx src/lib/__tests__/hadith-design-language-color-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const cssPath = resolve(root, "src/styles/pages/hadith-design-language.css");
const css = readFileSync(cssPath, "utf8");

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RGB_HSL_RE = /\b(?:rgba?|hsla?)\s*\(/g;
const IMPORTANT_RE = /!important/g;
const HEX_FALLBACK_RE = /var\(\s*--[a-zA-Z0-9-]+\s*,\s*#[0-9a-fA-F]{3,8}/g;
const HADITH_FAMILY_RE = /--hadith-[a-z0-9-]+/gi;
const HDL_COLOR_DECL_WITH_HEX = /--hdl-[a-z0-9-]+\s*:[^;]*#[0-9a-fA-F]{3,8}/g;

/** Color-related !important ceiling after absorption (tokenized; flag kept for cascade). */
const COLOR_IMPORTANT_CEILING = 12;
const IMPORTANT_CEILING = 18;

function colorImportantCount(src: string): number {
  return src.split("\n").filter((line) => {
    if (!line.includes("!important")) return false;
    return /\b(color|background|background-color|border-color|border)\s*:/.test(line);
  }).length;
}

console.log("=== HDL CSS — zero Hex ===");
assert.equal((css.match(HEX_RE) || []).length, 0, "no Hex literals in hadith-design-language.css");

console.log("=== HDL CSS — zero RGB/HSL ===");
assert.equal((css.match(RGB_HSL_RE) || []).length, 0, "no rgb/hsl literals");

console.log("=== HDL CSS — zero unsafe Hex fallbacks ===");
assert.equal((css.match(HEX_FALLBACK_RE) || []).length, 0, "no var(--token, #hex) fallbacks");

console.log("=== No --hadith-* family ===");
assert.equal((css.match(HADITH_FAMILY_RE) || []).length, 0);

console.log("=== --hdl-* color decls contain no Hex (aliases only) ===");
assert.equal((css.match(HDL_COLOR_DECL_WITH_HEX) || []).length, 0);

console.log("=== --hdl-* remains alias-only (matn bridges to mj/text) ===");
assert.match(css, /--hdl-matn:\s*var\(--mj-ink\)/);
assert.match(css, /--hdl-notice:\s*var\(--mj-warning\)/);
assert.match(css, /--hdl-fawaid:\s*var\(--mj-info\)/);
assert.doesNotMatch(css, /--hdl-grade-ring\s*:/);

console.log("=== !important ceilings ===");
const imp = (css.match(IMPORTANT_RE) || []).length;
const colorImp = colorImportantCount(css);
assert.ok(imp <= IMPORTANT_CEILING, `!important ${imp} > ${IMPORTANT_CEILING}`);
assert.ok(
  colorImp <= COLOR_IMPORTANT_CEILING,
  `color !important ${colorImp} > ${COLOR_IMPORTANT_CEILING}`,
);

console.log("=== Single active chip/discover color authority (no Hex) ===");
assert.match(
  css,
  /:is\(html\[data-theme="dark"\], html\.dark, html\.theme-dark\) \.hdl-chip\.is-active/,
);
assert.match(css, /var\(--sf-color-deep-emerald-deep\)\s*!important/);
assert.doesNotMatch(css, /#0e2f24|#d7ebe1|#1f4d3a/);

console.log("hadith-design-language-color-authority-gate.test.ts: ok");
console.log("HADITH_DESIGN_LANGUAGE_COLOR_DRIFT_PREVENTED");
