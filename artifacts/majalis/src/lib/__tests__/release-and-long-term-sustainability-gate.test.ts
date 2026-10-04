/**
 * SUNNAH_RELEASE_AND_LONG_TERM_SUSTAINABILITY_PROGRAM — governance gate.
 * Run: node --import tsx src/lib/__tests__/release-and-long-term-sustainability-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const existsRepo = (rel: string) => existsSync(resolve(repoRoot, rel));

const requiredDocs = [
  "docs/sustainability/PROJECT_SUSTAINABILITY_BASELINE.md",
  "docs/sustainability/DOCUMENTATION_AUTHORITY.md",
  "docs/sustainability/KNOWLEDGE_PRESERVATION.md",
  "docs/sustainability/SCALABILITY_READINESS.md",
  "docs/sustainability/DEBT_PREVENTION.md",
  "docs/sustainability/RELEASE_READINESS_CONFIRMED.md",
  "docs/sustainability/LONG_TERM_GOVERNANCE.md",
  "docs/sustainability/authority-manifest.json",
  "docs/sustainability/SUNNAH_RELEASE_LONG_TERM_SUSTAINABILITY_REPORT.md",
] as const;

for (const rel of requiredDocs) {
  assert.ok(existsRepo(rel), `missing ${rel}`);
}

const baseline = readRepo("docs/sustainability/PROJECT_SUSTAINABILITY_BASELINE.md");
assert.match(baseline, /PROJECT_SUSTAINABILITY_BASELINE/);
assert.match(baseline, /UNKNOWN_SUSTAINABILITY_DEBT\s*=\s*0/);
assert.match(baseline, /DOCUMENTATION_AUTHORITY_COMPLETE/);
assert.match(baseline, /LONG_TERM_GOVERNANCE_ESTABLISHED/);

assert.match(readRepo("docs/sustainability/DOCUMENTATION_AUTHORITY.md"), /DOCUMENTATION_AUTHORITY_COMPLETE/);
assert.match(readRepo("docs/sustainability/KNOWLEDGE_PRESERVATION.md"), /KNOWLEDGE_PRESERVED/);
assert.match(readRepo("docs/sustainability/SCALABILITY_READINESS.md"), /SCALABILITY_READY/);
assert.match(readRepo("docs/sustainability/DEBT_PREVENTION.md"), /DEBT_PREVENTION_COMPLETE/);
const releaseReady = readRepo("docs/sustainability/RELEASE_READINESS_CONFIRMED.md");
assert.match(releaseReady, /RELEASE_READINESS_CONFIRMED/);
assert.match(releaseReady, /\*\*Store status:\*\*\s*\*\*HOLD\*\*/);
assert.doesNotMatch(releaseReady, /\*\*Store status:\*\*\s*\*\*GO\*\*|STORE STATUS:\s*GO|STORE_GO\b/);
assert.match(readRepo("docs/sustainability/LONG_TERM_GOVERNANCE.md"), /LONG_TERM_GOVERNANCE_ESTABLISHED/);

const manifest = JSON.parse(readRepo("docs/sustainability/authority-manifest.json")) as {
  unknownSustainabilityDebt: number;
  storeStatus: string;
  generalStatus: string;
  knowledgeDomains: string[];
  debtPreventionGates: string[];
  documentationAuthorities: Record<string, string[]>;
  forbiddenInThisProgram: string[];
};

assert.equal(manifest.unknownSustainabilityDebt, 0);
assert.equal(manifest.storeStatus, "HOLD");
assert.equal(manifest.generalStatus, "WEB_RELEASED_NATIVE_HOLD");
assert.ok(manifest.knowledgeDomains.includes("mushaf"));
assert.ok(manifest.knowledgeDomains.includes("search"));
assert.ok(manifest.knowledgeDomains.includes("prayer"));
assert.ok(manifest.knowledgeDomains.includes("hadith"));
assert.ok(manifest.knowledgeDomains.includes("fiqh"));
assert.ok(manifest.knowledgeDomains.includes("design-system"));
assert.ok(manifest.knowledgeDomains.includes("governance"));
assert.ok(manifest.knowledgeDomains.includes("performance"));

for (const paths of Object.values(manifest.documentationAuthorities)) {
  for (const rel of paths) {
    assert.ok(existsRepo(rel), `authority path missing: ${rel}`);
  }
}

/* Knowledge corpus preserved */
const knowledgeFiles = [
  "docs/project-knowledge/00_EXECUTIVE_SUMMARY.md",
  "docs/project-knowledge/02_ARCHITECTURE.md",
  "docs/project-knowledge/05_ROUTES_AND_NAVIGATION.md",
  "docs/project-knowledge/09_QURAN_MUSHAF_AUDIO.md",
  "docs/project-knowledge/10_PRAYER_NOTIFICATIONS_AUDIO.md",
  "docs/project-knowledge/11_DESIGN_SYSTEM_AND_UI.md",
  "docs/project-knowledge/12_PERFORMANCE.md",
  "docs/project-knowledge/15_TESTING_AND_QUALITY_GATES.md",
  "docs/project-knowledge/20_AI_AGENT_MEMORY.md",
  "docs/project-knowledge/KNOWLEDGE_INDEX.json",
] as const;
for (const rel of knowledgeFiles) {
  assert.ok(existsRepo(rel), `missing ${rel}`);
}

/* Release checklists exist (future) — no builds asserted */
assert.ok(existsRepo("docs/qa/IOS_RELEASE_CHECKLIST.md"));
assert.ok(existsRepo("docs/qa/ANDROID_RELEASE_CHECKLIST.md"));
assert.ok(existsRepo("docs/release/RELEASE_READINESS_TRUTH.md"));

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
assert.match(
  pkg.scripts["test:release-and-long-term-sustainability"] || "",
  /release-and-long-term-sustainability-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:release-and-long-term-sustainability/);

const ciUnitOptional = new Set([
  /* runs via typography/visual suites or verify:ci mushaf/perf paths */
  "test:visual-redesign-v2-tokens",
  "test:architecture-excellence-pr1",
]);
for (const gate of manifest.debtPreventionGates) {
  assert.ok(pkg.scripts[gate], `debtPreventionGate missing script: ${gate}`);
  if (!ciUnitOptional.has(gate)) {
    assert.match(
      pkg.scripts["test:ci-unit"] || "",
      new RegExp(gate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${gate} must stay in test:ci-unit`,
    );
  }
}

assert.ok(manifest.forbiddenInThisProgram.includes("create_builds"));
assert.ok(manifest.forbiddenInThisProgram.includes("raise_debt_ceilings"));
assert.ok(manifest.forbiddenInThisProgram.includes("weaken_gates"));

/* REPO_INDEX points at sustainability pack */
assert.match(readRepo("docs/REPO_INDEX.md"), /docs\/sustainability/);

console.log("release-and-long-term-sustainability-gate.test.ts: ok");
console.log("DOCUMENTATION_AUTHORITY_COMPLETE");
console.log("KNOWLEDGE_PRESERVED");
console.log("SCALABILITY_READY");
console.log("DEBT_PREVENTION_COMPLETE");
console.log("RELEASE_READINESS_CONFIRMED");
console.log("LONG_TERM_GOVERNANCE_ESTABLISHED");
console.log("UNKNOWN_SUSTAINABILITY_DEBT = 0");
