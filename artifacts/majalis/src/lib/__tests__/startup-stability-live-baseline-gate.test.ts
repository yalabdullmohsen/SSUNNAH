/**
 * Wave 0 — يثبت وجود خط أساس الدخولية الحي + جرد المتبقيات بلا UNKNOWN.
 * تشغيل: node --import tsx src/lib/__tests__/startup-stability-live-baseline-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const docs = [
  "docs/performance/STARTUP_STABILITY_LIVE_BASELINE.md",
  "docs/performance/STARTUP_FRAME_TIMELINE.md",
  "docs/performance/STARTUP_STYLESHEET_GRAPH.md",
  "docs/performance/ROUTE_STARTUP_MATRIX.md",
  "docs/performance/FONT_SCALE_STARTUP_MATRIX.md",
  "docs/performance/SUNNAH_STARTUP_STABILITY_PROGRAM.md",
];
for (const d of docs) {
  assert.ok(existsSync(resolve(repoRoot, d)), `missing ${d}`);
}

const baselinePath = resolve(
  majalisRoot,
  "reports/startup/STARTUP_STABILITY_LIVE_BASELINE.json",
);
const residualPath = resolve(
  majalisRoot,
  "reports/startup/STARTUP_RESIDUAL_INVENTORY.json",
);
assert.ok(existsSync(baselinePath), "STARTUP_STABILITY_LIVE_BASELINE.json");
assert.ok(existsSync(residualPath), "STARTUP_RESIDUAL_INVENTORY.json");

const baseline = JSON.parse(readPkg("reports/startup/STARTUP_STABILITY_LIVE_BASELINE.json")) as {
  production?: { shortCommit?: string };
  results?: Array<{
    route: string;
    fontDelta: number;
    backgroundDelta: number;
    themeChangeCount: number;
    clsTotal: number;
    sheets: number[];
  }>;
};
const residual = JSON.parse(readPkg("reports/startup/STARTUP_RESIDUAL_INVENTORY.json")) as {
  unknownStartupDebt: number;
  residuals: Array<{ id: string; class: string }>;
  closedCore: string[];
};

assert.equal(baseline.production?.shortCommit, "eb2f0bdc");
assert.ok(Array.isArray(baseline.results) && baseline.results.length >= 5);
for (const r of baseline.results!) {
  assert.equal(r.fontDelta, 0, `${r.route} fontDelta must stay 0 (R1/R2 held)`);
  assert.equal(r.themeChangeCount, 0, `${r.route} theme mutations`);
  assert.ok(r.clsTotal < 0.01, `${r.route} CLS regression`);
  assert.ok(r.sheets[0]! >= 1 && r.sheets[1]! >= r.sheets[0]!);
}

assert.equal(residual.unknownStartupDebt, 0, "UNKNOWN_STARTUP_DEBT must be 0");
assert.ok(residual.closedCore.includes("R1") && residual.closedCore.includes("R8"));
const allowed = new Set([
  "CORE_STARTUP_SHIFT",
  "DEFERRED_SOFT_PAINT",
  "EXPECTED_ROUTE_TRANSITION",
  "FONT_FALLBACK_SETTLING",
  "UPDATE_RECOVERY",
  "NATIVE_SPLASH_HANDOFF",
  "DEVICE_ONLY_UNVERIFIED",
  "EXPECTED",
  "REGRESSION",
]);
for (const item of residual.residuals) {
  assert.ok(allowed.has(item.class), `illegal class ${item.class} on ${item.id}`);
  assert.notEqual(item.class, "UNKNOWN");
}

const liveDoc = readRepo("docs/performance/STARTUP_STABILITY_LIVE_BASELINE.md");
assert.match(liveDoc, /STARTUP_STABILITY_LIVE_BASELINE/);
assert.match(liveDoc, /UNKNOWN/);
assert.doesNotMatch(liveDoc, /UNKNOWN_STARTUP_DEBT\s*=\s*[1-9]/);
assert.match(readRepo("docs/performance/STARTUP_STYLESHEET_GRAPH.md"), /Sync critical CSS imports/);
assert.match(readRepo("docs/performance/SUNNAH_STARTUP_STABILITY_PROGRAM.md"), /\|\s*S0\s*\|\s*0\s*\|/);

// Sync budget still 14 — S0 must not have grown it
const main = readPkg("src/main.tsx");
const sync = [
  ...main
    .split("function loadNonCriticalCss")[0]!
    .matchAll(/^\s*import\s+"\.\/[^"]+\.css"/gm),
];
assert.equal(sync.length, 14, "CRITICAL_CSS_BUDGET_HELD (14 sync imports)");

console.log("STARTUP_LIVE_BASELINE_CAPTURED");
console.log("UNKNOWN_STARTUP_DEBT = 0");
console.log("startup-stability-live-baseline-gate: ok");
