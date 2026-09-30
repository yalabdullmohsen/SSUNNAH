/**
 * MUSHAF-FINAL-3 — page-turn edge contracts + pointercancel recovery.
 * Run: node --import tsx src/lib/__tests__/mushaf-final-3-page-turn-edges-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { clampMushafPage, MUSHAF_PAGE_MIN } from "../quran-last-page.ts";
import {
  resolvePageTurnPhase,
  MUSHAF_QUEUED_TURN_INTENT_MAX,
} from "../../features/mushaf-reader/mushaf-page-turn-phase.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

assert.equal(clampMushafPage(Number.NaN), MUSHAF_PAGE_MIN);
assert.equal(clampMushafPage(0), 1);
assert.equal(clampMushafPage(605), 604);
assert.equal(MUSHAF_QUEUED_TURN_INTENT_MAX, 1);

assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 1,
    currentPage: 1,
    fontReady: true,
    layoutReady: false,
  }),
  "WAITING_FOR_LAYOUT",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: false,
    pendingPage: null,
    currentPage: 604,
    fontReady: true,
    layoutReady: true,
    visualSettling: true,
  }),
  "SETTLING",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 2,
    currentPage: 2,
    fontReady: true,
    layoutReady: true,
    dragging: true,
  }),
  "DRAGGING",
);

const pager = read("src/features/mushaf-reader/useMushafPager.ts");
assert.match(pager, /onPointerCancel/);
assert.match(pager, /onNavigateCancel\?\.\(\)/);
assert.match(pager, /setPointerCapture/);
assert.match(pager, /transitionend/);
assert.match(pager, /MUSHAF_PAGE_MAX/);

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /pageTurnSafetyTimerRef/);
assert.match(reader, /clearTimeout\(pageTurnSafetyTimerRef/);
assert.match(reader, /RECOVERING/);
assert.match(reader, /queuedPageRef/);
assert.match(reader, /WAITING_FOR_FONT/);
/* route/unmount cleanup of safety timer */
assert.match(reader, /pageTurnSafetyTimerRef\.current = null/);

const font = read("src/features/mushaf-shared/useQpcPageFont.ts");
assert.match(font, /pageNumber < 1 \|\| pageNumber > 604/);
assert.match(font, /inflight/);
assert.match(font, /farPrefetchGeneration/);

const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-final-3-edges"] || "", /mushaf-final-3-page-turn-edges/);

console.log("mushaf-final-3-page-turn-edges-gate.test.ts: ok");
