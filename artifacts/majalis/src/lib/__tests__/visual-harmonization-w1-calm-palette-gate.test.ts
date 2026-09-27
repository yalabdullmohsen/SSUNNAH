/**
 * Visual Harmonization Wave 1 — لوحة هادئة + أدوار نص + ذهب مقيّد.
 * Run: node --import tsx src/lib/__tests__/visual-harmonization-w1-calm-palette-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SF2_GOLD_POLICY,
  SF2_TEXT,
  SF2_SURFACE,
  SF2_CONTRAST_NOTES,
} from "@/lib/sunnah-foundation-v2";
import { SF_COLOR, SF_TYPE, SF_RADIUS } from "@/lib/sunnah-foundation-tokens";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readDoc = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

const sf = read("src/styles/sunnah-foundation-tokens.css");
const v2 = read("src/styles/sunnah-foundation-v2.css");
const cs2 = read("src/styles/card-system-v2.css");
const typeCss = read("src/styles/sunnah-foundation-type.css");

/* Locked AA SoT */
assert.match(sf, /--sf-color-warm-ivory:\s*#f8f6f1/i);
assert.match(sf, /--sf-color-warm-ivory-surface:\s*#ffffff/i);
assert.match(sf, /--sf-color-deep-emerald:\s*#0f5c3f/i);
assert.match(sf, /--sf-color-deep-emerald-deep:\s*#0a4530/i);
assert.match(sf, /--sf-color-rich-ink:\s*#15382d/i);

/* Emerald scale + gold sparse */
assert.match(sf, /--sf-emerald-50/);
assert.match(sf, /--sf-emerald-100/);
assert.match(sf, /--sf-emerald-700:\s*#0c4f3a/i);
assert.match(sf, /--sf-emerald-950/);
assert.match(sf, /--sf-gold-emphasis/);
assert.match(sf, /--sf-surface-sage/);
assert.match(sf, /--sf-radius-feature/);
assert.match(sf, /--sf-type-breadcrumb/);
assert.match(sf, /--sf-type-quran/);
assert.match(sf, /--sf-type-hadith/);

/* Semantic text hierarchy */
assert.match(v2, /--sf2-text-on-dark/);
assert.match(v2, /--sf2-text-on-dark-secondary/);
assert.match(v2, /--sf2-text-accent:\s*var\(--sf-color-deep-emerald/);
assert.match(v2, /--sf2-text-warning/);
assert.match(v2, /--sf2-subtle-bg/);
assert.match(v2, /--sf2-accent-gold/);
assert.match(v2, /--sf2-selected-border/);
assert.match(v2, /--sf2-icon-box/);
assert.match(v2, /--sf2-radius-control:\s*var\(--sf-radius-control/);
assert.doesNotMatch(v2, /!important/);

/* Text accent must not default to gold */
assert.doesNotMatch(v2, /--sf2-text-accent:\s*var\(--sf2-accent-gold/);
assert.doesNotMatch(v2, /--sf2-text-accent:\s*var\(--sf-color-quran-gold/);

/* Card polish */
assert.match(cs2, /\.cs2-nav__icon/);
assert.match(cs2, /cs2-nav__open-btn/);
assert.match(cs2, /box-shadow:\s*var\(--sf2-shadow-none/);
assert.doesNotMatch(cs2, /!important/);

/* Type classes */
assert.match(typeCss, /sf-type-breadcrumb/);
assert.match(typeCss, /sf-type-quran/);
assert.match(typeCss, /sf-type-hadith/);

/* TS exports */
assert.match(SF2_TEXT.accent, /sf2-text-accent/);
assert.match(SF2_TEXT.onDark, /sf2-text-on-dark/);
assert.match(SF2_SURFACE.subtle, /sf2-subtle-bg/);
assert.equal(SF2_CONTRAST_NOTES.primaryOnPage.fg, "#15382D");
assert.ok(SF2_GOLD_POLICY.forbiddenDefault.includes("all-links"));
assert.ok(SF2_GOLD_POLICY.allowed.includes("prayer-countdown"));
assert.match(SF_COLOR.emerald700, /sf-emerald-700/);
assert.match(SF_TYPE.breadcrumb, /sf-type-breadcrumb/);
assert.match(SF_RADIUS.feature, /sf-radius-feature/);

for (const doc of [
  "docs/design/CALM_COLOR_SYSTEM.md",
  "docs/design/TYPOGRAPHY_AND_RHYTHM.md",
  "docs/design/VISUAL_CONSISTENCY_AUDIT.md",
  "docs/remediation/waves/WAVE_VISUAL_HARMONIZATION_W1.md",
]) {
  assert.ok(existsSync(resolve(repo, doc)), `missing ${doc}`);
  assert.match(readDoc(doc), /./);
}

console.log("visual-harmonization-w1-calm-palette-gate.test.ts: ok");
