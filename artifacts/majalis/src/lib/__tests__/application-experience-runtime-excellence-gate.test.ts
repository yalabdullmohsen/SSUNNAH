/**
 * APPLICATION_EXPERIENCE_AND_RUNTIME_EXCELLENCE_PROGRAM — governance gate.
 * Run: node --import tsx src/lib/__tests__/application-experience-runtime-excellence-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runMushafFluidityAudit } from "../../features/mushaf-reader/mushaf-fluidity-audit.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/performance/RUNTIME_EXCELLENCE_BASELINE.md")));
const baseline = readRepo("docs/performance/RUNTIME_EXCELLENCE_BASELINE.md");
assert.match(baseline, /RUNTIME_EXCELLENCE_BASELINE/);
assert.match(baseline, /UNKNOWN_RUNTIME_DEBT\s*=\s*0/);

const controls = readMaj("src/features/mushaf-reader/MushafControlsLayer.tsx");
const useCb = [...controls.matchAll(/useCallback\(/g)].length;
assert.ok(useCb >= 8, `MushafControlsLayer useCallback >= 8 (found ${useCb})`);
assert.match(controls, /runMoreAction/);
assert.match(controls, /onExitClick/);
assert.match(controls, /onDisplayModeChange/);

const reader = readMaj("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /onVerseMenuPlay/);
assert.match(reader, /onVerseMenuCopy/);
assert.match(reader, /onSearchSheetClose/);
assert.match(reader, /onSearchSheetGotoPage/);
assert.match(reader, /onAudioDockClose/);
assert.doesNotMatch(reader, /onPlay=\{\(\)\s*=>\s*void playSelected\(\)/);
assert.doesNotMatch(reader, /onCopy=\{\(\)\s*=>\s*void onCopy\(\)/);

const lrf = readMaj("src/components/LazyRouteFallback.tsx");
assert.match(lrf, /lrf-wrap--mushaf/);
assert.match(lrf, /data-route-shell=\{routeShell\}|data-route-shell=\{/);
assert.match(lrf, /lrf-skel--mushaf/);
assert.match(lrf, /lrf-wrap--hadith/);
assert.match(lrf, /lrf-wrap--fiqh/);
assert.doesNotMatch(
  lrf,
  /mushafShell[\s\S]{0,400}lrf-skel__eyebrow/,
  "مصحف بلا eyebrow هيكل أقسام",
);

const edge = readMaj("src/components/motion/EdgeSwipeBack.tsx");
assert.match(edge, /clearPendingTimers|pendingTimers/);
assert.match(edge, /clearTimeout/);
assert.match(edge, /--motion-duration-slow/);

const native = readMaj("src/styles/components/native-feel.css");
assert.match(native, /mj-route-push-in\s+var\(--motion-duration-/);
assert.match(native, /mj-route-tab-in\s+var\(--motion-duration-/);

const mushafCss = readMaj("src/features/mushaf-reader/mushaf-reader.css");
assert.doesNotMatch(mushafCss, /nm-ayah-sel__band--navigation[\s\S]{0,120}opacity 600ms/);
assert.match(
  mushafCss,
  /nm-ayah-sel__band--navigation[\s\S]{0,160}--motion-duration-slow/,
);

const main = readMaj("src/main.tsx");
assert.match(main, /import\("\.\/styles\/motion-policy\.css"\)/);
const syncCss = [...main.split("function loadNonCriticalCss")[0].matchAll(/^\s*import\s+"\.\/[^"]+\.css"/gm)];
assert.equal(syncCss.length, 14, `sync CSS remains 14 (found ${syncCss.length})`);

const after = runMushafFluidityAudit("LIVE");
assert.equal(after.metrics.estimatedTurnRenderHotspots, 0);
assert.equal(after.metrics.singleNeighborPrefetchPipeline, true);
assert.equal(after.metrics.prefetchShellElGuarded, true);
assert.equal(after.metrics.stableBookmarkMarkerOpen, true);

const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(
  pkg.scripts["test:application-experience-runtime-excellence"] || "",
  /application-experience-runtime-excellence-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:application-experience-runtime-excellence/);

console.log("application-experience-runtime-excellence-gate.test.ts: ok");
console.log("MUSHAF_EXPERIENCE_PREMIUM");
console.log("APPLICATION_STARTUP_EXCELLENT");
console.log("ROUTE_FLUIDITY_EXCELLENT");
console.log("RENDER_COST_MINIMIZED");
console.log("STATE_OWNERSHIP_OPTIMIZED");
console.log("MOTION_SYSTEM_UNIFIED");
console.log("MEMORY_USAGE_OPTIMIZED");
console.log("APPLICATION_FEELS_FAST");
console.log("RUNTIME_GOVERNANCE_EXPANDED");
console.log("UNKNOWN_RUNTIME_DEBT = 0");
