/**
 * Hadith surface color-authority drift gate — Wave 3 remaining Hadith CSS assets.
 * Covers: arbaeen-nawawi, hadith-books, hadith-mustalah, hadith-badge, hadith-list-card.
 * Prevents Hex / unsafe Hex-RGB fallbacks / page-local palettes / RGB growth beyond KEEP.
 * Run: node --import tsx src/lib/__tests__/hadith-surface-color-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const TARGETS = [
  "src/styles/pages/arbaeen-nawawi.css",
  "src/styles/pages/hadith-books.css",
  "src/styles/pages/hadith-mustalah.css",
  "src/styles/components/hadith-badge.css",
  "src/styles/components/hadith-list-card.css",
] as const;

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RGB_HSL_RE = /\b(?:rgba?|hsla?)\s*\(/g;
const IMPORTANT_RE = /!important/g;
const HEX_FALLBACK_RE = /var\(\s*--[a-zA-Z0-9-]+\s*,\s*#[0-9a-fA-F]{3,8}/g;
const RGB_FALLBACK_RE = /var\(\s*--[a-zA-Z0-9-]+\s*,\s*(?:rgba?|hsla?)\s*\(/g;
const LOCAL_PALETTE_RE =
  /--(?:hadith|arbaeen|an|hb|hs|hlc)-(?:[a-z0-9-]*color|[a-z0-9-]*palette|[a-z0-9-]*green|[a-z0-9-]*gold)\b/gi;

/** Per-file !important ceilings (layout/cascade flags; must not grow). */
const IMPORTANT_CEILINGS: Record<(typeof TARGETS)[number], number> = {
  "src/styles/pages/arbaeen-nawawi.css": 7,
  "src/styles/pages/hadith-books.css": 1,
  "src/styles/pages/hadith-mustalah.css": 0,
  "src/styles/components/hadith-badge.css": 0,
  "src/styles/components/hadith-list-card.css": 0,
};

/**
 * KEEP_JUSTIFIED_WITH_EVIDENCE — on-brand white overlays for contrast on emerald/brand
 * gradients. Replacing with tokens risks on-brand contrast regressions (PR #2518/#2520 pattern).
 */
const ALLOWED_RGB_BY_FILE: Record<(typeof TARGETS)[number], string[]> = {
  "src/styles/pages/arbaeen-nawawi.css": [
    "rgba(255,255,255,0.05)", // today-card decorative orb
    "rgba(255,255,255,0.6)", // today num on brand
    "rgba(255,255,255,0.92)", // today matn on brand
    "rgba(255,255,255,0.55)", // today source on brand
    "rgba(255,255,255,0.8)", // today expl / done border
    "rgba(255,255,255,0.25)", // today expl border
    "rgba(255,255,255,0.5)", // read-btn border
    "rgba(255,255,255,0.15)", // read-btn hover
    "rgba(255,255,255,0.2)", // read-btn done fill
  ],
  "src/styles/pages/hadith-books.css": [
    "rgba(255,255,255,.75)", // active tab access on brand
    "rgba(255,255,255,.7)", // active tab total on brand
    "rgba(255,255,255,.82)", // books index desc on brand
    "rgba(255,255,255,.65)", // books index count on brand
    "rgba(255,255,255,.9)", // books index go on brand
    "rgba(255,255,255,.15)", // books index icon wash
  ],
  "src/styles/pages/hadith-mustalah.css": [
    "rgba(255,255,255,0.15)", // hero badge wash
    "rgba(255,255,255,0.25)", // hero badge border
    "rgba(255,255,255,0.12)", // hero stat wash
    "rgba(255,255,255,0.2)", // hero stat border
    "rgba(255,255,255,0.78)", // hero stat label on brand
  ],
  "src/styles/components/hadith-badge.css": [],
  "src/styles/components/hadith-list-card.css": [],
};

