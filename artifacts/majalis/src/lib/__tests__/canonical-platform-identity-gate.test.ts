/**
 * PERMANENT — SUNNAH_CANONICAL_PLATFORM_IDENTITY
 * Must never be removed from ci-unit. Contract is non-overridable.
 * Run: node --import tsx src/lib/__tests__/canonical-platform-identity-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const existsRepo = (rel: string) => existsSync(resolve(repoRoot, rel));

const DOC = "docs/governance/SUNNAH_CANONICAL_PLATFORM_IDENTITY.md";
const JSON_REL = "docs/governance/canonical-platform-identity.json";

assert.ok(existsRepo(DOC), `${DOC} must exist permanently`);
assert.ok(existsRepo(JSON_REL), `${JSON_REL} must exist permanently`);

const doc = readRepo(DOC);
assert.match(doc, /PERMANENT_PROJECT_CONTRACT/);
assert.match(doc, /SUNNAH IS NOT A WEBSITE/);
assert.match(doc, /SUNNAH IS NOT A MOBILE APP/);
assert.match(doc, /SUNNAH IS NOT A STORE LISTING/);
assert.match(doc, /WEB PLATFORM/);
assert.match(doc, /IOS APPLICATION/);
assert.match(doc, /APP STORE PRODUCT/);
assert.match(doc, /WEB IMPACT/);
assert.match(doc, /IOS IMPACT/);
assert.match(doc, /APP STORE IMPACT/);
assert.match(doc, /WEB PERFORMANCE/);
assert.match(doc, /IOS PERFORMANCE/);
assert.match(doc, /APP STORE USER EXPERIENCE/);
assert.match(doc, /WEB_ONLY/);
assert.match(doc, /IOS_ONLY/);
assert.match(doc, /SHARED_PLATFORM/);
assert.match(doc, /APP_STORE_ONLY/);
assert.match(doc, /CANONICAL_PLATFORM_IDENTITY_LOCKED/);
assert.match(doc, /must never be removed/i);

const identity = JSON.parse(readRepo(JSON_REL)) as {
  id: string;
  status: string;
  removable: boolean;
  overridable: boolean;
  products: string[];
  mandatoryReportSections: string[];
  performanceAxes: string[];
  architectureClasses: string[];
  enforcementGate: string;
};

assert.equal(identity.id, "SUNNAH_CANONICAL_PLATFORM_IDENTITY");
assert.equal(identity.status, "PERMANENT_PROJECT_CONTRACT");
assert.equal(identity.removable, false);
assert.equal(identity.overridable, false);
assert.deepEqual(identity.products, ["WEB", "IOS", "APP_STORE"]);
assert.ok(identity.mandatoryReportSections.includes("WEB IMPACT"));
assert.ok(identity.mandatoryReportSections.includes("IOS IMPACT"));
assert.ok(identity.mandatoryReportSections.includes("APP STORE IMPACT"));
assert.ok(identity.performanceAxes.includes("WEB PERFORMANCE"));
assert.ok(identity.performanceAxes.includes("IOS PERFORMANCE"));
assert.ok(identity.performanceAxes.includes("APP STORE USER EXPERIENCE"));
for (const c of ["WEB_ONLY", "IOS_ONLY", "SHARED_PLATFORM", "APP_STORE_ONLY"] as const) {
  assert.ok(identity.architectureClasses.includes(c), `missing class ${c}`);
}
assert.equal(identity.enforcementGate, "test:canonical-platform-identity");

/* Entry points must inherit the contract */
assert.match(readRepo("AGENTS.md"), /SUNNAH_CANONICAL_PLATFORM_IDENTITY|CANONICAL_PLATFORM_IDENTITY/);
assert.match(readRepo("docs/REPO_INDEX.md"), /SUNNAH_CANONICAL_PLATFORM_IDENTITY|canonical-platform-identity/);
assert.match(readRepo("docs/governance/PROJECT_HEALTH.md"), /WEB|IOS|APP_STORE/);
assert.match(
  readRepo("docs/project-knowledge/20_AI_AGENT_MEMORY.md"),
  /SUNNAH_CANONICAL_PLATFORM_IDENTITY|WEB.*IOS.*APP_STORE|ثلاث منتجات/,
);

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
assert.match(
  pkg.scripts["test:canonical-platform-identity"] || "",
  /canonical-platform-identity-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:canonical-platform-identity/);

/* Continuous governance baseline must keep this gate in the protection set */
const baseline = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  protectionGates: string[];
};
assert.ok(
  baseline.protectionGates.includes("test:canonical-platform-identity"),
  "QUALITY_BASELINE_V1 must list test:canonical-platform-identity",
);

console.log("canonical-platform-identity-gate.test.ts: ok");
console.log("CANONICAL_PLATFORM_IDENTITY_LOCKED");
console.log("WEB_IOS_APP_STORE_SEPARATED");
console.log("PERMANENT_PROJECT_CONTRACT");
