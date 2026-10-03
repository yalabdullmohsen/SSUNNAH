#!/usr/bin/env node
/**
 * Design governance automation (Phase AJ).
 *
 *   node scripts/design-governance-report.mjs           # write reports
 *   node scripts/design-governance-report.mjs --check   # write + fail on missing maps / budget breach
 *
 * Outputs:
 *   docs/audit/DESIGN_AUTHORITY_REPORT.md
 *   docs/audit/DESIGN_DRIFT_REPORT.md
 *   reports/DESIGN_CONSISTENCY_SCORE.json
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const check = process.argv.includes("--check");

const AUTHORITY_MAPS = [
  ["COLOR_AUTHORITY_ONLY", "docs/design/COLOR_AUTHORITY_MAP.md"],
  ["TYPOGRAPHY_AUTHORITY_ONLY", "docs/design/TYPOGRAPHY_AUTHORITY_MAP.md"],
  ["SPACING_AUTHORITY_ONLY", "docs/design/SPACING_AUTHORITY_MAP.md"],
  ["SIZE_AUTHORITY_ONLY", "docs/design/SIZE_AUTHORITY_MAP.md"],
  ["ELEVATION_AUTHORITY_ONLY", "docs/design/ELEVATION_AUTHORITY_MAP.md"],
  ["BORDER_AUTHORITY_ONLY", "docs/design/BORDER_AUTHORITY_MAP.md"],
  ["ACCESSIBILITY_STANDARDIZED", "docs/design/ACCESSIBILITY_AUTHORITY_MAP.md"],
  ["CONTRAST_STANDARDIZED", "docs/design/CONTRAST_AUTHORITY_MAP.md"],
  ["CARD_AUTHORITY_ONLY", "docs/design/CARD_SURFACE_AUTHORITY.md"],
  ["BUTTON_AUTHORITY_ONLY", "docs/design/INTERACTION_COMPONENT_AUTHORITY.md"],
  ["FORM_AUTHORITY_ONLY", "docs/design/FORM_AUTHORITY_MAP.md"],
  ["TABLE_AUTHORITY_ONLY", "docs/design/TABLE_AUTHORITY_MAP.md"],
  ["LIST_AUTHORITY_ONLY", "docs/design/LIST_AUTHORITY_MAP.md"],
  ["TAB_AUTHORITY_ONLY", "docs/design/TAB_AUTHORITY_MAP.md"],
  ["NAVIGATION_AUTHORITY_ONLY", "docs/design/NAVIGATION_AUTHORITY_MAP.md"],
  ["MODAL_AUTHORITY_ONLY", "docs/design/MODAL_AUTHORITY_MAP.md"],
  ["FEEDBACK_AUTHORITY_ONLY", "docs/design/FEEDBACK_AUTHORITY_MAP.md"],
  ["STATUS_AUTHORITY_ONLY", "docs/design/STATUS_AUTHORITY_MAP.md"],
  ["SEARCH_AUTHORITY_ONLY", "docs/design/SEARCH_AUTHORITY_MAP.md"],
  ["FILTER_AUTHORITY_ONLY", "docs/design/FILTER_AUTHORITY_MAP.md"],
  ["RESPONSIVE_SYSTEM_UNIFIED", "docs/design/RESPONSIVE_AUTHORITY_MAP.md"],
  ["DESIGN_LANGUAGE_UNIFIED", "docs/design/DESIGN_LANGUAGE_AUTHORITY.md"],
  ["DESIGN_TOKENS_AUTHORITY_ACTIVE", "docs/design/DESIGN_TOKENS_AUTHORITY.md"],
];

function runInventory() {
  const r = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs"], {
    cwd: majalis,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.error(r.stdout || "");
    console.error(r.stderr || "");
    throw new Error("visual-system-inventory failed");
  }
}

function readJson(p, fallback = null) {
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, "utf8"));
}

runInventory();

const baseline = readJson(join(majalis, "reports/visual-system-baseline.json"), {});
const budget = readJson(join(majalis, "reports/visual-system-debt-budget.json"), { ceilings: {}, floors: {} });

const mapStatus = AUTHORITY_MAPS.map(([exit, rel]) => {
  const abs = join(repo, rel);
  const ok = existsSync(abs);
  let hasExit = false;
  if (ok) {
    const body = readFileSync(abs, "utf8");
    hasExit = body.includes(exit) || /AUTHORITY|UNIFIED|STANDARDIZED/.test(body);
  }
  return { exit, path: rel, exists: ok, hasExitSignal: hasExit };
});

const missingMaps = mapStatus.filter((m) => !m.exists);
const weakMaps = mapStatus.filter((m) => m.exists && !m.hasExitSignal);

const ceilingKeys = [
  "hexInCss",
  "boxShadowDecls",
  "borderRadiusPxDecls",
  "rgbHslInCss",
  "important",
  "rawButtonFiles",
];
const breaches = [];
for (const k of ceilingKeys) {
  const cur = baseline[k];
  const ceil = budget.ceilings?.[k];
  if (typeof cur === "number" && typeof ceil === "number" && cur > ceil) {
    breaches.push({ metric: k, current: cur, ceiling: ceil });
  }
}

const mapsScore = Math.round(((mapStatus.length - missingMaps.length) / mapStatus.length) * 100);
const debtScore =
  breaches.length === 0
    ? 100
    : Math.max(0, 100 - breaches.length * 15);
const tokenHealth =
  typeof baseline.sfTokenRefs === "number" && typeof budget.floors?.sfTokenRefs === "number"
    ? baseline.sfTokenRefs >= budget.floors.sfTokenRefs
      ? 100
      : 60
    : 80;
const consistency = Math.round(mapsScore * 0.45 + debtScore * 0.4 + tokenHealth * 0.15);

const score = {
  version: 1,
  updatedAt: new Date().toISOString(),
  consistencyScore: consistency,
  components: {
    authorityMapsPresent: mapsScore,
    debtWithinCeilings: debtScore,
    tokenFloors: tokenHealth,
  },
  metrics: {
    hexInCss: baseline.hexInCss ?? null,
    boxShadowDecls: baseline.boxShadowDecls ?? null,
    borderRadiusPxDecls: baseline.borderRadiusPxDecls ?? null,
    sfTokenRefs: baseline.sfTokenRefs ?? null,
  },
  exits: mapStatus.map((m) => m.exit),
  DESIGN_GOVERNANCE_AUTOMATED: true,
  DESIGN_DRIFT_DETECTED_AUTOMATICALLY: breaches.length > 0 || missingMaps.length > 0,
};

mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const authorityMd = [
  "# DESIGN_AUTHORITY_REPORT",
  "",
  `Generated: ${score.updatedAt}`,
  "",
  "## Authority maps",
  "",
  "| Exit | Path | Present |",
  "|---|---|---|",
  ...mapStatus.map((m) => `| \`${m.exit}\` | \`${m.path}\` | ${m.exists ? "✅" : "❌"} |`),
  "",
  "## Policy",
  "",
  "- No new color / typography / spacing / shadow / border **systems** without map + gate.",
  "- Mushaf / Prayer / Admin remain SPECIAL_CASE where documented.",
  "",
  `Exit signal: **DESIGN_GOVERNANCE_AUTOMATED**`,
  "",
].join("\n");

const driftMd = [
  "# DESIGN_DRIFT_REPORT",
  "",
  `Generated: ${score.updatedAt}`,
  "",
  "## Debt vs ceilings",
  "",
  "| Metric | Current | Ceiling | Status |",
  "|---|---:|---:|---|",
  ...ceilingKeys.map((k) => {
    const cur = baseline[k] ?? "—";
    const ceil = budget.ceilings?.[k] ?? "—";
    const bad = typeof cur === "number" && typeof ceil === "number" && cur > ceil;
    return `| ${k} | ${cur} | ${ceil} | ${bad ? "❌ BREACH" : "✅"} |`;
  }),
  "",
  "## Missing authority maps",
  "",
  missingMaps.length
    ? missingMaps.map((m) => `- ❌ ${m.exit} → \`${m.path}\``).join("\n")
    : "- none",
  "",
  "## Weak exit signals",
  "",
  weakMaps.length
    ? weakMaps.map((m) => `- ⚠️ ${m.exit} → \`${m.path}\``).join("\n")
    : "- none",
  "",
  "## Rogue signal proxies",
  "",
  "- hex / rgbHsl / boxShadowDecls / borderRadiusPx tracked by visual-system-inventory",
  "- growth beyond ceilings = drift (absorption-only reductions allowed)",
  "",
  `Drift auto-detect: **${score.DESIGN_DRIFT_DETECTED_AUTOMATICALLY ? "SIGNAL" : "CLEAR"}**`,
  "",
].join("\n");

writeFileSync(join(repo, "docs/audit/DESIGN_AUTHORITY_REPORT.md"), authorityMd);
writeFileSync(join(repo, "docs/audit/DESIGN_DRIFT_REPORT.md"), driftMd);
writeFileSync(join(majalis, "reports/DESIGN_CONSISTENCY_SCORE.json"), JSON.stringify(score, null, 2) + "\n");

console.log(`design-governance: consistency=${consistency} maps=${mapsScore} debt=${debtScore}`);
console.log("wrote DESIGN_AUTHORITY_REPORT · DESIGN_DRIFT_REPORT · DESIGN_CONSISTENCY_SCORE");

if (check) {
  const budgetCheck = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
    cwd: majalis,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (missingMaps.length || budgetCheck.status !== 0) {
    console.error("design-governance --check FAIL", {
      missingMaps: missingMaps.map((m) => m.path),
      budgetStatus: budgetCheck.status,
    });
    process.exit(1);
  }
  console.log("design-governance --check: ok");
}
