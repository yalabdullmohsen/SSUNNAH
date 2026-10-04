/**
 * SUNNAH_CONTINUOUS_GOVERNANCE_AND_REGRESSION_PREVENTION_PROGRAM
 * Freezes QUALITY_BASELINE_V1 — no ceiling raises, no missing protection wiring.
 * Run: node --import tsx src/lib/__tests__/continuous-governance-regression-gate.test.ts
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
const existsRepo = (rel: string) => existsSync(resolve(repoRoot, rel));

assert.ok(existsRepo("docs/governance/QUALITY_BASELINE_V1.json"));
assert.ok(existsRepo("docs/governance/QUALITY_BASELINE_V1.md"));
assert.ok(existsRepo("docs/governance/PROJECT_HEALTH.md"));
assert.ok(existsRepo("docs/governance/CONTINUOUS_GOVERNANCE_REPORT.md"));

const baseline = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  id: string;
  policy: string;
  unknownGovernanceDebt: number;
  design: {
    localHeroClassCeiling: number;
    visualDebtPolicy: string;
    visualCeilings: Record<string, number>;
  };
  interaction: {
    interactionDebtPolicy: string;
    interactionCeilings: Record<string, number>;
  };
  performance: {
    entryJsGzipBytesMax: number;
    iconsJsGzipBytesMax: number;
    mainCssGzipBytesMax: number;
    syncCriticalCssImports: number;
  };
  mushaf: {
    estimatedTurnRenderHotspotsMax: number;
    singleNeighborPrefetchPipeline: boolean;
    prefetchShellElGuarded: boolean;
    stableBookmarkMarkerOpen: boolean;
  };
  routes: {
    feedbackAuthority: string[];
    productCompletenessGate: string;
    routeQualityMatrixStaleUnsetMax: number;
  };
  protectionGates: string[];
  success: string[];
};

assert.equal(baseline.id, "QUALITY_BASELINE_V1");
assert.equal(baseline.policy, "no-ceiling-raise");
assert.equal(baseline.unknownGovernanceDebt, 0);
assert.match(readRepo("docs/governance/QUALITY_BASELINE_V1.md"), /UNKNOWN_GOVERNANCE_DEBT\s*=\s*0/);
assert.match(readRepo("docs/governance/PROJECT_HEALTH.md"), /PROJECT_HEALTH_VISIBLE/);

/* —— Design / interaction debt: live budgets must not exceed frozen ceilings —— */
const visual = JSON.parse(readMaj("reports/visual-system-debt-budget.json")) as {
  policy: string;
  ceilings: Record<string, number>;
};
const interaction = JSON.parse(readMaj("reports/interaction-system-debt-budget.json")) as {
  policy: string;
  ceilings: Record<string, number>;
};
assert.equal(visual.policy, "decreasing-ceilings");
assert.equal(interaction.policy, "decreasing-ceilings");
assert.equal(visual.policy, baseline.design.visualDebtPolicy);
assert.equal(interaction.policy, baseline.interaction.interactionDebtPolicy);

for (const [key, max] of Object.entries(baseline.design.visualCeilings)) {
  const live = visual.ceilings[key];
  assert.equal(typeof live, "number", `visual ceiling missing: ${key}`);
  assert.ok(live <= max, `visual ${key} ceiling raised: ${live} > ${max}`);
}
for (const [key, max] of Object.entries(baseline.interaction.interactionCeilings)) {
  const live = interaction.ceilings[key];
  assert.equal(typeof live, "number", `interaction ceiling missing: ${key}`);
  assert.ok(live <= max, `interaction ${key} ceiling raised: ${live} > ${max}`);
}

/* —— Hero ceiling (design regression) —— */
const componentGate = readMaj("src/lib/__tests__/global-component-authority-gate.test.ts");
assert.match(componentGate, /LOCAL_HERO_CLASS_CEILING\s*=\s*95/);
assert.equal(baseline.design.localHeroClassCeiling, 95);

/* —— Performance freeze —— */
const archGate = readMaj("src/lib/__tests__/architecture-excellence-pr1-gate.test.ts");
assert.match(archGate, /entryJsGzipBytes,\s*120 \* 1024 \+ 320/);
assert.equal(baseline.performance.entryJsGzipBytesMax, 120 * 1024 + 320);
assert.equal(baseline.performance.iconsJsGzipBytesMax, 30 * 1024);
assert.equal(baseline.performance.mainCssGzipBytesMax, 100 * 1024);

const main = readMaj("src/main.tsx");
const syncCss = [
  ...main.split("function loadNonCriticalCss")[0].matchAll(/^\s*import\s+"\.\/[^"]+\.css"/gm),
];
assert.equal(
  syncCss.length,
  baseline.performance.syncCriticalCssImports,
  `sync critical CSS drifted from ${baseline.performance.syncCriticalCssImports}`,
);

/* —— Mushaf freeze —— */
const mushaf = runMushafFluidityAudit("LIVE");
assert.equal(
  mushaf.metrics.estimatedTurnRenderHotspots,
  baseline.mushaf.estimatedTurnRenderHotspotsMax,
);
assert.equal(mushaf.metrics.singleNeighborPrefetchPipeline, baseline.mushaf.singleNeighborPrefetchPipeline);
assert.equal(mushaf.metrics.prefetchShellElGuarded, baseline.mushaf.prefetchShellElGuarded);
assert.equal(mushaf.metrics.stableBookmarkMarkerOpen, baseline.mushaf.stableBookmarkMarkerOpen);

/* —— Route feedback freeze —— */
for (const name of baseline.routes.feedbackAuthority) {
  assert.ok(
    existsSync(resolve(majalisRoot, `src/components/design-system/${name}.tsx`)),
    `Feedback V2 missing: ${name}`,
  );
}
assert.ok(existsRepo("docs/product/PRODUCT_COMPLETENESS_BASELINE.md"));
assert.ok(existsRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json")) as {
  routes: Array<Record<string, string>>;
};
let unsetStale = 0;
for (const row of matrix.routes) {
  if (row.stale == null || row.stale === "" || row.stale === "PENDING" || row.stale === "UNSET") {
    unsetStale += 1;
  }
}
assert.equal(unsetStale, baseline.routes.routeQualityMatrixStaleUnsetMax);

/* —— Protection gates wired —— */
const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(
  pkg.scripts["test:continuous-governance-regression"] || "",
  /continuous-governance-regression-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:continuous-governance-regression/);

for (const gate of baseline.protectionGates) {
  assert.ok(pkg.scripts[gate], `protection gate script missing: ${gate}`);
  assert.match(
    pkg.scripts["test:ci-unit"] || "",
    new RegExp(gate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `${gate} must remain in test:ci-unit`,
  );
}

assert.ok(baseline.success.includes("DESIGN_REGRESSION_PREVENTED"));
assert.ok(baseline.success.includes("PROJECT_HEALTH_VISIBLE"));
assert.match(readRepo("docs/REPO_INDEX.md"), /docs\/governance|QUALITY_BASELINE_V1/);

console.log("continuous-governance-regression-gate.test.ts: ok");
console.log("DESIGN_REGRESSION_PREVENTED");
console.log("PERFORMANCE_REGRESSION_PREVENTED");
console.log("MUSHAF_REGRESSION_PREVENTED");
console.log("ROUTE_REGRESSION_PREVENTED");
console.log("DEBT_GROWTH_PREVENTED");
console.log("PROJECT_HEALTH_VISIBLE");
console.log("UNKNOWN_GOVERNANCE_DEBT = 0");
