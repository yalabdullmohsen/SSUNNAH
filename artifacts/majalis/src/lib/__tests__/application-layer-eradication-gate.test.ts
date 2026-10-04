/**
 * SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY
 * Locks Phase 0–1 inventory + single token authority + platform separation wiring.
 * Run: node --import tsx src/lib/__tests__/application-layer-eradication-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const existsRepo = (rel: string) => existsSync(resolve(repoRoot, rel));
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const PROGRAM = "docs/design/eradication/SUNNAH_APPLICATION_LAYER_ERADICATION_PROGRAM.md";
const BASELINE_MD = "docs/design/eradication/FULL_VISUAL_BASELINE.md";
const REPORTS = [
  "reports/eradication/FULL_VISUAL_BASELINE.json",
  "reports/eradication/FULL_STYLE_DEPENDENCY_GRAPH.json",
  "reports/eradication/CSS_LOAD_ORDER_MAP.json",
  "reports/eradication/TOKEN_ALIAS_GRAPH.json",
  "reports/eradication/COMPONENT_CONSUMER_MAP.json",
  "reports/eradication/ROUTE_TO_STYLE_MAP.json",
  "reports/eradication/WEB_IOS_SHARED_OWNERSHIP_MAP.json",
  "reports/eradication/HEX_FILE_RANKING.json",
] as const;

assert.ok(existsRepo(PROGRAM), "program charter missing");
assert.ok(existsRepo(BASELINE_MD), "baseline md missing");
assert.match(readRepo(PROGRAM), /SUNNAH_FULL_APPLICATION_LAYER_ERADICATION/);
assert.match(readRepo(PROGRAM), /--sf-\*/);
assert.match(readRepo(PROGRAM), /--ss-\*/);
assert.match(readRepo(PROGRAM), /--mj-\*/);
assert.match(readRepo(PROGRAM), /TASK_CLASSIFICATION/);
assert.match(readRepo(PROGRAM), /PLATFORM_SEPARATION/);
assert.match(readRepo(PROGRAM), /KEEP_JUSTIFIED/);
assert.doesNotMatch(readRepo(PROGRAM), /new token family allowed/i);

for (const rel of REPORTS) {
  assert.ok(existsSync(resolve(majalisRoot, rel)), `missing ${rel}`);
}

const baseline = JSON.parse(readMaj("reports/eradication/FULL_VISUAL_BASELINE.json")) as {
  id: string;
  cssFileCount: number;
  synchronousCssImports: number;
  deferredCssImports: number;
  hexCount: number;
  tokenAuthoritiesAllowed: string[];
  forbidden: string[];
  classificationCounts: Record<string, number>;
};

assert.equal(baseline.id, "FULL_VISUAL_BASELINE");
assert.ok(baseline.cssFileCount >= 300, "css inventory suspiciously small");
assert.equal(baseline.synchronousCssImports, 14, "sync CSS must remain 14 unless explicit absorption PR");
assert.ok(baseline.deferredCssImports >= 1);
assert.ok(baseline.hexCount >= 1);
assert.deepEqual(baseline.tokenAuthoritiesAllowed, ["--sf-*", "--ss-*", "--mj-*"]);
assert.ok(baseline.forbidden.includes("new token family"));
assert.ok(baseline.forbidden.includes("ceiling raise"));
assert.ok(baseline.forbidden.includes("mass delete"));
assert.ok((baseline.classificationCounts.CANONICAL_AUTHORITY || 0) >= 1);
assert.ok((baseline.classificationCounts.ABSORB_NOW || 0) >= 1);

const graph = JSON.parse(readMaj("reports/eradication/FULL_STYLE_DEPENDENCY_GRAPH.json")) as {
  id: string;
  syncLoadOrder: string[];
  layers: unknown[];
};
assert.equal(graph.id, "FULL_STYLE_DEPENDENCY_GRAPH");
assert.equal(graph.syncLoadOrder.length, 14);
assert.ok(graph.layers.length >= 300);

const ownership = JSON.parse(readMaj("reports/eradication/WEB_IOS_SHARED_OWNERSHIP_MAP.json")) as {
  WEB_PLATFORM: unknown;
  IOS_APPLICATION: { note: string };
  APP_STORE_PRODUCT: { note: string };
  SHARED_PLATFORM: { tokenAuthorities: string[] };
};
assert.ok(ownership.WEB_PLATFORM);
assert.match(ownership.IOS_APPLICATION.note, /browser proof/i);
assert.match(ownership.APP_STORE_PRODUCT.note, /store actions/i);
assert.deepEqual(ownership.SHARED_PLATFORM.tokenAuthorities, ["--sf-*", "--ss-*", "--mj-*"]);

/* Entry points inherit program */
assert.match(readRepo("docs/REPO_INDEX.md"), /APPLICATION_LAYER_ERADICATION|eradication/);
assert.match(readRepo("docs/governance/PROJECT_HEALTH.md"), /APPLICATION_LAYER_ERADICATION|eradication/);

const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["inventory:application-layer-eradication"] || "", /application-layer-eradication-inventory/);
assert.match(pkg.scripts["test:application-layer-eradication"] || "", /application-layer-eradication/);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:application-layer-eradication/);

const quality = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  protectionGates: string[];
};
assert.ok(quality.protectionGates.includes("test:application-layer-eradication"));
assert.ok(quality.protectionGates.includes("test:platform-separation"));

/* Platform separation remains permanent */
assert.ok(existsRepo("docs/governance/SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL.md"));
assert.ok(existsRepo("docs/governance/platform-separation-gate.json"));

console.log("application-layer-eradication-gate.test.ts: ok");
console.log("FULL_STYLE_DEPENDENCY_GRAPH_COMPLETE");
console.log("FULL_VISUAL_BASELINE_LOCKED");
console.log("SINGLE_TOKEN_FAMILY_CONTRACT_LOCKED");
