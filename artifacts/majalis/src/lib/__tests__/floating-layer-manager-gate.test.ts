/**
 * بوابة: FloatingLayerManager موجود ويصدّر إزاحات/z للفتحات العائمة.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getFloatingBottomOffset,
  getFloatingZIndex,
  applyFloatingLayerCssVars,
} from "@/lib/floating-layer-manager";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const scroll = readFileSync(resolve(root, "src/components/ScrollToTop.tsx"), "utf8");
assert.match(scroll, /applyFloatingLayerCssVars/);

assert.match(getFloatingZIndex("scroll-to-top"), /--z-fab/);
assert.match(getFloatingZIndex("mini-player"), /--z-audio-mini/);
assert.equal(typeof getFloatingBottomOffset("floating-back"), "number");
assert.equal(typeof applyFloatingLayerCssVars, "function");

const policy = readFileSync(
  resolve(root, "../../docs/design/FLOATING_CONTROLS_POLICY.md"),
  "utf8",
);
assert.match(policy, /Floating Controls Policy/);

console.log("floating-layer-manager-gate.test.ts: ok");
