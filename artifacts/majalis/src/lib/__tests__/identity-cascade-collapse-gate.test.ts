/**
 * WAVE 1 — هوية cascade: لا تكرار import لكنس الشريط؛ مسار ليلي مؤجّل واحد.
 * Run: node --import tsx src/lib/__tests__/identity-cascade-collapse-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const main = readFileSync(resolve(root, "src/main.tsx"), "utf8");
const report = readFileSync(
  resolve(root, "../../docs/design/IDENTITY_CASCADE_COLLAPSE_REPORT.md"),
  "utf8",
);
const baseline = readFileSync(
  resolve(root, "../../docs/audit/SUNNAH_REPOSITORY_FINAL_CLOSURE_BASELINE.md"),
  "utf8",
);

const stripImports = main.match(/card-decorative-strip-cleanup\.css/g) || [];
assert.equal(stripImports.length, 1, "كنس الشريط الزخرفي مرة واحدة فقط في main");

/* Phase 3: interaction-states متزامن فقط — لا إعادة idle بعد طبقات الليل */
assert.match(main, /import\s+["']\.\/styles\/interaction-states\.css["']/);
const deferredInteraction = [
  ...main.matchAll(/import\(\s*["']\.\/styles\/interaction-states\.css["']\s*\)/g),
];
assert.equal(
  deferredInteraction.length,
  0,
  "Phase 3: لا import مؤجّل لـ interaction-states (متزامن يكفي)",
);
assert.match(main, /ensureDarkCoreLayers|ensureDarkLayersForBoot/);
/* WAVE7: sync only — deferred reload-to-win removed after CASCADE SEAL absorb */
assert.match(main, /import\s+["']\.\/styles\/visual-identity-unify\.css["']/);
assert.match(main, /import\s+["']\.\/styles\/dark-mode-recovery\.css["']/);
assert.doesNotMatch(
  main,
  /import\(\s*["']\.\/styles\/visual-identity-unify\.css["']\s*\)/,
  "WAVE7: no deferred unify reimport",
);
assert.doesNotMatch(
  main,
  /import\(\s*["']\.\/styles\/dark-mode-recovery\.css["']\s*\)/,
  "WAVE7: no deferred recovery reimport",
);

assert.match(report, /IMPLEMENTATION_FROZEN/);
assert.match(report, /ACTIVE_COMPATIBILITY/);
assert.match(baseline, /d5262c77/);
assert.match(baseline, /WAVE 1/);

console.log("identity-cascade-collapse-gate.test.ts: ok");
