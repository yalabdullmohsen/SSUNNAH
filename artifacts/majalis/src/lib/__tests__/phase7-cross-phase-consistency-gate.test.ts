/**
 * Phase 7 — Cross-phase consistency (repository-only).
 * Run: node --import tsx src/lib/__tests__/phase7-cross-phase-consistency-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

console.log("=== Phase 7 docs present ===");
for (const doc of [
  "docs/release/PHASE_7_INTEGRATION_BASELINE.md",
  "docs/release/PHASE_7_BLOCKER_REGISTER.md",
  "docs/release/PHASE_7_ENVIRONMENT_CHANGESET.md",
  "docs/operations/PHASE_7_RELEASE_MONITORING_PLAN.md",
  "docs/release/RELEASE_READINESS_TRUTH.md",
  "docs/release/RELEASE_ROLLOUT_AND_ROLLBACK.md",
  "docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, doc)), doc);
}

console.log("=== Startup / chunk recovery authority ===");
assert.ok(existsSync(resolve(majalisRoot, "src/lib/chunk-recovery.ts")));
assert.ok(existsSync(resolve(majalisRoot, "src/lib/lazy-with-retry.ts")));
const chunk = read("src/lib/chunk-recovery.ts");
assert.match(chunk, /build/i);

console.log("=== Mushaf live path + persistence ===");
assert.ok(existsSync(resolve(majalisRoot, "src/lib/mushaf-persistence")));
assert.ok(existsSync(resolve(majalisRoot, "src/features/mushaf-shared")));
const routes = read("src/AppRoutes.tsx");
assert.match(routes, /\/mushaf/);
assert.match(routes, /import\.meta\.env\.DEV/);

console.log("=== Capacitor identity pins (no silent drift) ===");
const cap = JSON.parse(read("capacitor.config.json")) as {
  appId: string;
  server?: { url?: string; cleartext?: boolean };
};
assert.equal(cap.appId, "com.yousef.majlisilm");
assert.equal(cap.server?.url, "https://www.ssunnah.com");
assert.equal(cap.server?.cleartext, false);
const androidId = read("android/app/build.gradle").match(/applicationId\s+"([^"]+)"/)?.[1];
assert.equal(androidId, "com.majlisilm.app");

console.log("=== Release truth forbids STORE GO ===");
const truth = readRepo("docs/release/RELEASE_READINESS_TRUTH.md");
assert.match(truth, /STORE STATUS:\s*HOLD/);
assert.doesNotMatch(truth, /^STORE GO\s*$/m);
assert.match(truth, /DEVICE_REQUIRED/);
assert.match(truth, /BLOCKED_LICENSE/);

const register = readRepo("docs/release/PHASE_7_BLOCKER_REGISTER.md");
assert.match(register, /P7-003/);
assert.match(register, /BLOCKED_LICENSE/);
assert.match(register, /DEVICE_REQUIRED/);

console.log("=== License matrix still holds QPC ===");
const lic = readRepo("docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md");
assert.match(lic, /QPC/);
assert.match(lic, /BLOCKED_LICENSE/);

console.log("phase7-cross-phase-consistency-gate.test.ts: ok");
