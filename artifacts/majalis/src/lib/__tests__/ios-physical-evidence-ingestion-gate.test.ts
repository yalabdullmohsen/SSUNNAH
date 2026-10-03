/**
 * Ensures physical certification prep docs + ingestion validator exist and
 * refuse PASS without eligible Build / physical runtime / artifact.
 * Run: node --import tsx src/lib/__tests__/ios-physical-evidence-ingestion-gate.test.ts
 */
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "../../../../../");

function fail(msg: string): never {
  console.error(`ios-physical-evidence-ingestion-gate: ${msg}`);
  process.exit(1);
}

const requiredDocs = [
  "docs/audit/physical-cert/PHYSICAL_CERTIFICATION_PROGRAM.md",
  "docs/audit/physical-cert/BUILD_TO_TEST_CONTRACT.md",
  "docs/audit/physical-cert/DEVICE_INVENTORY_CURRENT.md",
  "docs/audit/physical-cert/T040_DEVICE_MATRIX_RUNBOOK.md",
  "docs/audit/physical-cert/T033_DEEP_LINK_RUNBOOK.md",
  "docs/audit/physical-cert/AUTH_DEVICE_RUNBOOK.md",
  "docs/audit/physical-cert/WIDGET_LIVE_ACTIVITY_RUNBOOK.md",
  "docs/audit/physical-cert/MUSHAF_DEVICE_RUNBOOK.md",
  "docs/audit/physical-cert/PRAYER_PUSH_RUNBOOK.md",
  "docs/audit/physical-cert/ACCESSIBILITY_DEVICE_RUNBOOK.md",
  "docs/audit/physical-cert/PERFORMANCE_DEVICE_RUNBOOK.md",
  "docs/audit/physical-cert/EVIDENCE_REQUIREMENTS.md",
  "docs/audit/physical-cert/FUTURE_BUILD_56_CHECKLIST.md",
  "scripts/device-evidence/validate-physical-evidence-pack.mjs",
];

for (const rel of requiredDocs) {
  if (!existsSync(join(root, rel))) fail(`missing ${rel}`);
}

const program = readFileSync(join(root, requiredDocs[0]), "utf8");
if (!program.includes("DEVICE_CONNECTION_REQUIRED") && !program.includes("PHYSICAL_CERTIFICATION_PREP_READY")) {
  fail("program must declare prep/device-connection status");
}
if (/\bDEVICE_TESTED\b/.test(program) && !program.includes("Forbidden")) {
  fail("program must not claim DEVICE_TESTED");
}

const validator = join(root, "scripts/device-evidence/validate-physical-evidence-pack.mjs");

// 1) Missing pack → OK (DEVICE_REQUIRED)
{
  const r = spawnSync(process.execPath, [validator, "--pack", join(root, "docs/audit/device-evidence/__missing_pack__")], {
    encoding: "utf8",
  });
  if (r.status !== 0) fail(`missing pack should exit 0, got ${r.status}: ${r.stderr}`);
  if (!String(r.stdout).includes("NO_PHYSICAL_ROWS")) fail("missing pack should report NO_PHYSICAL_ROWS");
}

// 2) Simulator PASS must be rejected
{
  const dir = mkdtempSync(join(tmpdir(), "sunnah-phys-ev-"));
  mkdirSync(join(dir, "rows"));
  mkdirSync(join(dir, "artifacts"));
  writeFileSync(join(dir, "artifacts", "x.png"), "x");
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      packId: "tmp",
      capturedAt: "2026-10-03T00:00:00Z",
      physicalRequired: true,
      appVersion: "1.0.1",
      appBuild: "55",
      buildCommit: "deadbeef",
      installSource: "TestFlight",
      originMainSha: "deadbeef",
      productionVersionSha: "deadbeef",
      testerIds: ["t1"],
    }),
  );
  writeFileSync(
    join(dir, "rows", "bad.json"),
    JSON.stringify({
      caseId: "T040-X",
      suite: "T040",
      deviceId: "sim",
      deviceModel: "iPhone Simulator",
      osVersion: "26.0",
      appVersion: "1.0.1",
      appBuild: "55",
      installSource: "TestFlight",
      tester: "t1",
      testedAt: "2026-10-03T00:00:00Z",
      result: "PASS",
      artifactPath: "artifacts/x.png",
      expected: "ok",
      actual: "ok",
      physicalRequired: true,
      requiredBuildClass: "CAN_TEST_ON_BUILD_55",
      runtime: "simulator",
      failureNotes: "",
      reproSteps: "open",
      logRef: "",
      buildCommit: "deadbeef",
    }),
  );
  const r = spawnSync(process.execPath, [validator, "--pack", dir], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  if (r.status === 0) fail("simulator PASS must be rejected");
}

// 3) AUTH PASS on Build 55 must be rejected
{
  const dir = mkdtempSync(join(tmpdir(), "sunnah-phys-auth-"));
  mkdirSync(join(dir, "rows"));
  mkdirSync(join(dir, "artifacts"));
  writeFileSync(join(dir, "artifacts", "a.png"), "a");
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      packId: "tmp",
      capturedAt: "2026-10-03T00:00:00Z",
      physicalRequired: true,
      appVersion: "1.0.1",
      appBuild: "55",
      buildCommit: "deadbeef",
      installSource: "TestFlight",
      originMainSha: "deadbeef",
      productionVersionSha: "deadbeef",
      testerIds: ["t1"],
    }),
  );
  writeFileSync(
    join(dir, "rows", "auth.json"),
    JSON.stringify({
      caseId: "AUTH-LOGIN",
      suite: "AUTH",
      deviceId: "d1",
      deviceModel: "iPhone 17 Pro",
      osVersion: "26.5",
      appVersion: "1.0.1",
      appBuild: "55",
      installSource: "TestFlight",
      tester: "t1",
      testedAt: "2026-10-03T00:00:00Z",
      result: "PASS",
      artifactPath: "artifacts/a.png",
      expected: "login",
      actual: "login",
      physicalRequired: true,
      requiredBuildClass: "REQUIRES_FUTURE_BUILD_GE_56",
      runtime: "physical",
      failureNotes: "",
      reproSteps: "login",
      logRef: "",
      buildCommit: "deadbeef",
    }),
  );
  const r = spawnSync(process.execPath, [validator, "--pack", dir], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  if (r.status === 0) fail("AUTH PASS on Build 55 must be rejected");
}

console.log("ios-physical-evidence-ingestion-gate.test.ts: ok", {
  docs: requiredDocs.length,
  emptyPack: "NO_PHYSICAL_ROWS",
  rejects: ["simulator PASS", "AUTH PASS build<56"],
});
