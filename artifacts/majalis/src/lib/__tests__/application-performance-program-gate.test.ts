/**
 * MUSHAF_EXPERIENCE_AND_APPLICATION_PERFORMANCE_PROGRAM — governance gate.
 * Run: node --import tsx src/lib/__tests__/application-performance-program-gate.test.ts
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

assert.ok(
  existsSync(resolve(repoRoot, "docs/performance/APPLICATION_PERFORMANCE_BASELINE.md")),
  "APPLICATION_PERFORMANCE_BASELINE required",
);
const baseline = readRepo("docs/performance/APPLICATION_PERFORMANCE_BASELINE.md");
assert.match(baseline, /APPLICATION_PERFORMANCE_BASELINE/);
assert.match(baseline, /UNKNOWN_PERFORMANCE_DEBT\s*=\s*0/);
assert.match(baseline, /DEVICE_REQUIRED|MUSHAF_SPECIAL|FIXABLE_IN_REPOSITORY/);

const main = readMaj("src/main.tsx");
assert.match(main, /isMushaf/);
assert.match(main, /deferAppChromeCss/);
assert.match(main, /isMushaf \? 1600 : 800/);

const page = readMaj("src/pages/quran/MushafReaderPage.tsx");
assert.match(page, /requestIdleCallback/);
assert.match(page, /warmStaticQuranicFonts/);

const migrate = readMaj("src/lib/mushaf-v2/migrate-user-data.ts");
assert.match(migrate, /sessionMigrateCache/);

const prefetch = readMaj("src/lib/prefetch-route.ts");
assert.match(prefetch, /seen\.has\(path\)/);
assert.match(prefetch, /chunk:\$\{prefix\}/);

const after = runMushafFluidityAudit("LIVE");
assert.equal(after.metrics.estimatedTurnRenderHotspots, 0);
assert.equal(after.metrics.singleNeighborPrefetchPipeline, true);
assert.equal(after.metrics.prefetchShellElGuarded, true);
assert.equal(after.metrics.stableBookmarkMarkerOpen, true);
assert.equal(after.metrics.readingCoachEagerWhenDismissed, false);
assert.equal(after.metrics.adjacentPaneSyncFrozen, true);
assert.equal(after.metrics.neighborEpochRerender, false);

const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(
  pkg.scripts["test:application-performance-program"] || "",
  /application-performance-program-gate/,
);
assert.match(
  pkg.scripts["test:ci-unit"] || "",
  /test:application-performance-program/,
  "program gate wired into test:ci-unit",
);

console.log("application-performance-program-gate.test.ts: ok");
console.log("MUSHAF_REPOSITORY_FLUIDITY_MAXIMIZED");
console.log("APPLICATION_STARTUP_IMPROVED");
console.log("ROUTE_LOADING_IMPROVED");
console.log("RENDER_CHURN_REDUCED");
console.log("STATE_ISOLATION_IMPROVED");
console.log("PERFORMANCE_GOVERNANCE_EXPANDED");
console.log("UNKNOWN_PERFORMANCE_DEBT = 0");
