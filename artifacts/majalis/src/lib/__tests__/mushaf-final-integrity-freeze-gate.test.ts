/**
 * MUSHAF-FINAL — Integrity freeze + WAVE6 regression smoke + coach wiring.
 * Run: node --import tsx src/lib/__tests__/mushaf-final-integrity-freeze-gate.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  clampMushafPage,
  MUSHAF_PAGE_MAX,
  MUSHAF_PAGE_MIN,
} from "../quran-last-page.ts";
import {
  resolvePageTurnPhase,
  MUSHAF_QUEUED_TURN_INTENT_MAX,
} from "../../features/mushaf-reader/mushaf-page-turn-phase.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

for (const rel of [
  "docs/mushaf/MUSHAF_FINAL_CLOSURE_LIVE_STATE.md",
  "docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md",
  "docs/mushaf/MUSHAF_CONTROL_SEMANTIC_MATRIX.md",
  "docs/mushaf/MUSHAF_COMPLETE_EXPERIENCE_BASELINE.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
}

const manifest = readRepo("docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md");
assert.match(manifest, /PROTECTED_BYTE_LOCK/);
assert.match(manifest, /604/);
assert.match(manifest, /page mapping|page-juz|pages-manifest/i);
assert.match(manifest, /BLOCKED_QURAN_INTEGRITY/);

/* Byte lock still green */
const lock = spawnSync("node", ["scripts/verify-protected-quran-byte-lock.mjs"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(lock.status, 0, lock.stderr || lock.stdout);

/* QPC font files = 604 */
const qpcDir = resolve(majalisRoot, "public/fonts/qpc-v2");
assert.ok(existsSync(qpcDir), "qpc-v2 missing");
const qpcFiles = readdirSync(qpcDir).filter((f) => f.endsWith(".woff2"));
assert.equal(qpcFiles.length, 604, `expected 604 QPC woff2, got ${qpcFiles.length}`);

/* Page JSON inventory */
const pagesDir = resolve(majalisRoot, "public/data/quran-v2/pages");
assert.ok(existsSync(pagesDir), "quran-v2/pages missing");
const pageJson = readdirSync(pagesDir).filter((f) => /^page-\d+\.json$/.test(f));
assert.ok(pageJson.length >= 604, `page JSON count ${pageJson.length}`);

/* Clamp edges */
assert.equal(clampMushafPage(0), MUSHAF_PAGE_MIN);
assert.equal(clampMushafPage(-5), MUSHAF_PAGE_MIN);
assert.equal(clampMushafPage(999), MUSHAF_PAGE_MAX);
assert.equal(clampMushafPage(1), 1);
assert.equal(clampMushafPage(604), 604);
assert.equal(MUSHAF_QUEUED_TURN_INTENT_MAX, 1);

/* Page-turn edge phases */
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 1,
    currentPage: 1,
    fontReady: false,
    layoutReady: true,
  }),
  "WAITING_FOR_FONT",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 604,
    currentPage: 603,
    fontReady: true,
    layoutReady: true,
  }),
  "COMMITTING",
);
assert.equal(
  resolvePageTurnPhase({
    productLocked: true,
    pendingPage: 2,
    currentPage: 2,
    fontReady: true,
    layoutReady: true,
    recovering: true,
  }),
  "RECOVERING",
);

/* WAVE6 contracts still live */
const font = readPkg("src/features/mushaf-shared/useQpcPageFont.ts");
assert.doesNotMatch(font, /await\s+document\.fonts\.ready/);
assert.match(font, /PREFETCH_QUEUE_CAP\s*=\s*4/);
const reader = readPkg("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /preferNext|lastTurnDeltaRef/);
assert.match(reader, /MushafReadingCoach/);
assert.match(reader, /requestIdleCallback/);
assert.doesNotMatch(reader, /ignoreSelector="[^"]*\.nm-word/);

const tele = readPkg("src/features/mushaf-reader/mushaf-turn-telemetry.ts");
assert.match(tele, /let enabled = false/);
assert.doesNotMatch(tele, /fetch\(|navigator\.sendBeacon/);

const coach = readPkg("src/features/mushaf-reader/MushafReadingCoach.tsx");
assert.match(coach, /mushaf-reading-coach-v1/);
assert.match(coach, /aria-label/);
assert.match(coach, /type="button"/);
assert.match(coach, /تخطي/);

const editor = readPkg("src/features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx");
assert.match(editor, /firstField/);
assert.match(editor, /useInputSheetViewport/);

/* Manifest tip must not invent STORE GO */
assert.doesNotMatch(readRepo("docs/mushaf/MUSHAF_FINAL_CLOSURE_LIVE_STATE.md"), /(?:^|\n)\s*Status:[^\n]*STORE GO/);

const pkg = JSON.parse(readPkg("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-final-integrity"] || "", /mushaf-final-integrity-freeze-gate/);
assert.match(pkg.scripts["test:mushaf-page-flip"] || "", /test:mushaf-final-integrity|mushaf-final-integrity/);

/* Record sha of lock for docs consistency */
const lockPath = join(majalisRoot, "public/data/quran/PROTECTED_BYTE_LOCK.json");
const lockSha = createHash("sha256").update(readFileSync(lockPath)).digest("hex").slice(0, 12);
assert.ok(lockSha.length === 12);
assert.ok(statSync(qpcDir).isDirectory());

console.log("mushaf-final-integrity-freeze-gate.test.ts: ok");
