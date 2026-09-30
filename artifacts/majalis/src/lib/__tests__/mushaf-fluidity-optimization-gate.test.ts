/**
 * Mushaf Fluidity Optimization — عقود القياس + تحسينات مثبتة.
 * Run: node --import tsx src/lib/__tests__/mushaf-fluidity-optimization-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  runMushafFluidityAudit,
  compareFluidity,
  writeFluidityAudit,
  type FluidityAuditSnapshot,
} from "../../features/mushaf-reader/mushaf-fluidity-audit.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_SCOPE.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_REPORT.md")));

const reader = readPkg("src/features/mushaf-reader/NewMushafReader.tsx");
const verse = readPkg("src/features/mushaf-reader/MushafVerseLayer.tsx");
const sync = readPkg("src/features/mushaf-shared/mushaf-ayah-sync-store.ts");
const tele = readPkg("src/features/mushaf-reader/mushaf-turn-telemetry.ts");
const pager = readPkg("src/features/mushaf-reader/useMushafPager.ts");
const page = readPkg("src/features/mushaf-reader/MushafPage.tsx");

/* sync freeze */
assert.match(sync, /subscribeNoop/);
assert.match(sync, /enabled \? subscribe : subscribeNoop/);
assert.match(verse, /syncHighlights/);
assert.match(verse, /useMushafAyahWordSelected\(word\.verseKey,\s*syncHighlights\)/);
assert.match(page, /syncHighlights/);
assert.match(reader, /syncHighlights=\{pagerSettled && role === "current"\}/);

/* direction-aware opposite near idle */
assert.match(reader, /fluidity:\s*opposite-near-idle/);
assert.match(reader, /opposite near on idle/);
assert.match(reader, /ensureQpcPageFont\(page \+ 1\)/);
assert.match(reader, /ensureQpcPageFont\(page - 1\)/);
assert.match(reader, /ensureQpcPageFont\(page \+ 2\)/);
assert.match(reader, /lastTurnDeltaRef/);
assert.doesNotMatch(reader, /setNeighborEpoch/);

/* clearPageChrome guarded */
assert.match(reader, /needsClear/);
assert.match(reader, /if\s*\(\s*!needsClear\s*\)\s*return/);

/* arrows/scrubber do not wait neighborsReady */
assert.doesNotMatch(
  reader,
  /if \(edgesDisabled \|\| !pagerSettled \|\| !neighborsReady\) return/,
);

/* telemetry fluidity marks */
assert.match(tele, /"pointerUp"/);
assert.match(tele, /"visualTransitionEnd"/);
assert.match(tele, /"productUnlock"/);
assert.match(tele, /pointerUpToVisualSettleMs/);
assert.match(tele, /visualSettleToUnlockMs/);
assert.match(pager, /mushafTurnMark\("pointerUp"/);
assert.match(pager, /mushafTurnMark\("visualTransitionEnd"/);
assert.match(reader, /mushafTurnMark\("productUnlock"/);

/* pan visual: no setState storm */
{
  const idx = reader.indexOf("onPanVisualStart={() => {");
  assert.ok(idx >= 0);
  const block = reader.slice(idx, idx + 280);
  assert.match(block, /بصري فقط/);
  assert.doesNotMatch(block, /setTafsirOpen|setSelectedVerseKey|setActionsOpen/);
}

/* selection / bookmarks still frozen while turning */
assert.match(reader, /selectionEnabled=\{pagerSettled && role === "current"\}/);
assert.match(reader, /showBookmarkMarkers=\{role === "current" && pagerSettled\}/);

/* no Quran text mutation in touched modules */
assert.doesNotMatch(sync, /glyphText|verseText/);
assert.doesNotMatch(tele, /fetch\(|sendBeacon/);

/* BEFORE snapshot must exist (captured pre-patch) */
const beforePath = resolve(majalisRoot, "reports/mushaf-fluidity-before.json");
assert.ok(existsSync(beforePath), "reports/mushaf-fluidity-before.json required");
const before = JSON.parse(readFileSync(beforePath, "utf8")) as FluidityAuditSnapshot;
assert.equal(before.phase, "BEFORE");

const after = runMushafFluidityAudit("AFTER");
writeFluidityAudit(after, "reports/mushaf-fluidity-after.json");
const delta = compareFluidity(before, after);
mkdirSync(resolve(majalisRoot, "reports"), { recursive: true });
writeFileSync(
  resolve(majalisRoot, "reports/mushaf-fluidity-delta.json"),
  `${JSON.stringify({ capturedAt: new Date().toISOString(), delta }, null, 2)}\n`,
);

assert.equal(after.metrics.adjacentPaneSyncFrozen, true);
assert.equal(after.metrics.oppositeNearPrefetchOnIdle, true);
assert.equal(after.metrics.clearPageChromeGuarded, true);
assert.equal(after.metrics.neighborEpochRerender, false);
assert.equal(after.metrics.telemetryPointerUp, true);
assert.equal(after.metrics.telemetryVisualTransitionEnd, true);
assert.equal(after.metrics.telemetryProductUnlock, true);
assert.equal(after.metrics.arrowsWaitNeighborsReady, false);
assert.ok(
  after.metrics.estimatedTurnRenderHotspots < before.metrics.estimatedTurnRenderHotspots,
  `hotspots should drop (${before.metrics.estimatedTurnRenderHotspots} → ${after.metrics.estimatedTurnRenderHotspots})`,
);

/* report documents BEFORE/AFTER */
const report = readRepo("docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_REPORT.md");
assert.match(report, /BEFORE/);
assert.match(report, /AFTER/);
assert.match(report, /DELTA/);
assert.match(report, /FIXABLE_IN_REPOSITORY|DEVICE_REQUIRED|MUSHAF_SPECIAL/);

const pkg = JSON.parse(readPkg("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-fluidity-optimization"] || "", /mushaf-fluidity-optimization-gate/);

console.log("mushaf-fluidity-optimization-gate.test.ts: ok");
console.log(
  "hotspots",
  before.metrics.estimatedTurnRenderHotspots,
  "→",
  after.metrics.estimatedTurnRenderHotspots,
);
