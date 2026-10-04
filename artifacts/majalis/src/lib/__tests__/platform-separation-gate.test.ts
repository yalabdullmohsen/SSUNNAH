/**
 * PLATFORM_SEPARATION_GATE — PERMANENT
 * SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL
 * Run: node --import tsx src/lib/__tests__/platform-separation-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const existsRepo = (rel: string) => existsSync(resolve(repoRoot, rel));

const ENFORCEMENT = "docs/governance/SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL.md";
const CLASSIFICATION = "docs/governance/SUNNAH_PLATFORM_CLASSIFICATION_PROTOCOL.md";
const IDENTITY = "docs/governance/SUNNAH_CANONICAL_PLATFORM_IDENTITY.md";
const GATE_JSON = "docs/governance/platform-separation-gate.json";
const IDENTITY_JSON = "docs/governance/canonical-platform-identity.json";

for (const rel of [ENFORCEMENT, CLASSIFICATION, IDENTITY, GATE_JSON, IDENTITY_JSON]) {
  assert.ok(existsRepo(rel), `PLATFORM_CLASSIFICATION_MISSING/contract absent: ${rel}`);
}

const enforcement = readRepo(ENFORCEMENT);
assert.match(enforcement, /SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL/);
assert.match(enforcement, /PERMANENT/);
assert.match(enforcement, /PLATFORM_SEPARATION_GATE/);
assert.match(enforcement, /INVALID TASK RULE/);
assert.match(enforcement, /INVALID REPORT RULE/);
assert.match(enforcement, /IMPLEMENTATION BLOCKER/);
assert.match(enforcement, /FALSE SUCCESS PREVENTION/);
assert.match(enforcement, /TASK_CLASSIFICATION/);
assert.match(enforcement, /RISK_SCOPE/);
assert.match(enforcement, /PLATFORM_CLASSIFICATION_MISSING/);
assert.match(enforcement, /PLATFORM_IMPACT_MISSING/);
assert.match(enforcement, /PLATFORM_MIXING_DETECTED/);
assert.match(enforcement, /WEB_ONLY_ASSUMED_AS_IOS/);
assert.match(enforcement, /IOS_ONLY_ASSUMED_AS_WEB/);
assert.match(enforcement, /IOS_ONLY_ASSUMED_AS_APP_STORE/);
assert.match(enforcement, /APP_STORE_ONLY_ASSUMED_AS_PRODUCT_QUALITY/);
assert.match(enforcement, /MISSING_PLATFORM_SEPARATION/);
assert.match(enforcement, /WEB_ARCHITECTURE_IMPACT/);
assert.match(enforcement, /IOS_ARCHITECTURE_IMPACT/);
assert.match(enforcement, /APP_STORE_ARCHITECTURE_IMPACT/);
assert.match(enforcement, /PLATFORM_ENFORCEMENT_PROTOCOL_LOCKED/);
assert.match(enforcement, /PLATFORM_SEPARATION_GATE_ACTIVE/);

const gate = JSON.parse(readRepo(GATE_JSON)) as {
  id: string;
  status: string;
  removable: boolean;
  script: string;
  mandatoryReportHeader: string[];
  riskScopeAxes: string[];
  requiredImpactSections: string[];
  architectureReviewSections: string[];
  failCodes: string[];
  prohibitedUnseparatedConclusions: string[];
};

assert.equal(gate.id, "PLATFORM_SEPARATION_GATE");
assert.equal(gate.status, "PERMANENT");
assert.equal(gate.removable, false);
assert.equal(gate.script, "test:platform-separation");
assert.deepEqual(gate.mandatoryReportHeader, ["TASK_CLASSIFICATION", "RISK_SCOPE"]);
assert.deepEqual(gate.riskScopeAxes, ["WEB", "IOS", "APP_STORE"]);
assert.deepEqual(gate.requiredImpactSections, ["WEB IMPACT", "IOS IMPACT", "APP STORE IMPACT"]);
assert.ok(gate.architectureReviewSections.includes("WEB_ARCHITECTURE_IMPACT"));
assert.ok(gate.architectureReviewSections.includes("IOS_ARCHITECTURE_IMPACT"));
assert.ok(gate.architectureReviewSections.includes("APP_STORE_ARCHITECTURE_IMPACT"));

const requiredFails = [
  "PLATFORM_CLASSIFICATION_MISSING",
  "PLATFORM_IMPACT_MISSING",
  "PLATFORM_MIXING_DETECTED",
  "WEB_ONLY_ASSUMED_AS_IOS",
  "IOS_ONLY_ASSUMED_AS_WEB",
  "IOS_ONLY_ASSUMED_AS_APP_STORE",
  "APP_STORE_ONLY_ASSUMED_AS_PRODUCT_QUALITY",
  "MISSING_PLATFORM_SEPARATION",
] as const;
for (const code of requiredFails) {
  assert.ok(gate.failCodes.includes(code), `fail code missing: ${code}`);
}
assert.ok(gate.prohibitedUnseparatedConclusions.includes("application improved"));
assert.ok(gate.prohibitedUnseparatedConclusions.includes("performance improved"));

const identityJson = JSON.parse(readRepo(IDENTITY_JSON)) as {
  enforcementProtocol?: { id: string; gate: string; status: string };
  taskClassificationProtocol?: { classes: string[] };
};
assert.ok(identityJson.enforcementProtocol, "identity JSON must reference enforcementProtocol");
assert.equal(identityJson.enforcementProtocol!.id, "SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL");
assert.equal(identityJson.enforcementProtocol!.gate, "PLATFORM_SEPARATION_GATE");
assert.equal(identityJson.enforcementProtocol!.status, "PERMANENT");

/* Entry points must inherit enforcement */
assert.match(readRepo("AGENTS.md"), /PLATFORM_ENFORCEMENT|PLATFORM_SEPARATION_GATE|ENFORCEMENT_PROTOCOL/);
assert.match(readRepo("AGENTS.md"), /RISK_SCOPE/);
assert.match(readRepo("docs/REPO_INDEX.md"), /PLATFORM_ENFORCEMENT|platform-separation|ENFORCEMENT_PROTOCOL/);
assert.match(readRepo("docs/governance/PROJECT_HEALTH.md"), /PLATFORM_SEPARATION_GATE|ENFORCEMENT/);
assert.match(readRepo(".cursor/rules/majlisilm-general.mdc"), /RISK_SCOPE|PLATFORM_SEPARATION|ENFORCEMENT/);
assert.match(
  readRepo("docs/project-knowledge/20_AI_AGENT_MEMORY.md"),
  /ENFORCEMENT_PROTOCOL|PLATFORM_SEPARATION_GATE|RISK_SCOPE/,
);

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
assert.match(pkg.scripts["test:platform-separation"] || "", /platform-separation-gate/);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:platform-separation/);

const baseline = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  protectionGates: string[];
};
assert.ok(
  baseline.protectionGates.includes("test:platform-separation"),
  "QUALITY_BASELINE_V1 must list test:platform-separation",
);
assert.ok(
  baseline.protectionGates.includes("test:canonical-platform-identity"),
  "identity gate must remain in protection set",
);

/* False-success / mixing markers must remain documented as failures */
assert.match(enforcement, /iOS improved/);
assert.match(enforcement, /App Store ready/);
assert.match(enforcement, /browser evidence/);
assert.match(enforcement, /successful builds/);

console.log("platform-separation-gate.test.ts: ok");
console.log("PLATFORM_SEPARATION_GATE_ACTIVE");
console.log("PLATFORM_ENFORCEMENT_PROTOCOL_LOCKED");
console.log("PLATFORM_MIXING_FORBIDDEN");
