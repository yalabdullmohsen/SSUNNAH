/**
 * بوابة جذر — منع عاجي/كريم على بطاقات فاتحة (عيب إنتاج مقروئية).
 * Run: node --import tsx src/lib/__tests__/card-contrast-aa-root-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function relLum({ r, g, b }: { r: number; g: number; b: number }): number {
  const f = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number {
  const L1 = relLum(hexToRgb(a));
  const L2 = relLum(hexToRgb(b));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const sf = read("src/styles/sunnah-foundation-tokens.css");
const tokens = read("src/styles/card-system-tokens.css");
const css = read("src/styles/card-system.css");
const shell = read("src/styles/pages/app-shell-v2.css");
const sections = read("src/styles/pages/lessons-sections-v2.css");

console.log("=== توكنات الهدف AA ===");
assert.match(sf, /--sf-color-rich-ink:\s*#15382d/i);
assert.match(sf, /--sf-color-rich-ink-soft:\s*#48645a/i);
assert.match(sf, /--sf-color-rich-ink-muted:\s*#5f7168/i);
assert.match(sf, /--sf-color-warm-ivory:\s*#f8f6f1/i);
assert.match(sf, /--sf-color-warm-ivory-surface:\s*#ffffff/i);
assert.match(sf, /--sf-color-deep-emerald:\s*#0f5c3f/i);
assert.match(sf, /--sf-color-deep-emerald-deep:\s*#0a4530/i);
assert.match(sf, /--sf-hairline:\s*rgba\(\s*15,\s*92,\s*63,\s*0\.12\s*\)/i);

assert.match(tokens, /--cs-text-primary:\s*var\(--sf-color-rich-ink/);
assert.match(tokens, /--cs-text-secondary:\s*var\(--sf-color-rich-ink-soft/);
assert.match(tokens, /--cs-text-muted:\s*var\(--sf-color-rich-ink-muted/);
assert.match(tokens, /--cs-surface-3:\s*(#ffffff|var\(--mj-white\))/i);
assert.match(tokens, /--cs-border:\s*var\(--sf-hairline/);

console.log("=== نسب تباين AA ===");
for (const [label, fg, bg, min] of [
  ["عنوان على أبيض", "#15382D", "#FFFFFF", 4.5],
  ["وصف على أبيض", "#48645A", "#FFFFFF", 4.5],
  ["مكتوم على أبيض", "#5F7168", "#FFFFFF", 4.5],
  ["عنوان على صفحة", "#15382D", "#F8F6F1", 4.5],
  ["وصف على صفحة", "#48645A", "#F8F6F1", 4.5],
] as const) {
  const ratio = contrast(fg, bg);
  assert.ok(ratio >= min, `${label}: ${ratio.toFixed(2)} < ${min}`);
  console.log(`  ✓ ${label}: ${ratio.toFixed(2)}:1`);
}

console.log("=== بطاقات أقسام بيضاء · بلا عاجي على فاتح ===");
assert.match(css, /\.hub-card:not\(\[data-scripture\]\)[\s\S]{0,900}?--cs-surface-3/);
assert.match(css, /\.card__label[\s\S]{0,200}?--cs-text-primary/);
assert.match(css, /\.card__subtitle[\s\S]{0,200}?--cs-text-secondary/);
assert.doesNotMatch(
  css,
  /\.hub-card:not\(\[data-scripture\]\)[\s\S]{0,500}?background(?:-color)?:\s*var\(--cs-ink-topic\)/,
  "hub-card ليس زمرديًا داكنًا",
);
assert.doesNotMatch(
  css,
  /\.card__label[\s\S]{0,120}?--cs-on-ink-title/,
  "عنوان البطاقة بلا عاجي on-ink",
);
assert.doesNotMatch(
  css,
  /\.card__subtitle[\s\S]{0,120}?--cs-on-ink-body/,
  "وصف البطاقة بلا كريم on-ink",
);

/* سطح hub-card الفاتح يأتي الآن من طبقة التباين الموحّدة (--surface) لا من app-shell/lessons-sections */
const contrastFix = read("src/styles/visual-layer-contrast-fix.css");
assert.match(contrastFix, /\.hub-card,[\s\S]{0,1200}?background:\s*var\(--surface\)\s*!important/);
const identitySections = read("src/styles/sunnah-identity-sections.css");
for (const [name, src] of [["app-shell-v2", shell], ["lessons-sections-v2", sections], ["identity-sections", identitySections]] as const) {
  assert.doesNotMatch(
    src,
    /\.hub-card[^{]*\{[^}]*--cs-ink-topic/,
    `${name}: لا زمرد داكن على hub-card`,
  );
}

/* الهيرو يبقى زمرديًا داكنًا مع نص عاجي */
assert.match(css, /\.cs-hero[\s\S]{0,400}?--cs-ink-hero/);
assert.match(css, /\.cs-hero[\s\S]{0,500}?--cs-on-ink/);

console.log("card-contrast-aa-root-gate.test.ts: ok");
