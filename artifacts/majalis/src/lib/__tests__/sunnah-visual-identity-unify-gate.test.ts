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
const unify = read("src/styles/visual-identity-unify.css");
const cards = read("src/styles/card-system-tokens.css");
const shell = read("src/styles/pages/app-shell-v2.css");

console.log("=== Foundation: Warm Ivory + Dark Emerald ===");
assert.match(sf, /--sf-color-warm-ivory:\s*#f7f3eb/i);
assert.match(sf, /--sf-color-ivory-canvas:\s*#f7f3eb/i);
assert.match(sf, /--sf-color-deep-emerald:\s*#0f3d2e/i);
assert.match(sf, /--sf-color-deep-emerald-deep:\s*#0a2f24/i);
assert.match(sf, /--sf-color-deep-emerald-soft:\s*color-mix/);
assert.doesNotMatch(sf, /--sf-color-deep-emerald-soft:\s*#e2efe8/i);
assert.match(sf, /--sf-color-on-emerald:\s*#f7f1e4/i);
assert.match(sf, /--sf-shadow-soft:\s*none/);
assert.match(sf, /--sf-shadow-card:\s*none/);

console.log("=== theme: brand Dark Emerald ===");
assert.match(theme, /--mj-brand:\s*#0F3D2E/i);
assert.match(theme, /--mj-brand-deep:\s*#0A3D2E/i);
assert.doesNotMatch(theme, /--mj-brand-soft:\s*#E2EFE8/i);
assert.match(theme, /--sunnah-v2-shadow-card:\s*none/);

console.log("=== unify: جسر Foundation · بلا لوحة منافسة ===");
assert.match(unify, /--mj-brand:\s*var\(--sf-color-deep-emerald/);
assert.match(unify, /--mj-bg:\s*var\(--sf-color-warm-ivory/);
assert.match(unify, /--mj-accent:\s*var\(--sf-color-quran-gold/);
assert.doesNotMatch(unify, /--mj-brand:\s*#146b52/);
assert.doesNotMatch(unify, /--mj-brand-soft:\s*#e6f2ec/);
assert.match(unify, /:not\(\.hub-card\)/);
assert.match(unify, /--radius-card:\s*24px/);
assert.match(unify, /\.mss-hero-surface[\s\S]{0,280}background-image:\s*none/);

console.log("=== card tokens: ink shadow none · ivory title ===");
assert.match(cards, /--cs-ink-shadow:\s*none/);
assert.match(cards, /--cs-on-ink-title:\s*var\(--sf-color-on-emerald|--cs-on-ink/);
assert.match(cards, /--cs-surface-1:\s*var\(--sf-color-warm-ivory/);

console.log("=== عناوين: شريط ذهب Accent بلا تدرّج ===");
assert.match(shell, /\.ph2__title::after[\s\S]{0,220}--v2-accent-gold/);
assert.doesNotMatch(
  shell,
  /\.ph2__title::after[\s\S]{0,280}linear-gradient\([\s\S]*?--v2-color-emerald/,
);

console.log("sunnah-visual-identity-unify-gate.test.ts: ok");
