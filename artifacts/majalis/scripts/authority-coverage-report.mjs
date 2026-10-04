#!/usr/bin/env node
/**
 * Component authority coverage (Phase AM).
 *
 *   node scripts/authority-coverage-report.mjs
 *   node scripts/authority-coverage-report.mjs --check
 *
 * Outputs:
 *   docs/audit/AUTHORITY_COVERAGE_REPORT.md
 *   reports/authority-coverage.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const srcRoot = join(majalis, "src");
const check = process.argv.includes("--check");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const FAMILIES = [
  {
    id: "cards",
    authority: /\b(AppCard|InteractiveCard|StatusCard|SoftCard)\b/,
    bypass: /\bclassName=\{?["'`][^"'`]*\b(card|ss-card|mj-card)\b/i,
    importHint: /AppCard|InteractiveCard|StatusCard/,
  },
  {
    id: "buttons",
    authority: /from\s+["']@\/components\/ui\/button["']|\b(ActionButton|PrimaryButton|SecondaryButton|IconButton)\b/,
    bypass: /<button\b/,
    importHint: /ui\/button|ActionButton|PrimaryButton|IconButton/,
  },
  {
    id: "forms",
    authority: /\b(FormLabel|FieldError|FormActions|SearchInput|FormField)\b/,
    bypass: /<(input|textarea|select)\b(?![^>]*type=["']hidden["'])/i,
    importHint: /FormLabel|SearchInput|FormFields/,
  },
  {
    id: "tables",
    authority: /\b(DataTable|AdminDataTable|ss-data-table)\b/,
    bypass: /<table\b/,
    importHint: /DataTable|ss-data-table/,
  },
  {
    id: "lists",
    authority: /\b(NavigationList|SettingsList|ListSystem|SimpleList|ResultList)\b/,
    bypass: /role=["']list["']|<ul\b[^>]*className=\{?["'`][^"'`]*(?:list|settings-row)/i,
    importHint: /NavigationList|ListSystem|SettingsList|SimpleList|ResultList/,
  },
  {
    id: "tabs",
    authority: /\b(ContentTabs|TabSystem|TabsList|TabsTrigger)\b/,
    bypass: /role=["']tablist["']|data-tab-/,
    importHint: /ContentTabs|TabSystem|@\/components\/ui\/tabs/,
  },
  {
    id: "navigation",
    authority: /\b(AppBackButton|BottomNav|AppSidebar|NavLink)\b/,
    bypass: /floating-back|ScrollToTop|href=["']#["'][^>]*onClick/i,
    importHint: /AppBackButton|BottomNav|AppSidebar/,
  },
  {
    id: "modals",
    authority: /\b(ConfirmDialog|AdminConfirmDialog|Dialog|DialogContent|AlertDialog)\b/,
    bypass: /window\.(confirm|alert)\s*\(/,
    importHint: /ConfirmDialog|Dialog|AlertDialog/,
  },
];

const SKIP_DIR = /\/(components\/ui\/|components\/design-system\/|admin-v3\/ui\/|lib\/__tests__\/)/;

const files = walk(srcRoot);
const perFamily = {};

for (const fam of FAMILIES) {
  const using = [];
  const bypassing = [];
  for (const abs of files) {
    const rel = relative(srcRoot, abs).replace(/\\/g, "/");
    if (SKIP_DIR.test("/" + rel) || rel.includes("__tests__")) continue;
    // Mushaf/prayer special case — still counted but tagged
    const text = readFileSync(abs, "utf8");
    const hasAuth = fam.authority.test(text);
    const hasBypass = fam.bypass.test(text);
    if (hasAuth) using.push(rel);
    if (hasBypass && !hasAuth) bypassing.push(rel);
  }
  const relevant = using.length + bypassing.length;
  const adoption = relevant === 0 ? 100 : Math.round((using.length / relevant) * 100);
  perFamily[fam.id] = {
    usingCount: using.length,
    bypassCount: bypassing.length,
    relevantCount: relevant,
    adoptionPercent: adoption,
    usingSample: using.slice(0, 12),
    bypassSample: bypassing.slice(0, 12),
    migrationPriority: bypassing
      .filter((f) => !/mushaf|prayer-times|admin-v3\/domains/i.test(f))
      .slice(0, 20),
  };
}

const adoptionValues = Object.values(perFamily).map((f) => f.adoptionPercent);
const AUTHORITY_ADOPTION_PERCENTAGE = Math.round(
  adoptionValues.reduce((a, b) => a + b, 0) / adoptionValues.length,
);

const topDivergence = Object.entries(perFamily)
  .map(([id, f]) => ({
    family: id,
    bypassCount: f.bypassCount,
    adoptionPercent: f.adoptionPercent,
  }))
  .sort((a, b) => b.bypassCount - a.bypassCount || a.adoptionPercent - b.adoptionPercent);

const easiestWins = topDivergence
  .filter((t) => t.bypassCount > 0 && t.bypassCount <= 25)
  .slice(0, 5)
  .map((t) => ({
    family: t.family,
    reason: `امتصاص ${t.bypassCount} ملفًا يتجاوز السلطة — عائد سريع على adoption`,
    bypassCount: t.bypassCount,
  }));

const updatedAt = new Date().toISOString();
const report = {
  version: 1,
  updatedAt,
  AUTHORITY_ADOPTION_PERCENTAGE,
  families: perFamily,
  topDivergenceSources: topDivergence.slice(0, 8),
  easiestWins,
  policy: "migrate-when-touched · SPECIAL_CASE mushaf/prayer/admin wrappers OK if composing authority",
};

mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });
writeFileSync(join(majalis, "reports/authority-coverage.json"), JSON.stringify(report, null, 2) + "\n");

const md = [
  "# AUTHORITY_COVERAGE_REPORT",
  "",
  `Generated: ${updatedAt}`,
  "",
  `## AUTHORITY_ADOPTION_PERCENTAGE: **${AUTHORITY_ADOPTION_PERCENTAGE}%**`,
  "",
  "| Family | Using authority | Bypassing | Relevant | Adoption % |",
  "|---|---:|---:|---:|---:|",
  ...FAMILIES.map((fam) => {
    const f = perFamily[fam.id];
    return `| ${fam.id} | ${f.usingCount} | ${f.bypassCount} | ${f.relevantCount} | ${f.adoptionPercent} |`;
  }),
  "",
  "## Top divergence sources",
  "",
  ...topDivergence.slice(0, 6).map(
    (t) => `- **${t.family}**: bypass=${t.bypassCount} · adoption=${t.adoptionPercent}%`,
  ),
  "",
  "## Migration priority (non-SPECIAL samples)",
  "",
  ...FAMILIES.flatMap((fam) => {
    const pri = perFamily[fam.id].migrationPriority;
    if (!pri.length) return [];
    return [`### ${fam.id}`, ...pri.slice(0, 8).map((p) => `- \`${p}\``), ""];
  }),
  "## Policy",
  "",
  "- Future visual work must prefer authority components.",
  "- Mushaf / Prayer / Admin SPECIAL_CASE wrappers OK when they compose authority.",
  "- No UNIFIED_100 claim from this report alone.",
  "",
].join("\n");

writeFileSync(join(repo, "docs/audit/AUTHORITY_COVERAGE_REPORT.md"), md);

console.log(
  `authority-coverage: adoption=${AUTHORITY_ADOPTION_PERCENTAGE}% families=${FAMILIES.length}`,
);

if (check) {
  if (!existsSync(join(repo, "docs/design/INTERACTION_AUTHORITY_MAP.md"))) {
    console.error("authority-coverage --check FAIL: missing INTERACTION_AUTHORITY_MAP");
    process.exit(1);
  }
  if (AUTHORITY_ADOPTION_PERCENTAGE < 1) {
    console.error("authority-coverage --check FAIL: adoption too low");
    process.exit(1);
  }
  console.log("authority-coverage --check: ok");
}
