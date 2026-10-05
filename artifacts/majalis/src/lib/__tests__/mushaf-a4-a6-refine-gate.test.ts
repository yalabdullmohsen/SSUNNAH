/**
 * Track A4–A6 — أقفال المصحف + اشتراك الصفحة + overlay خارج الشاشة.
 * node --import tsx src/lib/__tests__/mushaf-a4-a6-refine-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MUSHAF_LOCK_OWNERS,
  isRemoteFontPrefetchOnly,
} from "../../features/mushaf-reader/mushaf-lock-ownership.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const locks = readPkg("src/features/mushaf-reader/mushaf-lock-ownership.ts");
const page = readPkg("src/features/mushaf-reader/MushafPage.tsx");
const verse = readPkg("src/features/mushaf-reader/MushafVerseLayer.tsx");
const reader = readPkg("src/features/mushaf-reader/NewMushafReader.tsx");
const font = readPkg("src/features/mushaf-shared/useQpcPageFont.ts");

assert.match(locks, /VISUAL_READINESS/);
assert.match(locks, /INTERACTION_LOCK/);
assert.match(locks, /SETTLE_LOCK/);
assert.match(locks, /AUDIO_STATE_LOCK/);
assert.match(locks, /prefetch خط ±2/);
assert.equal(Object.keys(MUSHAF_LOCK_OWNERS).length, 5);
assert.equal(isRemoteFontPrefetchOnly(12, 10), true);
assert.equal(isRemoteFontPrefetchOnly(11, 10), false);

/* A5 — page-level highlight subscription */
assert.match(page, /useMushafHighlightKeys\(syncHighlights\)/);
assert.match(verse, /highlightKeys:/);
assert.doesNotMatch(verse, /useMushafHighlightKeys\(/);

/* A6 — no overlay mount when selection frozen */
assert.match(page, /selectionEnabled \?/);
assert.match(page, /AyahSelectionOverlay/);

/* remote font must not gate edges / interaction */
assert.doesNotMatch(reader, /edgesDisabled[\s\S]{0,120}neighborsReady/);
assert.match(font, /enqueueFarPrefetch/);
assert.match(reader, /mushaf-lock-ownership/);

const auditDoc = readRepo("docs/audit/MUSHAF_A4_A7_STATUS_f8ba02f3a.md");
assert.match(auditDoc, /TASK_CLASSIFICATION:/);
assert.match(auditDoc, /Forbidden claims.*MUSHAF_SILKY/);
assert.doesNotMatch(auditDoc, /MUSHAF_SILKY_(?:ACHIEVED|COMPLETE|CERTIFIED)/);

console.log("mushaf-a4-a6-refine-gate: ok");
console.log("MUSHAF_A4_A6_REFINE_REPO");
