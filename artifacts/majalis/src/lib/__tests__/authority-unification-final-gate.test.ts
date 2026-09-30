/**
 * Authority Unification Final Map — prevents parallel systems / reload-to-win.
 * Run: node --import tsx src/lib/__tests__/authority-unification-final-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");

function readRepo(rel: string) {
  return readFileSync(resolve(repoRoot, rel), "utf8");
}

const mapRel = "docs/design/SUNNAH_AUTHORITY_UNIFICATION_FINAL_MAP.md";
assert.ok(existsSync(resolve(repoRoot, mapRel)), `missing ${mapRel}`);
const map = readRepo(mapRel);
for (const needle of [
  "Token Authority",
  "Dark Mode Authority",
  "Interaction Authority",
  "Card Authority",
  "Form & Feedback Authority",
  "Page Authority",
  "Floating Authority",
  "ACTIVE_COMPATIBILITY",
  "reload-to-win",
  "sunnah-foundation-tokens.css",
  "FloatingLayerManager",
  "AppCard",
  "InteractiveCard",
  "Feedback V2",
]) {
  assert.match(map, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(map, /Does not claim[\s\S]{0,80}STORE GO|no STORE GO/i);

const continuation = "docs/audit/SUNNAH_FINAL_PROGRAM_CONTINUATION_STATE.md";
assert.ok(existsSync(resolve(repoRoot, continuation)), `missing ${continuation}`);
assert.match(readRepo(continuation), /COMPLETE/);
assert.match(readRepo(continuation), /74a38cac|MATCH/);

/* Official authority docs remain present */
for (const rel of [
  "docs/design/DESIGN_TOKEN_AUTHORITY.md",
  "docs/design/DARK_MODE_AUTHORITY.md",
  "docs/design/CARD_SURFACE_AUTHORITY.md",
  "docs/design/INTERACTION_COMPONENT_AUTHORITY.md",
  "docs/design/FORM_FEEDBACK_AUTHORITY.md",
  "docs/design/PAGE_CONTRACT_MATRIX.md",
  "docs/design/FLOATING_CONTROLS_POLICY.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
}

const main = readFileSync(resolve(majalisRoot, "src/main.tsx"), "utf8");
assert.match(main, /sunnah-foundation-tokens\.css/);
assert.match(main, /ssunnah-theme-api\.css/);
assert.match(main, /theme-aliases\.css/);
/* WAVE7: no deferred reload-to-win of unify/recovery after final-release */
const afterFinal = main.slice(main.indexOf("final-release.css"));
assert.doesNotMatch(
  afterFinal,
  /void import\("\.\/styles\/visual-identity-unify\.css"\)/,
  "no deferred unify reload after final-release",
);
assert.doesNotMatch(
  afterFinal,
  /void import\("\.\/styles\/dark-mode-recovery\.css"\)/,
  "no deferred recovery reload after final-release",
);
assert.match(main, /WAVE7:\s*لا إعادة استيراد unify\/recovery/);

/* Forbidden parallel system filenames must not appear as new sync SoT */
assert.doesNotMatch(main, /import\s+"\.\/styles\/(design-system-v3|button-v3|cards-v3|index-v2|final-final)\.css"/);

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8"));
assert.match(pkg.scripts["test:authority-unification-final"] || "", /authority-unification-final-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:authority-unification-final/);

const boundary = readRepo("docs/audit/SUNNAH_FINAL_INTERNAL_AND_EXTERNAL_BOUNDARY_REPORT.md");
assert.match(boundary, /AUTHORITY UNIFICATION|Authority Unification/i);
assert.match(boundary, /INTERNAL_CLOSURE_COMPLETE/);
assert.match(boundary, /WEB_RELEASED_NATIVE_HOLD/);
assert.match(boundary, /not STORE GO|no STORE GO|STORE STATUS[\s\S]{0,40}HOLD/i);

console.log("authority-unification-final-gate.test.ts: ok");
