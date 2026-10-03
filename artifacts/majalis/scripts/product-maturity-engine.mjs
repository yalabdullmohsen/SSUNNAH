#!/usr/bin/env node
/**
 * Product Maturity Engine (Phase BA–BE).
 *
 *   node scripts/product-maturity-engine.mjs
 *   node scripts/product-maturity-engine.mjs --check
 *
 * Outputs:
 *   PRODUCT_MATURITY_SCORECARD
 *   DESIGN_DRIFT_ATLAS
 *   MICRO_FRICTION_BACKLOG
 *   CONTENT_STYLE_AUTHORITY (doc + scan)
 *   ICON_AUTHORITY signals (doc owned; scan sizes)
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const srcRoot = join(majalis, "src");
const check = process.argv.includes("--check");

function walk(dir, pred, out = []) {
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
    if (st.isDirectory()) walk(p, pred, out);
    else if (pred(name, p)) out.push(p);
  }
  return out;
}

function readJson(p, fallback = null) {
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, "utf8"));
}

function levelFromScore(score) {
  if (score >= 90) return "EXCELLENT";
  if (score >= 75) return "MATURE";
  if (score >= 55) return "ADVANCED";
  return "FOUNDATION";
}

// Refresh upstream engines lightly
for (const script of ["scripts/authority-coverage-report.mjs", "scripts/visual-system-inventory.mjs"]) {
  const r = spawnSync(process.execPath, [script], { cwd: majalis, encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
}

const coverage = readJson(join(majalis, "reports/authority-coverage.json"), {});
const baseline = readJson(join(majalis, "reports/visual-system-baseline.json"), {});
const budget = readJson(join(majalis, "reports/visual-system-debt-budget.json"), { ceilings: {} });
const consistency = readJson(join(majalis, "reports/DESIGN_CONSISTENCY_SCORE.json"), {});
const compliance = readJson(join(majalis, "reports/design-compliance-engine.json"), {});
const excellence = readJson(join(majalis, "reports/product-excellence-engine.json"), {});

const updatedAt = new Date().toISOString();
const tsxFiles = walk(srcRoot, (n) => n.endsWith(".tsx"));

const authorityMapsOk = [
  "COLOR_AUTHORITY_MAP.md",
  "TYPOGRAPHY_AUTHORITY_MAP.md",
  "SPACING_AUTHORITY_MAP.md",
  "DESIGN_TOKENS_AUTHORITY.md",
  "INTERACTION_AUTHORITY_MAP.md",
  "ACCESSIBILITY_AUTHORITY_MAP.md",
].every((f) => existsSync(join(repo, "docs/design", f)));

const debtOk = ["hexInCss", "boxShadowDecls", "borderRadiusPxDecls"].every((k) => {
  const cur = baseline[k];
  const ceil = budget.ceilings?.[k];
  return typeof cur !== "number" || typeof ceil !== "number" || cur <= ceil;
});

// ── Maturity categories ──
const categories = [
  {
    name: "Design",
    score: Math.round(
      ((consistency.consistencyScore || 0) * 0.5 + (compliance.DESIGN_COMPLIANCE_SCORE || 0) * 0.5),
    ),
  },
  {
    name: "UX",
    score: Math.round(
      ((excellence.PRODUCT_COHESION_SCORE || 0) * 0.6 +
        (100 - Math.min(40, (excellence.JOURNEY_LENGTH_REPORT?.journeys || []).filter((j) => j.currentClicks > j.shortestValid).length * 10)) *
          0.4),
    ),
  },
  {
    name: "Performance",
    score: debtOk && (baseline.important || 0) <= (budget.ceilings?.important || Infinity) ? 72 : 55,
    note: "Proxy via CSS debt ceilings — DEVICE_REQUIRED for LHCI/startup",
  },
  {
    name: "Consistency",
    score: Math.round(
      ((coverage.AUTHORITY_ADOPTION_PERCENTAGE || 0) * 0.55 + (consistency.consistencyScore || 0) * 0.45),
    ),
  },
  {
    name: "Maintainability",
    score: Math.round(
      (authorityMapsOk ? 80 : 40) * 0.4 +
        (compliance.PRODUCT_SURFACE_MAP?.unclassified === 0 ? 85 : 50) * 0.3 +
        (existsSync(join(majalis, "scripts/design-compliance-engine.mjs")) ? 90 : 40) * 0.3,
    ),
  },
  {
    name: "Accessibility",
    score: existsSync(join(repo, "docs/design/ACCESSIBILITY_AUTHORITY_MAP.md"))
      ? existsSync(join(repo, "docs/design/CONTRAST_AUTHORITY_MAP.md"))
        ? 78
        : 65
      : 40,
  },
  {
    name: "Architecture",
    score: Math.round(
      (existsSync(join(repo, "docs/design/DESIGN_TOKENS_AUTHORITY.md")) ? 85 : 40) * 0.35 +
        ((coverage.AUTHORITY_ADOPTION_PERCENTAGE || 0) + 40) * 0.35 +
        (debtOk ? 80 : 50) * 0.3,
    ),
  },
];

for (const c of categories) {
  c.level = levelFromScore(c.score);
}

const overallScore = Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length);
const overallLevel = levelFromScore(overallScore);

const PRODUCT_MATURITY_SCORECARD = {
  version: 1,
  updatedAt,
  overallScore,
  overallLevel,
  categories,
  PRODUCT_MATURITY_AUDIT: true,
  nonClaims: ["NOT UNIFIED_100", "NOT EXCELLENT claim", "DEVICE_REQUIRED for perf wall-clock"],
};

// ── DESIGN_DRIFT_ATLAS ──
const FAMILY_AUTHORITY = {
  colors: "COLOR_AUTHORITY_MAP / DESIGN_TOKENS_AUTHORITY color.*",
  spacing: "SPACING_AUTHORITY_MAP / spacing.*",
  typography: "TYPOGRAPHY_AUTHORITY_MAP / typography.*",
  cards: "CARD_SURFACE_AUTHORITY · AppCard",
  buttons: "INTERACTION_COMPONENT_AUTHORITY · Button",
  forms: "FORM_AUTHORITY_MAP · FormLabel/FieldError",
  tables: "TABLE_AUTHORITY_MAP · DataTable",
  lists: "LIST_AUTHORITY_MAP · NavigationList",
  tabs: "TAB_AUTHORITY_MAP · ContentTabs",
  navigation: "NAVIGATION_AUTHORITY_MAP · AppBackButton/BottomNav",
  dialogs: "MODAL_AUTHORITY_MAP · ConfirmDialog",
};

const atlasEntries = [];

for (const [fam, data] of Object.entries(coverage.families || {})) {
  if (!data.bypassCount) continue;
  atlasEntries.push({
    domain: fam,
    location: (data.bypassSample || []).slice(0, 5),
    signal: `bypass=${data.bypassCount} adoption=${data.adoptionPercent}%`,
    rootCause: data.adoptionPercent < 40 ? "Parallel implementations outside authority" : "Residual raw controls",
    authority: FAMILY_AUTHORITY[fam] || FAMILY_AUTHORITY.buttons,
    migrationPriority: data.bypassCount >= 100 ? "P0" : data.bypassCount >= 20 ? "P1" : "P2",
    screenshot: "DEVICE_REQUIRED — capture on absorb PR",
  });
}

// Token drift kinds from excellence queue
const mig = excellence.TOKEN_MIGRATION_QUEUE?.byKindTotals || {};
for (const [kind, count] of Object.entries(mig)) {
  if (!count) continue;
  const topPaths = (excellence.TOKEN_MIGRATION_QUEUE?.top || [])
    .filter((t) => t.violations?.some((v) => v.kind === kind))
    .slice(0, 3)
    .map((t) => t.path);
  atlasEntries.push({
    domain: `token:${kind}`,
    location: topPaths,
    signal: `hardcoded ${kind} ×${count}`,
    rootCause: "Literal CSS/TSX values not mapped through DESIGN_TOKENS_AUTHORITY",
    authority: FAMILY_AUTHORITY[
      kind === "color" ? "colors" : kind === "typography" ? "typography" : kind === "spacing" ? "spacing" : "cards"
    ],
    migrationPriority: count >= 500 ? "P0" : count >= 100 ? "P1" : "P2",
    screenshot: "DEVICE_REQUIRED — before/after on high-traffic route",
  });
}

atlasEntries.sort((a, b) => {
  const rank = { P0: 0, P1: 1, P2: 2 };
  return (rank[a.migrationPriority] ?? 9) - (rank[b.migrationPriority] ?? 9);
});

const DESIGN_DRIFT_ATLAS = {
  version: 1,
  updatedAt,
  DESIGN_DRIFT_ERADICATION: true,
  undocumentedDriftPolicy: "No undocumented visual drift — every entry has authority + priority",
  entryCount: atlasEntries.length,
  entries: atlasEntries,
};

// ── MICRO_FRICTION_BACKLOG ──
const friction = [];

for (const j of excellence.JOURNEY_LENGTH_REPORT?.journeys || []) {
  if (j.currentClicks > j.shortestValid) {
    friction.push({
      id: `journey:${j.id}`,
      issue: `${j.id} takes ${j.currentClicks} clicks (target ${j.shortestValid})`,
      impact: "high",
      cost: "low",
      fix: j.recommendation,
    });
  }
}

let confirmCount = 0;
let alertCount = 0;
let hashNav = 0;
let duplicateContinue = 0;
for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const text = readFileSync(abs, "utf8");
  if (/window\.confirm\s*\(/.test(text)) {
    confirmCount++;
    if (confirmCount <= 8) {
      friction.push({
        id: `confirm:${rel}`,
        issue: "window.confirm — weak/blocking feedback",
        impact: "high",
        cost: "medium",
        fix: "ConfirmDialog / AdminConfirmDialog",
      });
    }
  }
  if (/window\.alert\s*\(/.test(text)) {
    alertCount++;
    if (alertCount <= 5) {
      friction.push({
        id: `alert:${rel}`,
        issue: "window.alert",
        impact: "medium",
        cost: "low",
        fix: "Toast / ErrorStateV2 / FieldError",
      });
    }
  }
  if (/href=["']#["']/.test(text)) hashNav++;
}
if (existsSync(join(srcRoot, "components/home/HomeContinueLearning.tsx")) &&
  existsSync(join(srcRoot, "components/home/HomeContinueWidget.tsx"))) {
  duplicateContinue = 1;
  friction.push({
    id: "home:continue-dupe",
    issue: "Two continue-learning surfaces (Learning + Widget)",
    impact: "high",
    cost: "low",
    fix: "Keep one primary HomeContinueLearning CTA",
  });
}
if (hashNav > 5) {
  friction.push({
    id: "nav:hash-href",
    issue: `${hashNav} files use href="#" pattern`,
    impact: "medium",
    cost: "medium",
    fix: "Button for actions · Link for routes",
  });
}

// Sort high impact + low cost first
const impactRank = { high: 0, medium: 1, low: 2 };
const costRank = { low: 0, medium: 1, high: 2 };
friction.sort(
  (a, b) =>
    (impactRank[a.impact] ?? 9) - (impactRank[b.impact] ?? 9) ||
    (costRank[a.cost] ?? 9) - (costRank[b.cost] ?? 9),
);

const MICRO_FRICTION_BACKLOG = {
  version: 1,
  updatedAt,
  UX_MICRO_FRICTION_ELIMINATION: true,
  total: friction.length,
  items: friction.slice(0, 40),
  stats: { confirmCount, alertCount, hashNav, duplicateContinue },
};

// ── CONTENT style scan ──
const uiCopyPath = join(srcRoot, "lib/ui-copy.ts");
const uiCopyExists = existsSync(uiCopyPath);
const conflictingPhrases = [
  { a: "حاول مرة أخرى", b: "أعد المحاولة", label: "retry wording" },
  { a: "لا توجد نتائج", b: "لا نتائج", label: "empty search" },
  { a: "حفظ", b: "احفظ", label: "save verb form" },
  { a: "إلغاء", b: "ألغِ", label: "cancel verb form" },
  { a: "تحميل", b: "جاري التحميل", label: "loading" },
];

const contentHits = [];
for (const phrase of conflictingPhrases) {
  let countA = 0;
  let countB = 0;
  const samplesA = [];
  const samplesB = [];
  for (const abs of tsxFiles) {
    const rel = relative(srcRoot, abs).replace(/\\/g, "/");
    if (rel.includes("ui-copy")) continue;
    const text = readFileSync(abs, "utf8");
    if (text.includes(phrase.a)) {
      countA++;
      if (samplesA.length < 3) samplesA.push(rel);
    }
    if (text.includes(phrase.b)) {
      countB++;
      if (samplesB.length < 3) samplesB.push(rel);
    }
  }
  if (countA && countB) {
    contentHits.push({ ...phrase, countA, countB, samplesA, samplesB });
  }
}

const CONTENT_STYLE_SCAN = {
  version: 1,
  updatedAt,
  canonicalModule: "artifacts/majalis/src/lib/ui-copy.ts",
  uiCopyPresent: uiCopyExists,
  conflictingTerminology: contentHits,
  CONTENT_DESIGN_UNIFICATION: true,
};

// ── Icon scan ──
const iconSizeHits = new Map();
const iconImportFiles = [];
let lucideFiles = 0;
for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const text = readFileSync(abs, "utf8");
  if (/from\s+["']lucide-react["']/.test(text)) {
    lucideFiles++;
    iconImportFiles.push(rel);
  }
  for (const m of text.matchAll(/\bsize=\{(\d+)\}/g)) {
    const n = Number(m[1]);
    if (n >= 12 && n <= 48) iconSizeHits.set(n, (iconSizeHits.get(n) || 0) + 1);
  }
  for (const m of text.matchAll(/\bsize=["'](\d+)["']/g)) {
    const n = Number(m[1]);
    if (n >= 12 && n <= 48) iconSizeHits.set(n, (iconSizeHits.get(n) || 0) + 1);
  }
}

const ICON_SCAN = {
  version: 1,
  updatedAt,
  lucideFiles,
  sizeHistogram: Object.fromEntries([...iconSizeHits.entries()].sort((a, b) => b[1] - a[1])),
  preferredSizes: { sm: 16, md: 18, lg: 22, xl: 24 },
  authority: "docs/design/ICON_AUTHORITY_MAP.md · ICON_SIZE_SCALE in size-authority.ts",
  ICON_SYSTEM_UNIFICATION: true,
};

// Write
mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const bundle = {
  updatedAt,
  PRODUCT_MATURITY_SCORECARD,
  DESIGN_DRIFT_ATLAS,
  MICRO_FRICTION_BACKLOG,
  CONTENT_STYLE_SCAN,
  ICON_SCAN,
};

writeFileSync(join(majalis, "reports/product-maturity-engine.json"), JSON.stringify(bundle, null, 2) + "\n");

function md(name, body) {
  writeFileSync(join(repo, "docs/audit", name), body);
}

md(
  "PRODUCT_MATURITY_SCORECARD.md",
  [
    "# PRODUCT_MATURITY_SCORECARD",
    "",
    `Generated: ${updatedAt}`,
    "",
    `## Overall: **${overallScore}** · **${overallLevel}**`,
    "",
    `| Category | Score | Level |`,
    `|---|---:|---|`,
    ...categories.map((c) => `| ${c.name} | ${c.score} | ${c.level} |`),
    "",
    "Levels: FOUNDATION &lt;55 · ADVANCED 55–74 · MATURE 75–89 · EXCELLENT ≥90",
    "",
    "## Non-claims",
    "",
    ...PRODUCT_MATURITY_SCORECARD.nonClaims.map((n) => `- ${n}`),
    "",
  ].join("\n"),
);

md(
  "DESIGN_DRIFT_ATLAS.md",
  [
    "# DESIGN_DRIFT_ATLAS",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Entries: **${atlasEntries.length}** · Policy: no undocumented visual drift.`,
    "",
    "Screenshots: DEVICE_REQUIRED on absorb PRs (not stored in this static atlas).",
    "",
    `| Priority | Domain | Signal | Authority | Sample locations |`,
    `|---|---|---|---|---|`,
    ...atlasEntries.slice(0, 30).map(
      (e) =>
        `| ${e.migrationPriority} | ${e.domain} | ${e.signal} | ${e.authority} | ${(e.location || []).slice(0, 2).map((l) => `\`${l}\``).join(", ") || "—"} |`,
    ),
    "",
    "## Detail (top P0/P1)",
    "",
    ...atlasEntries
      .filter((e) => e.migrationPriority === "P0" || e.migrationPriority === "P1")
      .slice(0, 12)
      .flatMap((e) => [
        `### ${e.domain} (${e.migrationPriority})`,
        "",
        `- Root cause: ${e.rootCause}`,
        `- Authority: ${e.authority}`,
        `- Screenshot: ${e.screenshot}`,
        `- Locations:`,
        ...(e.location || []).map((l) => `  - \`${l}\``),
        "",
      ]),
  ].join("\n"),
);

md(
  "MICRO_FRICTION_BACKLOG.md",
  [
    "# MICRO_FRICTION_BACKLOG",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Items: **${friction.length}** · Ranked high-impact / low-cost first.`,
    "",
    `| Impact | Cost | Issue | Fix |`,
    `|---|---|---|---|`,
    ...friction.slice(0, 25).map((f) => `| ${f.impact} | ${f.cost} | ${f.issue} | ${f.fix} |`),
    "",
    `Stats: confirm=${confirmCount} alert=${alertCount} hashHrefFiles≈${hashNav} continueDupe=${duplicateContinue}`,
    "",
  ].join("\n"),
);

console.log(
  `product-maturity: overall=${overallScore}/${overallLevel} drift=${atlasEntries.length} friction=${friction.length} contentConflicts=${contentHits.length} lucideFiles=${lucideFiles}`,
);

if (check) {
  const miss = [
    join(repo, "docs/audit/PRODUCT_MATURITY_SCORECARD.md"),
    join(repo, "docs/audit/DESIGN_DRIFT_ATLAS.md"),
    join(repo, "docs/audit/MICRO_FRICTION_BACKLOG.md"),
    join(repo, "docs/design/CONTENT_STYLE_AUTHORITY.md"),
    join(repo, "docs/design/ICON_AUTHORITY_MAP.md"),
    join(majalis, "reports/product-maturity-engine.json"),
  ].filter((p) => !existsSync(p));
  if (miss.length || overallScore < 1) {
    console.error("product-maturity --check FAIL", miss);
    process.exit(1);
  }
  console.log("product-maturity --check: ok");
}
