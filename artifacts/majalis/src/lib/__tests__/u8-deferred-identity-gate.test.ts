/**
 * T-045 U8 — Deferred Identity exit gate.
 * Run: node --import tsx src/lib/__tests__/u8-deferred-identity-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/U8_DEFERRED_IDENTITY_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)), `missing ${reportPath}`);
const report = readRepo(reportPath);
assert.match(report, /DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED/);
assert.match(report, /Identity Inventory/);
assert.match(report, /Absorption Summary/);
assert.match(report, /Deferred Layers Kept/);
assert.match(report, /Removed Layers/);
assert.match(report, /First Paint Review/);
assert.match(report, /Visual Regression Review/);
assert.match(report, /Final Metrics/);
assert.match(report, /Exit Decision/);
assert.match(report, /KEEP_JUSTIFIED/);
assert.match(report, /WAVE7 CASCADE SEAL/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/U7_BACK_AUTHORITY_REPORT.md")));
assert.match(readRepo("docs/audit/U7_BACK_AUTHORITY_REPORT.md"), /BACK_AUTHORITY_ONLY/);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t045-u8-deferred-identity");
assert.ok(existsSync(resolve(evidenceDir, "summary.json")));
assert.ok(existsSync(resolve(evidenceDir, "inventory.json")));

const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
const inventory = JSON.parse(readFileSync(resolve(evidenceDir, "inventory.json"), "utf8"));

assert.equal(summary.exit, "DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED");
assert.equal(summary.exitCode, "DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED");
assert.equal(summary.reloadToWinPresent, false);
assert.deepEqual(summary.unjustifiedDeferred, []);
assert.deepEqual(summary.firstPaintMisplacedDeferred, []);
assert.equal(summary.activeCompatibilityJustified, true);

assert.equal(summary.importsAfter.mainSyncCssImports, 14);
assert.equal(summary.importsAfter.mainDeferredCssImports, 50);
assert.equal(summary.importsAfter.darkEnsureImports, 6);
assert.equal(summary.importsBefore.mainSyncCssImports, 15);
assert.equal(summary.importsBefore.mainDeferredCssImports, 49);

const main = readMaj("src/main.tsx");
const syncImports = [
  ...main
    .split("function loadNonCriticalCss")[0]
    .matchAll(/^\s*import\s+"\.\/([^"]+\.css)"/gm),
].map((m) => m[1]);
assert.equal(syncImports.length, 14, `sync count ${syncImports.length}`);

const deferredImports = [...main.matchAll(/import\("\.\/(styles\/[^"]+\.css)"\)/g)].map(
  (m) => m[1],
);
const deferredUnique = [...new Set(deferredImports)];
assert.equal(deferredUnique.length, 50, `deferred unique ${deferredUnique.length}`);

assert.match(main, /WAVE7: لا إعادة استيراد unify\/recovery بعد final-release/);
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,500}visual-identity-unify\.css/,
  "no unify reload-to-win",
);
assert.doesNotMatch(
  main,
  /final-release\.css"[\s\S]{0,500}dark-mode-recovery\.css/,
  "no recovery reload-to-win",
);

const finalRelease = readMaj("src/styles/final-release.css");
assert.match(finalRelease, /WAVE7 CASCADE SEAL/);

const ensureDark = readMaj("src/lib/ensure-dark-layers.ts");
for (const layer of [
  "dark-mode-recovery.css",
  "dark-mode-surfaces.css",
  "dark-design-system.css",
  "premium-dark-refine.css",
  "pages/luxury-night-v2.css",
  "sunnah-identity-luxury-night.css",
]) {
  assert.match(ensureDark, new RegExp(layer.replace(/\./g, "\\.")));
}

const deferredItems = inventory.items.filter(
  (it: { lane: string }) => it.lane === "deferred" || it.lane === "dark-ensure",
);
assert.equal(deferredItems.length, 50 + 6);
for (const it of deferredItems) {
  assert.equal(
    it.keep,
    "KEEP_JUSTIFIED",
    `${it.path} missing KEEP_JUSTIFIED`,
  );
  assert.ok(typeof it.reason === "string" && it.reason.length > 8, `${it.path} reason`);
}

assert.ok(inventory.identityFamilies?.["brand-v4"]?.length);
assert.ok(inventory.identityFamilies?.["final-release"]?.length);
assert.ok(inventory.identityFamilies?.["visual-redesign"]?.length);
assert.ok(inventory.identityFamilies?.m2030?.length);
assert.ok(inventory.identityFamilies?.["token-compatibility"]?.length);
assert.ok(inventory.identityFamilies?.["dark-compatibility"]?.length);
assert.ok(inventory.identityFamilies?.["deferred-identity-layers"]?.length);

assert.ok(existsSync(resolve(repoRoot, "docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md")));
assert.ok(existsSync(resolve(majalisRoot, "reports/visual-system-baseline.json")));
assert.ok(existsSync(resolve(majalisRoot, "reports/visual-system-debt-budget.json")));

console.log(
  `u8-deferred-identity-gate: ok (sync=${syncImports.length}, deferred=${deferredUnique.length}, dark=6, exit=${summary.exit})`,
);
