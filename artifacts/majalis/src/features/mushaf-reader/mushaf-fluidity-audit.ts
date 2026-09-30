/**
 * Device Fluidity Audit — مقاييس مستودع قابلة للتكرار لبرنامج نعومة التقليب.
 * لا شبكة · لا نص قرآن · يُشغَّل من البوابة / السكربت.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export type FluidityAuditSnapshot = {
  capturedAt: string;
  phase: "BEFORE" | "AFTER" | "LIVE";
  topDelays: Array<{ id: string; severity: number; evidence: string; class: string }>;
  metrics: {
    verseWordSyncSubscriptionsPerWord: number;
    adjacentPaneSyncFrozen: boolean;
    oppositeNearPrefetchOnIdle: boolean;
    directionAwareNearOrder: boolean;
    clearPageChromeGuarded: boolean;
    neighborEpochRerender: boolean;
    arrowsWaitNeighborsReady: boolean;
    scrubberWaitNeighborsReady: boolean;
    selectionFrozenWhileTurning: boolean;
    bookmarkMarkersFrozenWhileTurning: boolean;
    telemetryPointerUp: boolean;
    telemetryVisualTransitionEnd: boolean;
    telemetryProductUnlock: boolean;
    fontCacheHitSyncUsP50: number;
    fontCacheHitSyncUsP95: number;
    fontCacheHitSamples: number;
    estimatedTurnRenderHotspots: number;
  };
};

function readPkg(rel: string): string {
  return readFileSync(resolve(majalisRoot, rel), "utf8");
}

function countMatches(src: string, re: RegExp): number {
  return [...src.matchAll(re)].length;
}

/**
 * Microbench لمسار كاش جاهزية الخط (Set.has) — يطابق isQpcPageFontReady دون استيراد React.
 */
function benchFontCacheHit(): { p50: number; p95: number; samples: number } {
  const loaded = new Set<number>();
  for (let p = 1; p <= 24; p++) loaded.add(p);
  const samples: number[] = [];
  for (let i = 0; i < 80; i++) {
    const page = 1 + (i % 24);
    const t0 = performance.now();
    for (let j = 0; j < 5000; j++) {
      void loaded.has(page);
    }
    const us = ((performance.now() - t0) / 5000) * 1000;
    samples.push(us);
  }
  samples.sort((a, b) => a - b);
  const p50 = samples[Math.floor(samples.length * 0.5)] ?? 0;
  const p95 = samples[Math.floor(samples.length * 0.95)] ?? 0;
  return { p50, p95, samples: samples.length };
}

