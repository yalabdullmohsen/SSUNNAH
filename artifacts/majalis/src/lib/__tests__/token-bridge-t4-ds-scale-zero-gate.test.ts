/**
 * T4 — remove zero-var() --ds-* scale/motion/type aliases (not quality-campaign).
 * node --import tsx src/lib/__tests__/token-bridge-t4-ds-scale-zero-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const removed = [
  "--ds-borderDefault",
  "--ds-borderStrongWidth",
  "--ds-borderSubtle",
  "--ds-durationEmphasized",
  "--ds-durationInstant",
  "--ds-durationNormal",
  "--ds-ease-out",
  "--ds-ease-spring",
  "--ds-easingAccelerate",
  "--ds-easingDecelerate",
  "--ds-easingEmphasized",
  "--ds-easingStandard",
  "--ds-elevationNone",
  "--ds-elevationOverlay",
  "--ds-errorContainer",
  "--ds-focus",
  "--ds-iconLarge",
  "--ds-iconMedium",
  "--ds-iconSmall",
  "--ds-lh-body",
  "--ds-primaryPressed",
  "--ds-r-xs",
  "--ds-radiusCircle",
  "--ds-radiusPill",
  "--ds-radiusSmall",
  "--ds-shadow-xl",
  "--ds-space-0-5",
  "--ds-space-lg",
  "--ds-space-none",
  "--ds-space-xl",
  "--ds-space-xs",
  "--ds-space-xxs",
  "--ds-surfaceInteractive",
  "--ds-surfaceSelected",
  "--ds-t-mid",
  "--ds-type-badge",
  "--ds-type-bodyLarge",
  "--ds-type-buttonLabel",
  "--ds-type-cardTitle",
  "--ds-type-display",
  "--ds-type-explanation",
  "--ds-type-label",
  "--ds-type-numeric",
  "--ds-type-screenTitle",
  "--ds-type-scripture",
  "--ds-type-subsectionTitle",
  "--ds-warningContainer",
] as const;

assert.equal(removed.length, 47);

/* Governance keep-compat — not in removed set */
assert.match(
  read("src/styles/ssunnah-ds-canonical.css"),
  /--ds-durationFast:\s*var\(--motion-fast/,
  "--ds-durationFast keep-compat → --motion-fast",
);

const cssBundle = [
  "src/styles/ssunnah-ds-canonical.css",
  "src/styles/design-system.css",
  "src/styles/index-deferred-pages.css",
  "src/styles/design-tokens.css",
]
  .map(read)
  .join("\n");

for (const tok of removed) {
  assert.doesNotMatch(
    cssBundle,
    new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`),
    `${tok} removed`,
  );
}

/* Quality-campaign contract held */
const dt = read("src/styles/design-tokens.css");
for (const tok of [
  "--ds-background",
  "--ds-surface",
  "--ds-surfaceElevated",
  "--ds-textPrimary",
  "--ds-textSecondary",
  "--ds-accent",
  "--ds-border",
  "--ds-muted",
  "--ds-danger",
  "--ds-success",
]) {
  assert.match(dt, new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`), `${tok} QC held`);
}

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.hexInCss <= 5550, `hexInCss ≤5550 (got ${budget.ceilings.hexInCss})`);
assert.equal(budget.policy, "decreasing-ceilings");

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const qc = spawnSync(process.execPath, ["scripts/test-quality-campaign-gate.mjs"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(qc.status, 0, qc.stderr || qc.stdout);

console.log("token-bridge-t4-ds-scale-zero-gate: ok");
console.log("ALIASES_RETIRED_47");
console.log("DURATION_FAST_KEEP_COMPAT");
console.log("QUALITY_CAMPAIGN_CONTRACT_HELD");
