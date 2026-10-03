#!/usr/bin/env node
/**
 * Fast design-governance check for verify:preflight — authority maps must exist.
 * Full inventory/score: pnpm --filter @workspace/majalis run test:design-governance
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED = [
  "docs/design/ELEVATION_AUTHORITY_MAP.md",
  "docs/design/BORDER_AUTHORITY_MAP.md",
  "docs/design/COLOR_AUTHORITY_MAP.md",
  "docs/design/TYPOGRAPHY_AUTHORITY_MAP.md",
  "docs/design/SPACING_AUTHORITY_MAP.md",
  "docs/design/SIZE_AUTHORITY_MAP.md",
  "docs/design/DESIGN_GOVERNANCE_AUTOMATION.md",
  "docs/design/DESIGN_TOKENS_AUTHORITY.md",
  "docs/design/INTERACTION_AUTHORITY_MAP.md",
  "docs/design/ADMIN_UI_AUTHORITY_MAP.md",
  "docs/design/EMPTY_STATE_STANDARD.md",
  "docs/audit/USER_JOURNEY_OPTIMIZATION_PLAN.md",
  "artifacts/majalis/src/lib/elevation-authority.ts",
  "artifacts/majalis/src/lib/border-authority.ts",
  "artifacts/majalis/src/lib/design-tokens-authority.ts",
  "artifacts/majalis/scripts/design-governance-report.mjs",
  "artifacts/majalis/scripts/token-compliance-report.mjs",
  "artifacts/majalis/scripts/authority-coverage-report.mjs",
  "artifacts/majalis/scripts/design-compliance-engine.mjs",
  "docs/design/DESIGN_SYSTEM_COMPLIANCE_ENGINE.md",
  "artifacts/majalis/scripts/product-excellence-engine.mjs",
  "docs/design/PRODUCT_EXCELLENCE_PROGRAM.md",
  "artifacts/majalis/scripts/product-maturity-engine.mjs",
  "docs/design/PRODUCT_MATURITY_PROGRAM.md",
  "docs/design/CONTENT_STYLE_AUTHORITY.md",
  "docs/design/ICON_AUTHORITY_MAP.md",
];

const missing = REQUIRED.filter((rel) => !existsSync(resolve(ROOT, rel)));
if (missing.length) {
  console.error("design-governance-preflight FAIL — missing:");
  for (const m of missing) console.error(" -", m);
  process.exit(1);
}
console.log("design-governance-preflight: ok");
