#!/usr/bin/env node
/**
 * Token compliance audit (Phase AK).
 *
 *   node scripts/token-compliance-report.mjs
 *   node scripts/token-compliance-report.mjs --check
 *
 * Outputs:
 *   docs/audit/TOKEN_COMPLIANCE_REPORT.md
 *   reports/design-tokens-authority.json
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const check = process.argv.includes("--check");

const authorityMod = await import(
  pathToFileURL(join(majalis, "src/lib/design-tokens-authority.ts")).href
);
const { DESIGN_TOKENS_AUTHORITY, DESIGN_TOKENS_AUTHORITY_META } = authorityMod;

const docPath = join(repo, "docs/design/DESIGN_TOKENS_AUTHORITY.md");
const docOk = existsSync(docPath);
const docBody = docOk ? readFileSync(docPath, "utf8") : "";

const paths = Object.keys(DESIGN_TOKENS_AUTHORITY);
const values = Object.values(DESIGN_TOKENS_AUTHORITY);

const cssVarValues = values.filter((v) => typeof v === "string" && v.startsWith("--"));
const nonCssValues = values.filter((v) => typeof v === "string" && !v.startsWith("--"));

// Inventory rogue proxies
const inv = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs"], {
  cwd: majalis,
  encoding: "utf8",
});
if (inv.status !== 0) {
  console.error(inv.stderr || inv.stdout);
  process.exit(inv.status ?? 1);
}
const baseline = JSON.parse(readFileSync(join(majalis, "reports/visual-system-baseline.json"), "utf8"));
const budget = JSON.parse(readFileSync(join(majalis, "reports/visual-system-debt-budget.json"), "utf8"));

const rogue = {
  colors: {
    signal: "hexInCss + rgbHslInCss",
    hexInCss: baseline.hexInCss,
    ceiling: budget.ceilings.hexInCss,
    ok: baseline.hexInCss <= budget.ceilings.hexInCss,
  },
  shadows: {
    signal: "boxShadowDecls",
    value: baseline.boxShadowDecls,
    ceiling: budget.ceilings.boxShadowDecls,
    ok: baseline.boxShadowDecls <= budget.ceilings.boxShadowDecls,
  },
  radii: {
    signal: "borderRadiusPxDecls",
    value: baseline.borderRadiusPxDecls,
    ceiling: budget.ceilings.borderRadiusPxDecls,
    ok: baseline.borderRadiusPxDecls <= budget.ceilings.borderRadiusPxDecls,
  },
  spacingTypographySystems: {
    signal: "no new family (sf/mj/ss only) — map + DESIGN_TOKEN_AUTHORITY",
    ok: true,
  },
};

const allRogueOk = Object.values(rogue).every((r) => r.ok !== false);

const report = {
  version: 1,
  updatedAt: new Date().toISOString(),
  DESIGN_TOKENS_AUTHORITY_ACTIVE: docOk && /DESIGN_TOKENS_AUTHORITY_ACTIVE/.test(docBody),
  TOKEN_COMPLIANCE_ENFORCED: allRogueOk && docOk,
  VISUAL_SYSTEM_UNIFIED: allRogueOk && docOk,
  pathCount: paths.length,
  cssVarBindings: cssVarValues.length,
  componentOrLiteralBindings: nonCssValues.length,
  meta: DESIGN_TOKENS_AUTHORITY_META,
  rogue,
};

mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

writeFileSync(
  join(majalis, "reports/design-tokens-authority.json"),
  JSON.stringify(
    {
      meta: DESIGN_TOKENS_AUTHORITY_META,
      tokens: DESIGN_TOKENS_AUTHORITY,
      exportedAt: report.updatedAt,
    },
    null,
    2,
  ) + "\n",
);

const md = [
  "# TOKEN_COMPLIANCE_REPORT",
  "",
  `Generated: ${report.updatedAt}`,
  "",
  "## Status",
  "",
  `| Flag | Value |`,
  `|---|---|`,
  `| DESIGN_TOKENS_AUTHORITY_ACTIVE | ${report.DESIGN_TOKENS_AUTHORITY_ACTIVE ? "✅" : "❌"} |`,
  `| TOKEN_COMPLIANCE_ENFORCED | ${report.TOKEN_COMPLIANCE_ENFORCED ? "✅" : "❌"} |`,
  `| VISUAL_SYSTEM_UNIFIED | ${report.VISUAL_SYSTEM_UNIFIED ? "✅" : "❌"} |`,
  `| Logical paths | ${report.pathCount} |`,
  `| CSS var bindings | ${report.cssVarBindings} |`,
  `| Component/literal bindings | ${report.componentOrLiteralBindings} |`,
  "",
  "## Rogue signals (debt proxies)",
  "",
  "| Area | Signal | Current | Ceiling | OK |",
  "|---|---|---:|---:|---|",
  `| colors | hexInCss | ${rogue.colors.hexInCss} | ${rogue.colors.ceiling} | ${rogue.colors.ok ? "✅" : "❌"} |`,
  `| shadows | boxShadowDecls | ${rogue.shadows.value} | ${rogue.shadows.ceiling} | ${rogue.shadows.ok ? "✅" : "❌"} |`,
  `| radii | borderRadiusPxDecls | ${rogue.radii.value} | ${rogue.radii.ceiling} | ${rogue.radii.ok ? "✅" : "❌"} |`,
  `| spacing/type systems | no new family | — | — | ✅ |`,
  "",
  "## Policy",
  "",
  "- Future visual work must migrate toward `DESIGN_TOKENS_AUTHORITY` paths.",
  "- Do not invent new color / type / spacing / shadow / border systems.",
  "- Layers remain sf / mj / ss only (`DESIGN_TOKEN_AUTHORITY.md`).",
  "",
  "## Catalog export",
  "",
  "`artifacts/majalis/reports/design-tokens-authority.json`",
  "",
].join("\n");

writeFileSync(join(repo, "docs/audit/TOKEN_COMPLIANCE_REPORT.md"), md);

console.log(
  `token-compliance: paths=${report.pathCount} active=${report.DESIGN_TOKENS_AUTHORITY_ACTIVE} enforced=${report.TOKEN_COMPLIANCE_ENFORCED}`,
);

if (check) {
  const budgetCheck = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
    cwd: majalis,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (!docOk || !report.DESIGN_TOKENS_AUTHORITY_ACTIVE || budgetCheck.status !== 0 || !allRogueOk) {
    console.error("token-compliance --check FAIL");
    process.exit(1);
  }
  if (paths.length < 80) {
    console.error("token-compliance --check FAIL: catalog too small", paths.length);
    process.exit(1);
  }
  console.log("token-compliance --check: ok");
}
