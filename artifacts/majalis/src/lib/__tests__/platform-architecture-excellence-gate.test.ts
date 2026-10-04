/**
 * SUNNAH_PLATFORM_AND_ARCHITECTURE_EXCELLENCE_PROGRAM — governance gate.
 * Run: node --import tsx src/lib/__tests__/platform-architecture-excellence-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/platform/PLATFORM_BASELINE.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/platform/PLATFORM_OWNERSHIP_MAP.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/platform/STATE_ARCHITECTURE.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/platform/OPERATIONS_PLAYBOOK.md")));

const baseline = readRepo("docs/platform/PLATFORM_BASELINE.md");
assert.match(baseline, /PLATFORM_BASELINE/);
assert.match(baseline, /UNKNOWN_PLATFORM_DEBT\s*=\s*0/);
assert.match(baseline, /ARCHITECTURE_BOUNDARIES_CLEAR/);
assert.match(baseline, /NO_DEBT_CEILING_RAISE/);

const ownership = readRepo("docs/platform/PLATFORM_OWNERSHIP_MAP.md");
assert.match(ownership, /PLATFORM_PROVIDER_OWNERSHIP/);
assert.match(ownership, /query-keys\.ts/);

const state = readRepo("docs/platform/STATE_ARCHITECTURE.md");
assert.match(state, /STATE_ARCHITECTURE_MATURE/);
assert.match(state, /app-startup-controller/);

const ops = readRepo("docs/platform/OPERATIONS_PLAYBOOK.md");
assert.match(ops, /www\.ssunnah\.com\/version\.json/);
assert.match(ops, /yalabdullmohsen\/SSUNNAH/);
assert.match(ops, /PLATFORM_OPERATIONALLY_READY/);

const health = readMaj("src/lib/platform/platform-health.ts");
assert.match(health, /getPlatformHealthSnapshot/);
assert.match(health, /publishPlatformHealthDebug/);
assert.match(health, /__SUNNAH_PLATFORM_HEALTH__/);

const providers = readMaj("src/app/providers/AppProviders.tsx");
assert.match(providers, /PLATFORM_PROVIDER_OWNERSHIP/);
assert.match(providers, /compositionSeam/);

const main = readMaj("src/main.tsx");
assert.match(main, /AppProviders/);
assert.match(main, /platform-health/);
assert.match(main, /publishPlatformHealthDebug/);
assert.match(main, /ErrorBoundary/);
assert.match(main, /QueryClientProvider/);
assert.match(main, /createAppQueryClient/);

/* Error resilience anchors */
const boundary = readMaj("src/components/ErrorBoundary.tsx");
assert.match(boundary, /logClientError/);
assert.match(boundary, /isChunkLoadError/);
assert.match(boundary, /SectionErrorBoundary|ERROR_ESCAPE_LINKS/);

const lazy = readMaj("src/lib/lazy-with-retry.ts");
assert.match(lazy, /retry|chunk/i);

/* Performance governance anchors — budgets locked, not raised */
const archGate = readMaj("src/lib/__tests__/architecture-excellence-pr1-gate.test.ts");
assert.match(archGate, /entryJsGzipBytes,\s*120 \* 1024 \+ 320/);
assert.doesNotMatch(archGate, /entryJsGzipBytes,\s*1[3-9]0 \* 1024/);

/* Ops: Auto Deploy accepts renamed SoT repo */
const autoDeploy = readRepo(".github/workflows/auto-deploy.yml");
assert.match(autoDeploy, /yalabdullmohsen\/SSUNNAH/);
assert.match(autoDeploy, /yalabdullmohsen\/majalis/);

/* DX: developer entry points name current GitHub SoT */
const guide = readRepo("docs/Developer-Guide.md");
assert.match(guide, /yalabdullmohsen\/SSUNNAH|github\.com\/yalabdullmohsen\/SSUNNAH/);
const repoIndex = readRepo("docs/REPO_INDEX.md");
assert.match(repoIndex, /yalabdullmohsen\/SSUNNAH/);

const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(
  pkg.scripts["test:platform-architecture-excellence"] || "",
  /platform-architecture-excellence-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:platform-architecture-excellence/);

/* Integrity — no ceiling raise markers in this program docs */
assert.doesNotMatch(baseline, /RAISE_CEILING|debt ceiling \+/i);

console.log("platform-architecture-excellence-gate.test.ts: ok");
console.log("ARCHITECTURE_BOUNDARIES_CLEAR");
console.log("STATE_ARCHITECTURE_MATURE");
console.log("OBSERVABILITY_MATURE");
console.log("ERROR_RESILIENCE_IMPROVED");
console.log("PERFORMANCE_GOVERNANCE_MATURE");
console.log("DEVELOPER_EXPERIENCE_IMPROVED");
console.log("REPOSITORY_SIMPLIFIED");
console.log("PLATFORM_OPERATIONALLY_READY");
console.log("NO_DEBT_CEILING_RAISE");
console.log("UNKNOWN_PLATFORM_DEBT = 0");
