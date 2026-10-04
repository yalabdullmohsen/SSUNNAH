/**
 * بوابة توحيد الهوية البصرية — Dark Emerald + Warm Ivory + Gold accent.
 * Run: node --import tsx src/lib/__tests__/sunnah-visual-identity-unify-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const sf = read("src/styles/sunnah-foundation-tokens.css");
const theme = read("src/app/styles/theme.css");
const aliases = read("src/styles/theme-aliases.css");
const unify = read("src/styles/visual-identity-unify.css");
const calm = read("src/styles/sections-calm-polish.css");
const cards = read("src/styles/card-system-tokens.css");
const shell = read("src/styles/pages/app-shell-v2.css");

console.log("=== Foundation: صفحة فاتحة + زمرد + حبر AA ===");
assert.match(sf, /--sf-color-warm-ivory:\s*#f8f6f1/i);
assert.match(sf, /--sf-color-ivory-canvas:\s*#f8f6f1/i);
assert.match(sf, /--sf-color-warm-ivory-surface:\s*#ffffff/i);
assert.match(sf, /--sf-color-deep-emerald:\s*#0f5c3f/i);
assert.match(sf, /--sf-color-deep-emerald-deep:\s*#0a4530/i);
assert.match(sf, /--sf-color-rich-ink:\s*#15382d/i);
assert.match(sf, /--sf-color-rich-ink-soft:\s*#48645a/i);
assert.match(sf, /--sf-color-deep-emerald-soft:\s*color-mix/);
assert.doesNotMatch(sf, /--sf-color-deep-emerald-soft:\s*#e2efe8/i);
assert.match(sf, /--sf-color-on-emerald:\s*#f7f1e4/i);
assert.match(sf, /--sf-shadow-soft:\s*none/);
assert.match(sf, /--sf-shadow-card:\s*none/);

console.log("=== theme: brand Emerald AA ===");
assert.match(theme, /--mj-brand:\s*#0F5C3F/i);
assert.match(theme, /--mj-brand-deep:\s*#0A4530/i);
assert.match(theme, /--mj-ink:\s*#15382D/i);
assert.doesNotMatch(theme, /--mj-brand-soft:\s*#E2EFE8/i);
assert.match(theme, /--sunnah-v2-shadow-card:\s*none/);

console.log("=== theme-aliases: جسر Foundation (TOKEN ABSORB) · بلا لوحة منافسة في unify/calm ===");
assert.match(aliases, /--mj-brand:\s*var\(--sf-color-deep-emerald/);
assert.match(aliases, /--mj-bg:\s*var\(--sf-color-warm-ivory/);
assert.match(aliases, /--mj-accent:\s*var\(--sf-color-quran-gold/);
assert.match(aliases, /--mj-chip-active-bg:/);
assert.doesNotMatch(unify, /--mj-[\w-]+\s*:/);
assert.doesNotMatch(calm, /--mj-[\w-]+\s*:/);
assert.doesNotMatch(unify, /--mj-brand:\s*#146b52/);
assert.doesNotMatch(unify, /--mj-brand-soft:\s*#e6f2ec/);
assert.doesNotMatch(calm, /--mj-brand:\s*#146b52/);
const unifyOwned = unify + read("src/styles/index-deferred-pages.css");
assert.match(unifyOwned, /:not\(\.hub-card\)/);
/* Wave 1A: radius authority absorbed into theme-aliases */
assert.match(aliases, /--radius-card:\s*var\(--sf-radius-card/);
assert.doesNotMatch(unify, /:root\s*\{[\s\S]*?--radius-card:/);
assert.match(unifyOwned, /\.mss-hero-surface[\s\S]{0,280}background-image:\s*none/);

console.log("=== card tokens: سطح أبيض · نص AA · هيرو on-ink ===");
assert.match(cards, /--cs-ink-shadow:\s*none/);
assert.match(cards, /--cs-on-ink-title:\s*var\(--sf-color-on-emerald|--cs-on-ink/);
assert.match(cards, /--cs-surface-1:\s*var\(--sf-color-warm-ivory/);
assert.match(cards, /--cs-text-primary:\s*var\(--sf-color-rich-ink/);
assert.match(cards, /--cs-text-secondary:\s*var\(--sf-color-rich-ink-soft/);

console.log("=== عناوين: شريط ذهب Accent بلا تدرّج ===");
assert.match(shell, /\.ph2__title::after[\s\S]{0,220}--v2-accent-gold/);
assert.doesNotMatch(
  shell,
  /\.ph2__title::after[\s\S]{0,280}linear-gradient\([\s\S]*?--v2-color-emerald/,
);

console.log("sunnah-visual-identity-unify-gate.test.ts: ok");
