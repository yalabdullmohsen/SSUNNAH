/**
 * WAVE6 — Mushaf fluidity / page-turn / telemetry / font prefetch contracts.
 * Run: node --import tsx src/lib/__tests__/wave6-mushaf-fluidity-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolvePageTurnPhase,
  MUSHAF_PAGE_TURN_PHASES,
  MUSHAF_VISUAL_LOCK_OWNER,
  MUSHAF_PRODUCT_LOCK_OWNER,
  MUSHAF_QUEUED_TURN_INTENT_MAX,
} from "../../features/mushaf-reader/mushaf-page-turn-phase.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

/* docs */
assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/WAVE6_MUSHAF_FLUIDITY_BASELINE.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/WAVE6_SCOPE_MANIFEST.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/WAVE6_REAL_DEVICE_TEST_MATRIX.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/SUNNAH_WAVE6_MUSHAF_FLUIDITY_CLOSURE_REPORT.md")));
assert.match(readRepo("docs/mushaf/WAVE6_SCOPE_MANIFEST.md"), /IMPLEMENTATION_FROZEN/);
assert.match(readRepo("docs/mushaf/WAVE6_REAL_DEVICE_TEST_MATRIX.md"), /DEVICE_REQUIRED/);
/* Historical report may mention forbidden claims only as explicit non-claims */
{
  const wave6Report = readRepo("docs/mushaf/SUNNAH_WAVE6_MUSHAF_FLUIDITY_CLOSURE_REPORT.md");
  assert.match(wave6Report, /DEVICE_REQUIRED|DEVICE_HOLD|never DEVICE_TESTED|never.*MUSHAF_SILKY/i);
  assert.doesNotMatch(
    wave6Report,
    /(?:^|\n)\s*(?:Status|Decision|FINAL)[^\n]*(?:MUSHAF_SILKY|DEVICE_TESTED|STORE GO)\b/i,
  );
}

const font = readPkg("src/features/mushaf-shared/useQpcPageFont.ts");
const tele = readPkg("src/features/mushaf-reader/mushaf-turn-telemetry.ts");
const reader = readPkg("src/features/mushaf-reader/NewMushafReader.tsx");
const pager = readPkg("src/features/mushaf-reader/useMushafPager.ts");
const overlay = readPkg("src/features/mushaf-reader/AyahSelectionOverlay.tsx");
const phase = readPkg("src/features/mushaf-reader/mushaf-page-turn-phase.ts");
const contract = readPkg("src/features/mushaf-reader/mushaf-internal-perf-contract.ts");
const pkg = JSON.parse(readPkg("package.json")) as { scripts: Record<string, string> };

/* 1) Font: page-only wait · no global fonts.ready · idle ±2 · queue cap */
assert.doesNotMatch(font, /await\s+document\.fonts\.ready/);
assert.match(font, /await document\.fonts\.load/);
assert.match(font, /PREFETCH_QUEUE_CAP\s*=\s*4/);
assert.match(font, /requestIdleCallback|scheduleIdle/);
assert.match(font, /enqueueFarPrefetch/);
assert.match(font, /farPrefetchGeneration/);
assert.match(font, /getQpcFarPrefetchCapForTests/);

/* 2) Reader: ±1 eager · ±2 idle · queued intent · swipe over text */
assert.match(reader, /ensureQpcPageFont\(page \+ 1\)/);
assert.match(reader, /ensureQpcPageFont\(page - 1\)/);
assert.match(reader, /ensureQpcPageFont\(page \+ 2\)/);
assert.match(reader, /ensureQpcPageFont\(page - 2\)/);
assert.match(reader, /requestIdleCallback/);
assert.match(reader, /queuedPageRef/);
assert.match(reader, /data-page-turn-phase/);
assert.match(reader, /WAITING_FOR_FONT/);
assert.match(reader, /mushafTurnResetSession/);
assert.match(reader, /WAVE6: النص قابل للسحب|لا تُتجاهل \.nm-word/);
assert.doesNotMatch(
  reader,
  /ignoreSelector="[^"]*\.nm-word/,
  "swipe-over-text: .nm-word must not be in ignoreSelector",
);
assert.doesNotMatch(
  reader,
  /ignoreSelector="[^"]*mushaf-ayah-hit/,
  "swipe-over-text: ayah-hit must not be ignored by pager",
);

/* 3) Dual lock ownership + state machine */
assert.match(phase, new RegExp(MUSHAF_VISUAL_LOCK_OWNER.replace(/\./g, "\\.")));
assert.match(phase, new RegExp(MUSHAF_PRODUCT_LOCK_OWNER.replace(/\./g, "\\.")));
assert.equal(MUSHAF_QUEUED_TURN_INTENT_MAX, 1);
assert.ok(MUSHAF_PAGE_TURN_PHASES.includes("WAITING_FOR_FONT"));
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 10,
    currentPage: 10,
    fontReady: false,
    layoutReady: true,
  }),
  "WAITING_FOR_FONT",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 10,
    currentPage: 9,
    fontReady: true,
    layoutReady: true,
  }),
  "COMMITTING",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: false,
    pendingPage: null,
    currentPage: 1,
    fontReady: true,
    layoutReady: true,
  }),
  "READY",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 3,
    currentPage: 3,
    fontReady: true,
    layoutReady: false,
  }),
  "WAITING_FOR_LAYOUT",
);

/* 4) Telemetry: off by default · no network · WAVE6 keys */
assert.match(tele, /let enabled = false/);
assert.match(tele, /mushaf-turn-telemetry/);
assert.match(tele, /touchToFirstTranslateMs/);
assert.match(tele, /rejectedGestureCount/);
assert.match(tele, /selectionMeasureCount/);
assert.match(tele, /mushafWave6MetricsSnapshot/);
assert.match(tele, /isMushafTurnTelemetryEnabled/);
assert.doesNotMatch(tele, /fetch\(|navigator\.sendBeacon|XMLHttpRequest/);
assert.doesNotMatch(tele, /\buserId\b|\bemail\b|ayahText|verseText/);
assert.match(contract, /MUSHAF_WAVE6_METRIC_KEYS/);
assert.match(contract, /MUSHAF_FAR_FONT_PREFETCH_CAP\s*=\s*4/);

/* 5) Selection: invalidate on container only; measure counted */
assert.match(overlay, /mushafTurnInc\("selectionMeasure"\)/);
assert.match(overlay, /إبطال الكاش عند تغيّر الحاوية/);
assert.match(overlay, /orientationchange/);

/* 6) Pager: rejected gesture on visual lock · rAF translate preserved */
assert.match(pager, /mushafTurnInc\("rejectedGesture"\)/);
assert.match(pager, /scheduleTrackX/);
assert.match(pager, /translate3d/);
assert.match(pager, /panSlopFor/);

/* 7) package script wiring */
assert.match(pkg.scripts["test:wave6-mushaf-fluidity"] || "", /wave6-mushaf-fluidity-gate/);
assert.match(pkg.scripts["test:mushaf-page-flip"] || "", /wave6-mushaf-fluidity-gate/);

/* 8) No Quran asset edits in WAVE6 font module */
assert.doesNotMatch(font, /glyphText|verseKey/);

console.log("wave6-mushaf-fluidity-gate.test.ts: ok");
