/**
 * بوابة: تقرير الإغلاق الجذري موجود ويعلن WEB_RELEASED_NATIVE_HOLD بلا STORE GO.
 * Run: node --import tsx src/lib/__tests__/final-remediation-report-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const read = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/SUNNAH_FINAL_REMEDIATION_REPORT.md";
const livePath = "docs/audit/FINAL_REMEDIATION_LIVE_STATE.md";
const matrixPath = "docs/audit/ROUTE_QUALITY_MATRIX.json";
const tokenMatrix = "docs/design/TOKEN_MIGRATION_MATRIX.md";
const pageMatrix = "docs/design/PAGE_CONTRACT_MATRIX.md";
const deviceReg = "docs/audit/DEVICE_QA_REGISTER.md";
const phase3 = "docs/audit/PHASE3_STARTUP_FLICKER_STATUS.md";

for (const p of [reportPath, livePath, matrixPath, tokenMatrix, pageMatrix, deviceReg, phase3]) {
  assert.ok(existsSync(resolve(repoRoot, p)), `missing ${p}`);
}

const report = read(reportPath);
assert.match(report, /WEB_RELEASED_NATIVE_HOLD/);
assert.match(report, /## STATUS/);
assert.match(report, /\*\*PARTIAL\*\*/);
assert.doesNotMatch(report, /STORE GO\*\*|decision.*STORE GO|Declared.*STORE GO/i);
assert.match(report, /STORE \| \*\*HOLD\*\*|Store \| \*\*HOLD\*\*|Store\*\* \| \*\*HOLD/);
assert.match(report, /FIXABLE_IN_REPOSITORY/);
assert.match(report, /DEVICE_REQUIRED/);
assert.match(report, /OWNER_ACTION|BLOCKED_LICENSE/);

const live = read(livePath);
assert.match(live, /WEB_RELEASED_NATIVE_HOLD/);
assert.match(live, /ff77a662|MATCH/);

const routes = JSON.parse(read(matrixPath));
assert.ok(routes.totalRoutes >= 300, "route matrix too small");
assert.ok(Array.isArray(routes.routes) && routes.routes.length === routes.totalRoutes);

assert.match(read(tokenMatrix), /No new token family|--sf-\*/);
assert.match(read(deviceReg), /DEVICE_REQUIRED/);
assert.match(read(phase3), /ChunkRecoveryToast/);

const surface = read("artifacts/majalis/src/lib/route-surface.ts");
assert.match(surface, /commitRouteSurface/);
assert.match(read("artifacts/majalis/src/lib/password-policy.ts"), /PASSWORD_MIN_LENGTH = 12/);

console.log("final-remediation-report-gate.test.ts: ok");
