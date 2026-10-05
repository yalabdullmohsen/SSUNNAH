/**
 * PHASE 2 — MajlisAmiriFallback / MajlisFallback size-adjust calibrated to Amiri.
 * Keeps critical + fonts-ui + index.html in sync at 97% (measured best).
 *
 * Run: pnpm --filter @workspace/majalis run test:startup-typography-fouc-p2
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const SCOPE = "docs/performance/STARTUP_TYPOGRAPHY_FOUC_PHASE2_SCOPE.md";
const METRICS = "reports/ui-fallback-metrics.json";
const TARGET = 97;

console.log("=== Phase 2 scope + freeze ===");
assert.ok(existsSync(resolve(repoRoot, SCOPE)), SCOPE);
const scope = readRepo(SCOPE);
assert.match(scope, /IMPLEMENTATION_FROZEN/);
assert.match(scope, /Phase 2|PHASE 2|P2|size-adjust/);

console.log("=== measurement evidence prefers 97% over 105% ===");
assert.ok(existsSync(resolve(root, METRICS)), METRICS);
const metrics = JSON.parse(read(METRICS)) as {
  bestSizeAdjustPercent: number;
  bestSumAbsWidthDelta: number;
  baseline105: number;
};
assert.equal(metrics.bestSizeAdjustPercent, TARGET);
assert.ok(
  metrics.bestSumAbsWidthDelta < metrics.baseline105,
  `expected Δ97 < Δ105 (${metrics.bestSumAbsWidthDelta} < ${metrics.baseline105})`,
);

console.log("=== fonts-ui + critical-first-paint use 97% ===");
const fontsUi = read("src/styles/fonts-ui.css");
/* STARTUP_SMOOTHNESS: لا إعادة تعريف للبدائل في CSS المتأخر — المصدر index.html */
assert.doesNotMatch(fontsUi, /font-family:\s*"Majlis(Amiri)?Fallback"/);
assert.doesNotMatch(fontsUi, /size-adjust:\s*105%/);

const critical = read("src/styles/critical-first-paint.css");
assert.doesNotMatch(critical, /font-family:\s*"MajlisAmiriFallback"/);
assert.doesNotMatch(critical, /size-adjust:\s*105%/);

console.log("=== index.html critical MajlisAmiriFallback matches 97% ===");
const html = read("index.html");
assert.match(html, /MajlisAmiriFallback[^}]*size-adjust:97%/);
assert.doesNotMatch(html, /MajlisAmiriFallback[^}]*size-adjust:105%/);

console.log("=== P1 authority still held (no absolute 16px on html) ===");
const CANON = /font-size:\s*calc\(\s*100%\s*\*\s*var\(--ui-font-scale,\s*1\)\s*\)/;
assert.match(read("src/index.css"), CANON);
assert.doesNotMatch(read("src/index.css"), /html\s*\{[^}]*font-size:\s*16px\s*;/s);
assert.match(read("src/styles/design-system.css"), CANON);

console.log("startup-typography-fouc-p2-gate: ok");
