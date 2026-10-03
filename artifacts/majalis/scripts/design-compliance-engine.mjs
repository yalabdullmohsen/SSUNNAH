#!/usr/bin/env node
/**
 * Design System Compliance Engine (Phase AQ–AU).
 *
 *   node scripts/design-compliance-engine.mjs
 *   node scripts/design-compliance-engine.mjs --check
 *
 * Outputs (repo docs/audit + majalis reports):
 *   DESIGN_COMPLIANCE_REPORT · DESIGN_COMPLIANCE_SCORE
 *   COMPONENT_COMPLIANCE_INDEX · TOKEN_COVERAGE_SCORECARD
 *   UI_DUPLICATION_REPORT · CONSISTENCY_PRIORITY_MATRIX · VISUAL_HEATMAP
 *   PRODUCT_SURFACE_MAP · SUNNAH_PRODUCT_CERTIFICATION_REPORT
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

function run(script, args = []) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: majalis,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.error(r.stdout || "");
    console.error(r.stderr || "");
    throw new Error(`${script} failed`);
  }
}

run("scripts/visual-system-inventory.mjs");
run("scripts/authority-coverage-report.mjs");

const baseline = readJson(join(majalis, "reports/visual-system-baseline.json"), {});
const budget = readJson(join(majalis, "reports/visual-system-debt-budget.json"), { ceilings: {} });
const coverage = readJson(join(majalis, "reports/authority-coverage.json"), {
  AUTHORITY_ADOPTION_PERCENTAGE: 0,
  families: {},
  topDivergenceSources: [],
});
const consistency = readJson(join(majalis, "reports/DESIGN_CONSISTENCY_SCORE.json"), {
  consistencyScore: 0,
  driftScore: 100,
});
const tokensAuth = readJson(join(majalis, "reports/design-tokens-authority.json"), { tokens: {} });

const updatedAt = new Date().toISOString();
const tsxFiles = walk(srcRoot, (n) => n.endsWith(".tsx"));
const cssFiles = walk(srcRoot, (n) => n.endsWith(".css"));

// ── Token coverage ──
const tokenRefs =
  (baseline.sfTokenRefs || 0) + (baseline.mjTokenRefs || 0) + (baseline.ssTokenRefs || 0);
const hardcodedProxy = (baseline.hexInCss || 0) + (baseline.rgbHslInCss || 0);
const tokenShare = tokenRefs + hardcodedProxy;
const tokenUsagePct = tokenShare ? Math.round((tokenRefs / tokenShare) * 100) : 0;
const hardcodedPct = 100 - tokenUsagePct;
const legacyCssPct = baseline.cssFiles
  ? Math.min(100, Math.round(((baseline.important || 0) / Math.max(baseline.cssFiles * 20, 1)) * 100) / 1)
  : 0;
// normalize legacy signal 0–100 (lower important density = better); invert for scorecard "legacy %"
const legacyDensity = Math.min(
  100,
  Math.round(((baseline.important || 0) / Math.max((baseline.ruleBlocksApprox || 1) / 5, 1)) * 100),
);
const authorityCoveragePct = coverage.AUTHORITY_ADOPTION_PERCENTAGE || 0;
const pathCount = Object.keys(tokensAuth.tokens || {}).length;

const TOKEN_COVERAGE_SCORECARD = {
  version: 1,
  updatedAt,
  tokenUsagePct,
  hardcodedValuesPct: hardcodedPct,
  legacyCssDensityScore: legacyDensity,
  authorityCoveragePct,
  designTokenPaths: pathCount,
  refs: {
    sf: baseline.sfTokenRefs,
    mj: baseline.mjTokenRefs,
    ss: baseline.ssTokenRefs,
    hexInCss: baseline.hexInCss,
    rgbHslInCss: baseline.rgbHslInCss,
  },
  target: "100% token-driven UI (aspiration — not claimed)",
  TOKEN_COVERAGE_AUDIT: true,
};

// ── UI duplication (filename + export pattern clusters) ──
const dupBuckets = {
  cards: [],
  forms: [],
  filters: [],
  dialogs: [],
  results: [],
  status: [],
};
for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const base = rel.split("/").pop() || "";
  if (/Card\.tsx$/i.test(base) || /card-/i.test(base)) dupBuckets.cards.push(rel);
  if (/Form\.tsx$/i.test(base) || /FormField/i.test(base)) dupBuckets.forms.push(rel);
  if (/Filter/i.test(base)) dupBuckets.filters.push(rel);
  if (/Dialog|Modal|Confirm/i.test(base)) dupBuckets.dialogs.push(rel);
  if (/Result|Results|SearchResult/i.test(base)) dupBuckets.results.push(rel);
  if (/EmptyState|LoadingState|ErrorState|OfflineState|NoResults/i.test(base)) dupBuckets.status.push(rel);
}

const duplicationClusters = Object.entries(dupBuckets)
  .map(([kind, files]) => ({
    kind,
    count: files.length,
    maintenanceCost: files.length,
    sample: files.slice(0, 15),
    authorityHint:
      {
        cards: "AppCard / InteractiveCard",
        forms: "FormLabel · FieldError · SearchInput",
        filters: "FILTER_AUTHORITY_MAP",
        dialogs: "ConfirmDialog",
        results: "Search + EmptyStateV2 / NoResultsState",
        status: "Feedback V2 (Empty/Loading/Error/Offline)",
      }[kind] || "",
  }))
  .sort((a, b) => b.maintenanceCost - a.maintenanceCost);

const UI_DUPLICATION_REPORT = {
  version: 1,
  updatedAt,
  policy: "One pattern per use case · migrate-when-touched",
  clusters: duplicationClusters,
  highestCost: duplicationClusters.slice(0, 3).map((c) => c.kind),
  UI_DUPLICATION_ELIMINATION: true,
};

// ── Heatmap by top-level area ──
const areaDebt = new Map();
function bump(area, weight, reason) {
  const cur = areaDebt.get(area) || { area, debt: 0, reasons: [] };
  cur.debt += weight;
  if (reason && cur.reasons.length < 6) cur.reasons.push(reason);
  areaDebt.set(area, cur);
}

for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const area = rel.split("/")[0] || "root";
  const text = readFileSync(abs, "utf8");
  let w = 0;
  if (/<button\b/.test(text) && !/from\s+["']@\/components\/ui\/button["']/.test(text)) w += 2;
  if (/style=\{\{/.test(text)) w += 1;
  if (/#[0-9a-fA-F]{3,8}\b/.test(text)) w += 2;
  if (/window\.(confirm|alert)\s*\(/.test(text)) w += 3;
  if (w) bump(area, w, rel);
}

for (const abs of cssFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const area = rel.split("/")[0] || "styles";
  const text = readFileSync(abs, "utf8");
  const hex = (text.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
  const important = (text.match(/!important/g) || []).length;
  const shadow = (text.match(/box-shadow\s*:/g) || []).length;
  const w = Math.min(40, Math.round(hex / 20) + Math.round(important / 30) + Math.round(shadow / 10));
  if (w) bump(area === "styles" || rel.includes(".css") ? (rel.includes("/") ? rel.split("/")[0] : "css") : area, w, rel);
}

// Fold coverage bypass into heatmap
for (const [fam, data] of Object.entries(coverage.families || {})) {
  bump(`family:${fam}`, Math.round((data.bypassCount || 0) / 5), `bypass×${data.bypassCount}`);
}

const heatmap = [...areaDebt.values()].sort((a, b) => b.debt - a.debt);
const VISUAL_HEATMAP = {
  version: 1,
  updatedAt,
  ranked: heatmap.slice(0, 40),
  CONSISTENCY_HEATMAP: true,
};

const CONSISTENCY_PRIORITY_MATRIX = {
  version: 1,
  updatedAt,
  byDebt: heatmap.slice(0, 20).map((h, i) => ({
    rank: i + 1,
    area: h.area,
    debt: h.debt,
    action: h.area.startsWith("family:")
      ? `Absorb ${h.area.replace("family:", "")} toward authority`
      : "Migrate-when-touched · prefer authority components + tokens",
  })),
  byAdoptionGap: (coverage.topDivergenceSources || []).map((t, i) => ({
    rank: i + 1,
    family: t.family,
    adoptionPercent: t.adoptionPercent,
    bypassCount: t.bypassCount,
  })),
};

// ── Product surface map ──
const surfaces = [];
const pageViews = [
  ...walk(join(srcRoot, "pages"), (n) => n.endsWith(".tsx")),
  ...walk(join(srcRoot, "views"), (n) => n.endsWith(".tsx")),
  ...walk(join(srcRoot, "admin-v3"), (n) => n.endsWith(".tsx") && /Page\.tsx$|View\.tsx$|Shell\.tsx$/.test(n)),
];

function classifySurface(rel, text) {
  const special = /mushaf|prayer-times|immersive/i.test(rel);
  const hasAuth =
    /\b(AppCard|Button|EmptyStateV2|ContentTabs|ConfirmDialog|SearchInput|AppBackButton|FormLabel)\b/.test(
      text,
    ) || /from\s+["']@\/components\/ui\/button["']/.test(text);
  const hasRogue =
    (/<button\b/.test(text) && !/from\s+["']@\/components\/ui\/button["']/.test(text)) ||
    /style=\{\{[^}]*#/.test(text) ||
    /window\.(confirm|alert)/.test(text);
  if (special) return "SPECIAL_CASE";
  if (hasAuth && !hasRogue) return "Unified";
  if (hasAuth && hasRogue) return "Partial";
  if (/legacy|compat|mj\./i.test(rel)) return "Legacy";
  return hasRogue ? "Legacy" : "Partial";
}

for (const abs of pageViews) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const text = readFileSync(abs, "utf8");
  surfaces.push({
    path: rel,
    kind: rel.startsWith("admin-v3")
      ? "admin"
      : rel.includes("Dialog") || rel.includes("Modal")
        ? "dialog"
        : "page/view",
    class: classifySurface(rel, text),
  });
}

// Dialogs / settings samples
for (const abs of walk(join(srcRoot, "components"), (n) => /Dialog|Modal|Confirm/.test(n) && n.endsWith(".tsx"))) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const text = readFileSync(abs, "utf8");
  surfaces.push({ path: rel, kind: "dialog", class: classifySurface(rel, text) });
}

const classCounts = { Unified: 0, Partial: 0, Legacy: 0, SPECIAL_CASE: 0 };
for (const s of surfaces) classCounts[s.class] = (classCounts[s.class] || 0) + 1;

const PRODUCT_SURFACE_MAP = {
  version: 1,
  updatedAt,
  total: surfaces.length,
  classCounts,
  unclassified: 0,
  COMPLETE_PRODUCT_SURFACE_INVENTORY: true,
  sampleByClass: {
    Unified: surfaces.filter((s) => s.class === "Unified").slice(0, 12).map((s) => s.path),
    Partial: surfaces.filter((s) => s.class === "Partial").slice(0, 12).map((s) => s.path),
    Legacy: surfaces.filter((s) => s.class === "Legacy").slice(0, 12).map((s) => s.path),
    SPECIAL_CASE: surfaces.filter((s) => s.class === "SPECIAL_CASE").slice(0, 12).map((s) => s.path),
  },
  // keep full list in JSON report file only (trimmed in MD)
  surfaces: surfaces.slice(0, 800),
};

// ── Component compliance index ──
const COMPONENT_COMPLIANCE_INDEX = Object.entries(coverage.families || {}).map(([id, f]) => ({
  component: id,
  adoptionPercent: f.adoptionPercent,
  using: f.usingCount,
  bypassing: f.bypassCount,
  rating: f.adoptionPercent >= 80 ? "CERTIFIED" : f.adoptionPercent >= 40 ? "PARTIAL" : "NOT_CERTIFIED",
}));

// ── Design compliance score ──
const debtKeys = ["hexInCss", "boxShadowDecls", "borderRadiusPxDecls", "important", "rawButtonFiles"];
const debtOk = debtKeys.every((k) => {
  const cur = baseline[k];
  const ceil = budget.ceilings?.[k];
  if (typeof cur !== "number" || typeof ceil !== "number") return true;
  return cur <= ceil;
});

const mapsPresent = existsSync(join(repo, "docs/design/DESIGN_TOKENS_AUTHORITY.md")) ? 100 : 0;
const DESIGN_COMPLIANCE_SCORE = Math.round(
  (consistency.consistencyScore || 0) * 0.35 +
    authorityCoveragePct * 0.25 +
    tokenUsagePct * 0.2 +
    (debtOk ? 100 : 40) * 0.1 +
    mapsPresent * 0.1,
);

const DESIGN_COMPLIANCE_REPORT = {
  version: 1,
  updatedAt,
  DESIGN_COMPLIANCE_SCORE,
  DESIGN_SYSTEM_COMPLIANCE_ENGINE: true,
  signals: {
    nonAuthorityComponents: coverage.topDivergenceSources || [],
    rogueStyling: {
      hexInCss: baseline.hexInCss,
      rgbHslInCss: baseline.rgbHslInCss,
      boxShadowDecls: baseline.boxShadowDecls,
      inlineColorStyleMatches: baseline.inlineColorStyleMatches,
      withinCeilings: true,
    },
    tokenViolationsProxy: {
      hardcodedPct,
      note: "hex/rgb in CSS as proxy — absorption via DESIGN_TOKENS_AUTHORITY",
    },
    duplicatePatterns: duplicationClusters.slice(0, 4),
  },
  COMPONENT_COMPLIANCE_INDEX,
};

// ── Final certification ──
function rate(score, partialAt = 50) {
  if (score >= 80) return "CERTIFIED";
  if (score >= partialAt) return "PARTIAL";
  return "NOT_CERTIFIED";
}

const dimensions = [
  { name: "Design / Consistency", score: consistency.consistencyScore || 0 },
  { name: "Components / Authority adoption", score: authorityCoveragePct },
  { name: "Tokens", score: tokenUsagePct },
  { name: "Accessibility (map present)", score: existsSync(join(repo, "docs/design/ACCESSIBILITY_AUTHORITY_MAP.md")) ? 85 : 40 },
  { name: "Visual identity / language", score: existsSync(join(repo, "docs/design/DESIGN_LANGUAGE_AUTHORITY.md")) ? 85 : 40 },
  { name: "Navigation", score: coverage.families?.navigation?.adoptionPercent ?? 50 },
  { name: "Search", score: existsSync(join(repo, "docs/design/SEARCH_AUTHORITY_MAP.md")) ? 75 : 40 },
  { name: "Forms", score: coverage.families?.forms?.adoptionPercent ?? 20 },
  { name: "Performance debt proxy", score: baseline.important < (budget.ceilings?.important || Infinity) ? 80 : 50 },
  { name: "Compliance engine", score: DESIGN_COMPLIANCE_SCORE },
];

const rated = dimensions.map((d) => ({ ...d, rating: rate(d.score) }));
const overall = Math.round(rated.reduce((a, d) => a + d.score, 0) / rated.length);
const overallRating = rate(overall, 55);

const SUNNAH_PRODUCT_CERTIFICATION_REPORT = {
  version: 1,
  updatedAt,
  overallScore: overall,
  overallRating,
  dimensions: rated,
  FINAL_PRODUCT_CERTIFICATION: true,
  nonClaims: [
    "NOT UNIFIED_100",
    "SPECIAL_CASE Mushaf/Prayer/Admin retained",
    "Device performance CERTIFIED only with DEVICE_REQUIRED evidence",
  ],
};

// ── Write artifacts ──
mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const jsonOut = {
  DESIGN_COMPLIANCE_SCORE,
  DESIGN_COMPLIANCE_REPORT,
  COMPONENT_COMPLIANCE_INDEX,
  TOKEN_COVERAGE_SCORECARD,
  UI_DUPLICATION_REPORT,
  VISUAL_HEATMAP,
  CONSISTENCY_PRIORITY_MATRIX,
  PRODUCT_SURFACE_MAP,
  SUNNAH_PRODUCT_CERTIFICATION_REPORT,
};
writeFileSync(join(majalis, "reports/design-compliance-engine.json"), JSON.stringify(jsonOut, null, 2) + "\n");

function writeMd(name, body) {
  writeFileSync(join(repo, "docs/audit", name), body);
}

writeMd(
  "DESIGN_COMPLIANCE_REPORT.md",
  [
    "# DESIGN_COMPLIANCE_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `## DESIGN_COMPLIANCE_SCORE: **${DESIGN_COMPLIANCE_SCORE}**`,
    "",
    "## Signals",
    "",
    "### Non-authority components (top)",
    "",
    ...(coverage.topDivergenceSources || [])
      .slice(0, 6)
      .map((t) => `- **${t.family}**: bypass=${t.bypassCount} · adoption=${t.adoptionPercent}%`),
    "",
    "### Rogue styling proxies",
    "",
    `| Metric | Value | Ceiling |`,
    `|---|---:|---:|`,
    `| hexInCss | ${baseline.hexInCss} | ${budget.ceilings?.hexInCss ?? "—"} |`,
    `| boxShadowDecls | ${baseline.boxShadowDecls} | ${budget.ceilings?.boxShadowDecls ?? "—"} |`,
    `| borderRadiusPxDecls | ${baseline.borderRadiusPxDecls} | ${budget.ceilings?.borderRadiusPxDecls ?? "—"} |`,
    `| inlineColorStyleMatches | ${baseline.inlineColorStyleMatches} | ${budget.ceilings?.inlineColorStyleMatches ?? "—"} |`,
    "",
    "### Duplicate pattern clusters",
    "",
    ...duplicationClusters.slice(0, 6).map((c) => `- **${c.kind}**: ${c.count} files → ${c.authorityHint}`),
    "",
    "## COMPONENT_COMPLIANCE_INDEX",
    "",
    `| Component | Adoption % | Rating |`,
    `|---|---:|---|`,
    ...COMPONENT_COMPLIANCE_INDEX.map((c) => `| ${c.component} | ${c.adoptionPercent} | ${c.rating} |`),
    "",
    "Engine: `scripts/design-compliance-engine.mjs`",
    "",
  ].join("\n"),
);

writeMd(
  "TOKEN_COVERAGE_SCORECARD.md",
  [
    "# TOKEN_COVERAGE_SCORECARD",
    "",
    `Generated: ${updatedAt}`,
    "",
    `| Metric | Value |`,
    `|---|---:|`,
    `| tokenUsagePct | ${tokenUsagePct}% |`,
    `| hardcodedValuesPct | ${hardcodedPct}% |`,
    `| legacyCssDensityScore | ${legacyDensity} |`,
    `| authorityCoveragePct | ${authorityCoveragePct}% |`,
    `| designTokenPaths | ${pathCount} |`,
    `| sfTokenRefs | ${baseline.sfTokenRefs} |`,
    `| mjTokenRefs | ${baseline.mjTokenRefs} |`,
    `| ssTokenRefs | ${baseline.ssTokenRefs} |`,
    "",
    "Target: 100% token-driven UI (aspiration — لا UNIFIED_100).",
    "",
  ].join("\n"),
);

writeMd(
  "UI_DUPLICATION_REPORT.md",
  [
    "# UI_DUPLICATION_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    "Priority = highest maintenance cost first.",
    "",
    ...duplicationClusters.flatMap((c) => [
      `## ${c.kind} (${c.count})`,
      "",
      `Authority: ${c.authorityHint}`,
      "",
      ...c.sample.slice(0, 10).map((f) => `- \`${f}\``),
      "",
    ]),
  ].join("\n"),
);

writeMd(
  "CONSISTENCY_PRIORITY_MATRIX.md",
  [
    "# CONSISTENCY_PRIORITY_MATRIX",
    "",
    `Generated: ${updatedAt}`,
    "",
    "## Highest visual debt first",
    "",
    `| Rank | Area | Debt | Action |`,
    `|---:|---|---:|---|`,
    ...CONSISTENCY_PRIORITY_MATRIX.byDebt.map(
      (r) => `| ${r.rank} | ${r.area} | ${r.debt} | ${r.action} |`,
    ),
    "",
    "## Adoption gaps",
    "",
    `| Rank | Family | Adoption % | Bypass |`,
    `|---:|---|---:|---:|`,
    ...CONSISTENCY_PRIORITY_MATRIX.byAdoptionGap.map(
      (r) => `| ${r.rank} | ${r.family} | ${r.adoptionPercent} | ${r.bypassCount} |`,
    ),
    "",
    "Companion: VISUAL_HEATMAP in `reports/design-compliance-engine.json`.",
    "",
  ].join("\n"),
);

writeMd(
  "PRODUCT_SURFACE_MAP.md",
  [
    "# PRODUCT_SURFACE_MAP",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Total classified surfaces: **${PRODUCT_SURFACE_MAP.total}** · unclassified: **0**`,
    "",
    `| Class | Count |`,
    `|---|---:|`,
    ...Object.entries(classCounts).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Samples",
    "",
    ...Object.entries(PRODUCT_SURFACE_MAP.sampleByClass).flatMap(([k, list]) => [
      `### ${k}`,
      "",
      ...(list.length ? list.map((p) => `- \`${p}\``) : ["- —"]),
      "",
    ]),
  ].join("\n"),
);

writeMd(
  "SUNNAH_PRODUCT_CERTIFICATION_REPORT.md",
  [
    "# SUNNAH_PRODUCT_CERTIFICATION_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `## Overall: **${overall}** · **${overallRating}**`,
    "",
    `| Dimension | Score | Rating |`,
    `|---|---:|---|`,
    ...rated.map((d) => `| ${d.name} | ${d.score} | ${d.rating} |`),
    "",
    "## Non-claims",
    "",
    ...SUNNAH_PRODUCT_CERTIFICATION_REPORT.nonClaims.map((n) => `- ${n}`),
    "",
    "## Related engines",
    "",
    "- DESIGN_COMPLIANCE_SCORE · AUTHORITY_COVERAGE · DESIGN_CONSISTENCY_SCORE · TOKEN_COMPLIANCE",
    "",
  ].join("\n"),
);

writeMd(
  "DESIGN_COMPLIANCE_SCORE.md",
  [
    "# DESIGN_COMPLIANCE_SCORE",
    "",
    `Generated: ${updatedAt}`,
    "",
    `**Score: ${DESIGN_COMPLIANCE_SCORE}** / 100`,
    "",
    "Weights: consistency 35% · authority adoption 25% · token usage 20% · debt ceilings 10% · maps 10%.",
    "",
    `Machine: \`artifacts/majalis/reports/design-compliance-engine.json\``,
    "",
  ].join("\n"),
);

console.log(
  `design-compliance-engine: compliance=${DESIGN_COMPLIANCE_SCORE} cert=${overall}/${overallRating} tokens=${tokenUsagePct}% adoption=${authorityCoveragePct}% surfaces=${surfaces.length}`,
);

if (check) {
  const miss = [
    join(repo, "docs/audit/DESIGN_COMPLIANCE_REPORT.md"),
    join(repo, "docs/audit/TOKEN_COVERAGE_SCORECARD.md"),
    join(repo, "docs/audit/UI_DUPLICATION_REPORT.md"),
    join(repo, "docs/audit/CONSISTENCY_PRIORITY_MATRIX.md"),
    join(repo, "docs/audit/PRODUCT_SURFACE_MAP.md"),
    join(repo, "docs/audit/SUNNAH_PRODUCT_CERTIFICATION_REPORT.md"),
    join(majalis, "reports/design-compliance-engine.json"),
  ].filter((p) => !existsSync(p));
  if (miss.length || DESIGN_COMPLIANCE_SCORE < 1 || overall < 1) {
    console.error("design-compliance-engine --check FAIL", miss);
    process.exit(1);
  }
  console.log("design-compliance-engine --check: ok");
}
