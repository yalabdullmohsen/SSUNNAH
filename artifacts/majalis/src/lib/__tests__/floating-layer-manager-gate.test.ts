/**
 * بوابة: FloatingLayerManager مالك تشغيلي واحد لإزاحات/z/suppress.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getFloatingBottomOffset,
  getFloatingZIndex,
  applyFloatingLayerCssVars,
  installFloatingLayerSync,
  isModalLayerOpen,
  shouldSuppressBackgroundFloating,
  getKeyboardInset,
} from "@/lib/floating-layer-manager";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const scroll = read("src/components/ScrollToTop.tsx");
const back = read("src/components/FloatingBackButton.tsx");
const assistant = read("src/components/assistant/AssistantFloatingWidget.tsx");
const sync = read("src/components/FloatingLayerSync.tsx");
const app = read("src/App.tsx");
const mini = read("src/components/quran/QuranMiniPlayerBar.tsx");
const bookmarkShell = read("src/features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx");
const manager = read("src/lib/floating-layer-manager.ts");

assert.match(scroll, /shouldSuppressBackgroundFloating|applyFloatingLayerCssVars/);
assert.match(back, /getFloatingBottomOffset/);
assert.match(back, /installFloatingLayerSync/);
assert.match(assistant, /installFloatingLayerSync/);
assert.match(assistant, /shouldSuppressBackgroundFloating/);
assert.match(sync, /installFloatingLayerSync/);
assert.match(app, /FloatingLayerSync/);
assert.match(mini, /applyFloatingLayerCssVars/);
assert.match(bookmarkShell, /data-mushaf-bookmark-editor/);
assert.match(bookmarkShell, /from ["']@\/components\/ui\/button["']/);
assert.match(manager, /sticky-form-actions/);
assert.match(manager, /dialog-actions/);
assert.match(manager, /sheet-actions/);
assert.match(manager, /getKeyboardInset/);
assert.match(manager, /--assistant-fab-bottom/);
assert.match(manager, /--scroll-to-top-bottom/);
assert.match(manager, /--global-back-bottom/);
assert.match(manager, /data-floating-suppress/);

assert.match(getFloatingZIndex("scroll-to-top"), /--z-fab/);
assert.match(getFloatingZIndex("mini-player"), /--z-audio-mini/);
assert.match(getFloatingZIndex("dialog-actions"), /--z-overlay-dialog|--z-/);
assert.equal(typeof getFloatingBottomOffset("floating-back"), "number");
assert.equal(typeof applyFloatingLayerCssVars, "function");
assert.equal(typeof installFloatingLayerSync, "function");
assert.equal(typeof isModalLayerOpen, "function");
assert.equal(typeof shouldSuppressBackgroundFloating, "function");
assert.equal(typeof getKeyboardInset, "function");

const policy = readFileSync(
  resolve(repoRoot, "docs/design/FLOATING_CONTROLS_POLICY.md"),
  "utf8",
);
assert.match(policy, /Floating Controls Policy/);
assert.match(policy, /FloatingLayerManager|floating-layer-manager/);

const report = readFileSync(
  resolve(repoRoot, "docs/mushaf/PR7_MUSHAF_FLOATING_UI_CLOSURE_REPORT.md"),
  "utf8",
);
assert.match(report, /PR7/);
assert.match(report, /FloatingLayerManager/);

console.log("floating-layer-manager-gate.test.ts: ok");
