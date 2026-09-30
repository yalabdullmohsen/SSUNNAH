/**
 * MUSHAF-FINAL-4 — render isolation + search keyboard + selection invalidate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const verse = read("src/features/mushaf-reader/MushafVerseLayer.tsx");
assert.doesNotMatch(verse, /currentTime|playbackRate|buffered/);
assert.doesNotMatch(verse, /MediaBridge/);

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /function MediaBridge/);
assert.match(reader, /MushafSearchSheet/);

const overlay = read("src/features/mushaf-reader/AyahSelectionOverlay.tsx");
assert.match(overlay, /orientationchange/);
assert.match(overlay, /resize/);
assert.match(overlay, /selectionMeasure/);

const search = read("src/features/mushaf-madinah/MushafSearchSheet.tsx");
assert.match(search, /inputRef\.current\?\.focus/);
assert.match(search, /cancelled/);
assert.match(search, /isCurrent\(seq\)/);
assert.match(search, /navigator\.onLine === false/);
assert.match(search, /أنت دون اتصال/);

const css = read("src/features/mushaf-madinah/mushaf-madinah.css");
assert.match(css, /\.mm-search-sheet__field input[\s\S]{0,220}font-size:\s*16px/);

const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-final-4-render"] || "", /mushaf-final-4-render-audio-search/);

console.log("mushaf-final-4-render-audio-search-gate.test.ts: ok");