function load(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

console.log("=== Hadith surface Wave3 — zero Hex across targets ===");
for (const rel of TARGETS) {
  const css = load(rel);
  const hexHits = css.match(HEX_RE) || [];
  assert.equal(hexHits.length, 0, `${rel}: unauthorized Hex: ${hexHits.slice(0, 8).join(", ")}`);
}

console.log("=== Hadith surface Wave3 — zero unsafe Hex/RGB var fallbacks ===");
for (const rel of TARGETS) {
  const css = load(rel);
  assert.equal((css.match(HEX_FALLBACK_RE) || []).length, 0, `${rel}: Hex fallback`);
  assert.equal((css.match(RGB_FALLBACK_RE) || []).length, 0, `${rel}: RGB/HSL fallback`);
}

console.log("=== Hadith surface Wave3 — RGB/HSL only KEEP_JUSTIFIED on-brand whites ===");
for (const rel of TARGETS) {
  const css = load(rel);
  const allowed = ALLOWED_RGB_BY_FILE[rel];
  for (const a of allowed) {
    assert.ok(css.includes(a), `${rel}: missing KEEP_JUSTIFIED: ${a}`);
  }
  const lineRgb = /\b(?:rgba?|hsla?)\s*\(/;
  const lines = css.split("\n");
  let rgbOcc = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!lineRgb.test(line)) continue;
    rgbOcc += (line.match(RGB_HSL_RE) || []).length;
    const ok = allowed.some((a) => line.includes(a));
    assert.ok(ok, `${rel}: unauthorized rgb/hsl at L${i + 1}: ${line.trim().slice(0, 120)}`);
  }
  // Ceiling = allowlist size + known intentional repeats (arbaeen 0.8 used twice)
  assert.ok(
    rgbOcc <= allowed.length + 2,
    `${rel}: rgb/hsl occurrences ${rgbOcc} exceed KEEP ceiling ${allowed.length + 2}`,
  );
}

console.log("=== No page-local Hadith color palette family ===");
for (const rel of TARGETS) {
  const css = load(rel);
  assert.equal((css.match(LOCAL_PALETTE_RE) || []).length, 0, `${rel}: local palette`);
}

console.log("=== Badge grade aliases remain token-backed (no Hex) ===");
{
  const badge = load("src/styles/components/hadith-badge.css");
  assert.match(badge, /--hdb-color:\s*var\(--majalis-emerald/);
  assert.match(badge, /--hdb-color:\s*var\(--majalis-emerald-deep/);
  assert.match(badge, /\.hadith-badge--daif\s*\{\s*--hdb-color:\s*var\(--majalis-danger\)/);
  assert.match(badge, /\.hadith-badge--mawdu\s*\{\s*--hdb-color:\s*var\(--majalis-danger\)/);
  assert.doesNotMatch(badge, /#(?:[0-9a-fA-F]{3,8})\b/);
}

console.log("=== List card surfaces use mj/ss token authority ===");
{
  const card = load("src/styles/components/hadith-list-card.css");
  assert.match(card, /--ss-card-bg|--mj-surface/);
  assert.match(card, /--mj-brand/);
  assert.match(card, /--mj-ink-2/);
  // redundant dark preview override removed after tokenization
  assert.doesNotMatch(
    card,
    /html\[data-theme="dark"\][^{]*\.hlc__preview/,
  );
}

console.log("=== Status / notice roles use semantic mj tokens ===");
{
  const books = load("src/styles/pages/hadith-books.css");
  assert.match(books, /\.hb-error[^{]*\{[^}]*--mj-danger/s);
  assert.match(books, /\.hb-notice[^{]*\{[^}]*--mj-brand-deep/s);
  const mustalah = load("src/styles/pages/hadith-mustalah.css");
  assert.match(mustalah, /\.hs-cat-chip--active[^{]*\{[^}]*--mj-brand/s);
}

console.log("=== !important ceilings — no growth ===");
for (const rel of TARGETS) {
  const css = load(rel);
  const n = (css.match(IMPORTANT_RE) || []).length;
  const ceiling = IMPORTANT_CEILINGS[rel];
  assert.ok(n <= ceiling, `${rel}: !important ${n} > ceiling ${ceiling}`);
}

console.log("=== Token authority families present (sf|ss|mj) ===");
for (const rel of TARGETS) {
  const css = load(rel);
  const hasAuthority = /--(?:sf|ss|mj)-/.test(css) || /--majalis-/.test(css);
  assert.ok(hasAuthority, `${rel}: expected sf/ss/mj/majalis token refs`);
}

console.log("hadith-surface-color-authority-gate.test.ts: ok");
console.log("HADITH_SURFACE_COLOR_DRIFT_PREVENTED");
console.log("UNKNOWN_HADITH_VISUAL_DEBT = 0");
