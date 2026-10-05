/**
 * C5 — Micro friction closure.
 * node --import tsx src/lib/__tests__/micro-friction-c5-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.equal(
  existsSync(resolve(majalisRoot, "src/components/home/HomeContinueWidget.tsx")),
  false,
  "HomeContinueWidget removed",
);

const app = read("src/App.tsx");
assert.match(app, /HomeUniversalSearch/, "search affordance on home shell");
assert.match(app, /HomeHeroLcp/, "hero LCP with mushaf deep links");

const hero = read("src/components/home/HomeHeroLcp.tsx");
assert.match(hero, /href=\{`\/mushaf/, "mushaf deep link in hero");
assert.match(hero, /href="\/mushaf"/, "mushaf fallback link");

const continueLearning = read("src/components/home/HomeContinueLearning.tsx");
assert.match(continueLearning, /data-testid="home-continue-learning"/);

const backlog = readRepo("docs/audit/MICRO_FRICTION_BACKLOG.md");
assert.match(backlog, /MICRO_FRICTION_ZERO_OR_JUSTIFIED = true/);
assert.match(backlog, /KEEP_JUSTIFIED_WITH_EVIDENCE/);

const cap = read("src/lib/capacitor-utils.ts");
assert.match(cap, /isNative/, "confirm gated native");
const nativeBack = read("src/components/NativeBackButtonListener.tsx");
assert.match(nativeBack, /isAndroid/, "exit confirm android-native only");

console.log("micro-friction-c5-gate: ok");
