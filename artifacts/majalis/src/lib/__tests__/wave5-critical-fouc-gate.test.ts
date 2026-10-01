/**
 * WAVE5 — Critical CSS margin · CSS import duplication allowlist · dead sync residue.
 * Run: node --import tsx src/lib/__tests__/wave5-critical-fouc-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const main = read("src/main.tsx");
const indexCss = read("src/index.css");

const sync = [...main.matchAll(/^\s*import\s+"(\.\/[^"]+\.css)"/gm)].map((m) => m[1]);
const deferred = [...main.matchAll(/import\("(\.\/[^"]+\.css)"\)/g)].map((m) => m[1]);
const syncSet = new Set(sync);
const deferredSet = new Set(deferred);
const dups = [...syncSet].filter((f) => deferredSet.has(f)).sort();

/**
 * WAVE7: unify + dark-mode-recovery no longer re-imported after final-release.
 * Phase 3: interaction-states sync-only (no idle reimport); dark core via ensure-dark-layers.
 */
const ALLOWED_SYNC_DEFERRED_DUP: string[] = [];

assert.deepEqual(
  dups,
  ALLOWED_SYNC_DEFERRED_DUP.slice().sort(),
  `sync∩deferred must equal allowlist (got ${JSON.stringify(dups)})`,
);

assert.match(main, /void import\("\.\/styles\/final-release\.css"\)/);
assert.match(main, /^\s*import\s+"\.\/styles\/visual-identity-unify\.css"/m);
assert.match(main, /^\s*import\s+"\.\/styles\/dark-mode-recovery\.css"/m);
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,500}visual-identity-unify\.css/,
  "WAVE7: no unify reload-to-win after final-release",
);
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,500}dark-mode-recovery\.css/,
  "WAVE7: no recovery reload-to-win after final-release",
);

/**
 * U1 LHCI Home graph: tokens / identity-reset / v2-tokens / contrast-fix /
 * sections-calm-polish / ssunnah-ux-polish move sync→idle (Home ATF keeps
 * foundation + theme + unify + interaction-states + dark-mode-recovery).
 * Evidence: unused-css selected ≤80 · unused-js ≤500 · forced-reflow=1.
 */
assert.ok(sync.length === 16, `sync CSS imports expected 16 after U1 (got ${sync.length})`);
assert.ok(deferred.length >= 42, `deferred call sites expected ≥42 after Phase 3 (got ${deferred.length})`);
assert.ok(deferred.length <= 49, `deferred call sites expected ≤49 after U1 idle absorb (got ${deferred.length})`);
assert.match(main, /ensure-dark-layers|ensureDarkCoreLayers/, "Phase 3 dark loader wired");
/* U1: listed polish/token sheets must not return to sync entry */
for (const f of [
  "./styles/tokens.css",
  "./styles/sunnah-identity-reset.css",
  "./styles/visual-redesign-v2-tokens.css",
  "./styles/visual-layer-contrast-fix.css",
  "./styles/sections-calm-polish.css",
  "./styles/ssunnah-ux-polish.css",
]) {
  assert.ok(deferredSet.has(f), `U1: ${f} stays deferred`);
  assert.ok(!syncSet.has(f), `U1: ${f} must not be sync`);
}

/** Proven-dead classes must not return to critical index.css. */
const FORBIDDEN_IN_INDEX = [
  /\.home-trust-strip\b/,
  /\.notif-bell-btn\b/,
  /\.mj-tabs-trigger\b/,
  /\.prayer-time-cell\b/,
  /\.prayer-tracker-grid\b/,
  /\.prayer-status-block\b/,
  /\.prayer-countdown-hms\b/,
  /\.site-footer-brand\b(?!-name)/,
  /\.mobile-nav-layer--drawer\b/,
  // WAVE12 DEAD_PROVEN / ownership moves — must not return to critical index.css
  /\.sheikh-series-grid\b/,
  /\.qibla-panel\b/,
  /\.quran-toolbar\b/,
  /\.radio-player\b/,
  /\.nawawi-card\b/,
  /\.share-btn\b/,
  /\.prophets-lux-tabs\b/,
  /\.bottom-nav__prayer-float\b/,
  /\.la-card\b/,
  /\.islamic-ornament-strip\b/,
  /\.unsourced-badge\b/,
  /\.tasbih-page-card\b/,
  /\.quran-source-note\b/,
  /\.fatwa-card\b/,
];
for (const re of FORBIDDEN_IN_INDEX) {
  assert.doesNotMatch(indexCss, re, `dead selector ${re} must stay out of index.css`);
}

assert.match(indexCss, /\.home-kuwait-grid/, "home-kuwait-grid remains (HomeUpcoming*)");
assert.match(indexCss, /\.navbar-admin-link/, "navbar-admin-link remains");

/** Theme boot + Provider share storage key */
const html = read("index.html");
assert.match(html, /id="mj-theme-boot"/);
assert.match(html, /localStorage\.getItem\("majalis-theme"\)/);
const themePref = read("src/lib/theme-preference.ts");
assert.match(themePref, /majalis-theme/);

/** Prefetch must not commit route surface */
const surface = read("src/lib/route-surface.ts");
assert.match(surface, /prefetchPrayerRouteAssets/);
assert.match(surface, /commitRouteSurface/);
assert.doesNotMatch(
  surface.slice(surface.indexOf("prefetchPrayerRouteAssets")),
  /classList\.|dataset\.routeSurface\s*=/,
  "prefetch must not mutate document theme/surface",
);

/** Chunk recovery: quiet · no technical toast UI */
assert.match(read("src/components/ChunkRecoveryToast.tsx"), /return null/);
assert.match(read("src/lib/chunk-recovery.ts"), /quiet:\s*true/);

/** Critical gzip margin vs pre-WAVE5 baseline (60125) when dist present */
const assets = resolve(root, "dist/assets");
const BUDGET = 60 * 1024;
const PRE_WAVE5_GZ = 60125;
if (existsSync(assets)) {
  const cssFiles = readdirSync(assets).filter((f) => /^index-.*\.css$/.test(f));
  assert.ok(cssFiles.length >= 1);
  let largest = { name: "", gz: 0 };
  for (const name of cssFiles) {
    const gz = gzipSync(readFileSync(join(assets, name)), { level: 9 }).length;
    if (gz > largest.gz) largest = { name, gz };
  }
  assert.ok(largest.gz <= BUDGET, `critical gzip ${largest.gz} > ${BUDGET}`);
  assert.ok(
    largest.gz < PRE_WAVE5_GZ,
    `critical gzip must improve on pre-WAVE5 ${PRE_WAVE5_GZ} (got ${largest.gz})`,
  );
  assert.ok(
    BUDGET - largest.gz > 1315,
    `margin must exceed pre-WAVE5 1315 (got ${BUDGET - largest.gz})`,
  );
  console.log(
    `wave5-critical-fouc-gate: critical ${largest.name} gz=${largest.gz} margin=${BUDGET - largest.gz}`,
  );
} else {
  console.log("wave5-critical-fouc-gate: skip gzip (no dist/assets)");
}

console.log("wave5-critical-fouc-gate.test.ts: ok");
