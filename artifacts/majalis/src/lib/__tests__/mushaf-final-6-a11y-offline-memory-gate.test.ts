/**
 * MUSHAF-FINAL-6 — a11y live page · offline/recovery contracts · timer cleanup.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /mushaf-page-live/);
assert.match(reader, /aria-live="polite"/);
assert.match(reader, /toArabicDigits\(page\)/);
assert.match(reader, /toArabicDigits\(MUSHAF_PAGE_MAX\)/);
assert.match(reader, /pageTurnSafetyTimerRef/);
assert.match(reader, /clearTimeout\(pageTurnSafetyTimerRef/);
assert.match(reader, /MushafReadingCoach/);

const coach = read("src/features/mushaf-reader/MushafReadingCoach.tsx");
assert.match(coach, /type="button"/);
assert.match(coach, /aria-label/);
assert.match(coach, /Escape/);

const search = read("src/features/mushaf-madinah/MushafSearchSheet.tsx");
assert.match(search, /navigator\.onLine === false/);

const tele = read("src/features/mushaf-reader/mushaf-turn-telemetry.ts");
assert.match(tele, /let enabled = false/);
assert.doesNotMatch(tele, /fetch\(|sendBeacon/);

const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-final-6-a11y"] || "", /mushaf-final-6-a11y-offline-memory/);

console.log("mushaf-final-6-a11y-offline-memory-gate.test.ts: ok");
