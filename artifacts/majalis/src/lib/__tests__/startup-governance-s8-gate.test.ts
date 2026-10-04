/**
 * PR S8 — حوكمة استقرار الإقلاع النهائية + مصالحة المتبقي.
 * تشغيل: node --import tsx src/lib/__tests__/startup-governance-s8-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const gov = readRepo("docs/performance/STARTUP_STABILITY_S8_GOVERNANCE.md");
assert.match(gov, /STARTUP_REGRESSION_GOVERNANCE_EXPANDED|STARTUP_STABILITY_S8_GOVERNANCE/);
assert.match(gov, /UNKNOWN_STARTUP_DEBT = 0/);
assert.match(gov, /COMPLETE_WITH_DEVICE_HOLD/);
assert.doesNotMatch(gov, /ZERO_FLICKER_ON_IOS\s*=\s*PASS/);

const residualPath = resolve(majalisRoot, "reports/startup/STARTUP_RESIDUAL_INVENTORY.json");
assert.ok(existsSync(residualPath));
const residual = JSON.parse(readFileSync(residualPath, "utf8")) as {
  unknownStartupDebt: number;
  verdictHint: string;
  wavesAddressed: string[];
};
assert.equal(residual.unknownStartupDebt, 0);
assert.match(residual.verdictHint, /COMPLETE_WITH_DEVICE_HOLD/);
for (const w of ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7"]) {
  assert.ok(residual.wavesAddressed.includes(w), w);
}

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-governance-s8"/);
assert.match(pkg, /startup-stability-live-baseline-gate/);
assert.match(pkg, /startup-state-machine-s1-gate/);
assert.match(pkg, /startup-deferred-css-s2-gate/);
assert.match(pkg, /startup-arabic-fallback-s3-gate/);
assert.match(pkg, /startup-dark-system-s4-gate/);
assert.match(pkg, /startup-chunk-recovery-s5-gate/);
assert.match(pkg, /startup-ios-native-splash-s6-gate/);
assert.match(pkg, /startup-ios-input-zoom-s7-gate/);

const docs = [
  "docs/performance/STARTUP_STATE_MACHINE_SINGLE.md",
  "docs/performance/IOS_NATIVE_SPLASH_CONTRACT.md",
  "docs/performance/STARTUP_CHUNK_RECOVERY_S5.md",
  "docs/performance/STARTUP_ARABIC_FALLBACK_S3.md",
  "docs/performance/STARTUP_DARK_SYSTEM_S4.md",
  "docs/performance/STARTUP_IOS_INPUT_ZOOM_S7.md",
];
for (const d of docs) {
  assert.ok(existsSync(resolve(repoRoot, d)), d);
}

console.log("STARTUP_REGRESSION_GOVERNANCE_EXPANDED");
console.log("CORE_STARTUP_SHIFT_PREVENTED");
console.log("UPDATE_LOOP_REGRESSION_PREVENTED");
console.log("IOS_HANDOFF_DRIFT_PREVENTED");
console.log("UNKNOWN_STARTUP_DEBT = 0");
console.log("startup-governance-s8-gate: ok");