export function runMushafFluidityAudit(
  phase: FluidityAuditSnapshot["phase"] = "LIVE",
): FluidityAuditSnapshot {
  const reader = readPkg("src/features/mushaf-reader/NewMushafReader.tsx");
  const verse = readPkg("src/features/mushaf-reader/MushafVerseLayer.tsx");
  const sync = readPkg("src/features/mushaf-shared/mushaf-ayah-sync-store.ts");
  const tele = readPkg("src/features/mushaf-reader/mushaf-turn-telemetry.ts");
  const pager = readPkg("src/features/mushaf-reader/useMushafPager.ts");

  const verseWordSyncSubscriptionsPerWord = countMatches(
    verse,
    /useMushafAyahWord(?:Selected|Playing|SearchHighlight)\(/g,
  );
  /* في VerseWord الحقيقي نتوقع 3 استدعاءات؛ مع enabled=false تبقى الاستدعاءات لكن الاشتراك noop */
  const adjacentPaneSyncFrozen =
    /syncHighlights=\{/.test(reader) ||
    /useMushafAyahWordSelected\([^)]+,\s*(?:syncHighlights|enabled|highlightsEnabled)/.test(
      verse,
    ) ||
    /enabled\s*\?\s*subscribe\s*:\s*subscribeNoop/.test(sync);

  const oppositeNearPrefetchOnIdle =
    /fluidity:\s*opposite-near-idle/.test(reader) ||
    /opposite near on idle/.test(reader);

  const directionAwareNearOrder =
    /lastTurnDeltaRef/.test(reader) && /preferNext/.test(reader);

  const clearPageChromeGuarded =
    /clearPageChrome[\s\S]{0,400}(?:alreadyClear|chromeIdle|needsClear|لا عمل)/.test(
      reader,
    ) || /if\s*\(\s*!needsClear\s*\)\s*return/.test(reader);

  const neighborEpochRerender = /setNeighborEpoch/.test(reader);

  const arrowsWaitNeighborsReady =
    /MushafPageArrows[\s\S]{0,500}!neighborsReady/.test(reader) ||
    /go=\{\(n\)\s*=>\s*\{[\s\S]{0,180}!neighborsReady/.test(reader);

  const scrubberWaitNeighborsReady =
    /onScrubberGoto[\s\S]{0,200}!neighborsReady/.test(reader);

  const selectionFrozenWhileTurning =
    /selectionEnabled=\{pagerSettled && role === "current"\}/.test(reader);

  const bookmarkMarkersFrozenWhileTurning =
    /showBookmarkMarkers=\{role === "current" && pagerSettled\}/.test(reader);

  const telemetryPointerUp =
    /"pointerUp"/.test(tele) && /mushafTurnMark\("pointerUp"/.test(pager);
  const telemetryVisualTransitionEnd =
    /"visualTransitionEnd"/.test(tele) &&
    /mushafTurnMark\("visualTransitionEnd"/.test(pager);
  const telemetryProductUnlock =
    /"productUnlock"/.test(tele) &&
    /mushafTurnMark\("productUnlock"/.test(reader);

  const fontBench = benchFontCacheHit();

  let estimatedTurnRenderHotspots = 0;
  if (!adjacentPaneSyncFrozen) estimatedTurnRenderHotspots += 40;
  if (neighborEpochRerender) estimatedTurnRenderHotspots += 8;
  if (!clearPageChromeGuarded) estimatedTurnRenderHotspots += 6;
  if (arrowsWaitNeighborsReady) estimatedTurnRenderHotspots += 5;
  if (!oppositeNearPrefetchOnIdle) estimatedTurnRenderHotspots += 10;

  const topDelays = [
    {
      id: "PRODUCT_LOCK_FONT_LAYOUT",
      severity: 10,
      evidence: "finishPageTurn waits fontReady+layout+displayView",
      class: "MUSHAF_SPECIAL",
    },
    {
      id: "VISUAL_SETTLE_220MS",
      severity: 9,
      evidence: "SETTLE_MS=220 CSS transition before go()",
      class: "KEEP_JUSTIFIED",
    },
    {
      id: "WORD_SYNC_FANOUT_X3_SHEETS",
      severity: adjacentPaneSyncFrozen ? 4 : 9,
      evidence: adjacentPaneSyncFrozen
        ? "adjacent/turning panes use noop sync subscribe"
        : "each word subscribes selected/playing/search on all sheets",
      class: adjacentPaneSyncFrozen ? "PARTIAL" : "FIXABLE_IN_REPOSITORY",
    },
    {
      id: "FONT_MISS_ON_TARGET",
      severity: 8,
      evidence: "ensureQpcPageFont before commitNav when cache miss",
      class: "MUSHAF_SPECIAL",
    },
    {
      id: "BIDIRECTIONAL_NEAR_PREFETCH_CONTENTION",
      severity: oppositeNearPrefetchOnIdle ? 3 : 7,
      evidence: oppositeNearPrefetchOnIdle
        ? "opposite ±1 deferred to idle"
        : "both ±1 eager compete with target font",
      class: "FIXABLE_IN_REPOSITORY",
    },
    {
      id: "CLEAR_CHROME_SETSTATE_STORM",
      severity: clearPageChromeGuarded ? 2 : 6,
      evidence: "beginPageTurn→clearPageChrome multi setState",
      class: "FIXABLE_IN_REPOSITORY",
    },
    {
      id: "NEIGHBOR_EPOCH_RERENDER",
      severity: neighborEpochRerender ? 5 : 1,
      evidence: "setNeighborEpoch after prefetch completes",
      class: "FIXABLE_IN_REPOSITORY",
    },
    {
      id: "SELECTION_GETCLIENTRECTS",
      severity: selectionFrozenWhileTurning ? 2 : 6,
      evidence: "AyahSelectionOverlay measure path",
      class: selectionFrozenWhileTurning ? "PARTIAL" : "FIXABLE_IN_REPOSITORY",
    },
    {
      id: "DOM_WORDS_X3_COMPOSITE",
      severity: 7,
      evidence: "three interactive QPC sheets during pan",
      class: "MUSHAF_SPECIAL",
    },
    {
      id: "DEVICE_MAIN_THREAD_UNKNOWN",
      severity: 6,
      evidence: "long tasks / FPS not measured in CI",
      class: "DEVICE_REQUIRED",
    },
  ].sort((a, b) => b.severity - a.severity);

  return {
    capturedAt: new Date().toISOString(),
    phase,
    topDelays,
    metrics: {
      verseWordSyncSubscriptionsPerWord,
      adjacentPaneSyncFrozen,
      oppositeNearPrefetchOnIdle,
      directionAwareNearOrder,
      clearPageChromeGuarded,
      neighborEpochRerender,
      arrowsWaitNeighborsReady,
      scrubberWaitNeighborsReady,
      selectionFrozenWhileTurning,
      bookmarkMarkersFrozenWhileTurning,
      telemetryPointerUp,
      telemetryVisualTransitionEnd,
      telemetryProductUnlock,
      fontCacheHitSyncUsP50: Number(fontBench.p50.toFixed(3)),
      fontCacheHitSyncUsP95: Number(fontBench.p95.toFixed(3)),
      fontCacheHitSamples: fontBench.samples,
      estimatedTurnRenderHotspots,
    },
  };
}

export function writeFluidityAudit(
  snap: FluidityAuditSnapshot,
  outRel = "reports/mushaf-fluidity-audit-live.json",
): string {
  const out = resolve(majalisRoot, outRel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");
  return out;
}

export function compareFluidity(
  before: FluidityAuditSnapshot,
  after: FluidityAuditSnapshot,
): Array<{ metric: string; before: number | boolean; after: number | boolean; delta: string }> {
  const rows: Array<{
    metric: string;
    before: number | boolean;
    after: number | boolean;
    delta: string;
  }> = [];
  const keys = Object.keys(before.metrics) as Array<keyof FluidityAuditSnapshot["metrics"]>;
  for (const key of keys) {
    const b = before.metrics[key];
    const a = after.metrics[key];
    let delta = "—";
    if (typeof b === "number" && typeof a === "number") {
      const d = a - b;
      delta = `${d > 0 ? "+" : ""}${Number(d.toFixed(3))}`;
    } else if (typeof b === "boolean" && typeof a === "boolean") {
      delta = b === a ? "same" : a ? "improved" : "regressed";
    }
    rows.push({ metric: key, before: b, after: a, delta });
  }
  return rows;
}

function main() {
  const phaseArg = process.argv.includes("--before")
    ? "BEFORE"
    : process.argv.includes("--after")
      ? "AFTER"
      : "LIVE";
  const snap = runMushafFluidityAudit(phaseArg);
  const outName =
    phaseArg === "BEFORE"
      ? "reports/mushaf-fluidity-before.json"
      : phaseArg === "AFTER"
        ? "reports/mushaf-fluidity-after.json"
        : "reports/mushaf-fluidity-audit-live.json";
  const path = writeFluidityAudit(snap, outName);
  process.stdout.write(`mushaf-fluidity-audit: wrote ${path}\n`);
  process.stdout.write(`${JSON.stringify(snap.metrics, null, 2)}\n`);
  if (phaseArg === "AFTER") {
    const beforePath = resolve(majalisRoot, "reports/mushaf-fluidity-before.json");
    if (existsSync(beforePath)) {
      const before = JSON.parse(readFileSync(beforePath, "utf8")) as FluidityAuditSnapshot;
      process.stdout.write(`DELTA ${JSON.stringify(compareFluidity(before, snap))}\n`);
    }
  }
}

const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main();
}
