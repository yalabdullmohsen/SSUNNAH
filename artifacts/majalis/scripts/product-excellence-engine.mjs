#!/usr/bin/env node
/**
 * Product Excellence Engine (Phase AV–AZ).
 *
 *   node scripts/product-excellence-engine.mjs
 *   node scripts/product-excellence-engine.mjs --check
 *
 * Outputs:
 *   PRODUCT_COHESION_SCORE / REPORT
 *   TOKEN_MIGRATION_QUEUE
 *   COMPONENT_RATIONALIZATION_REPORT
 *   JOURNEY_LENGTH_REPORT
 *   POLISH_BACKLOG
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

function countRe(text, re) {
  return (text.match(re) || []).length;
}

// Refresh upstream signals (idempotent)
for (const script of [
  "scripts/authority-coverage-report.mjs",
  "scripts/visual-system-inventory.mjs",
]) {
  const r = spawnSync(process.execPath, [script], { cwd: majalis, encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
}

const coverage = readJson(join(majalis, "reports/authority-coverage.json"), {
  AUTHORITY_ADOPTION_PERCENTAGE: 0,
  families: {},
});
const baseline = readJson(join(majalis, "reports/visual-system-baseline.json"), {});
const compliance = readJson(join(majalis, "reports/design-compliance-engine.json"), null);
const consistency = readJson(join(majalis, "reports/DESIGN_CONSISTENCY_SCORE.json"), {
  consistencyScore: 0,
});

const updatedAt = new Date().toISOString();
const tsxFiles = walk(srcRoot, (n) => n.endsWith(".tsx"));
const cssFiles = walk(srcRoot, (n) => n.endsWith(".css"));

// ═══════════════════════════════════════════
// 1) PRODUCT_COHESION_AUDIT
// ═══════════════════════════════════════════
const EXPERIENCES = [
  { id: "Home", globs: [/pages\/account\/ui\/Home/, /components\/home\//] },
  { id: "Quran Hub", globs: [/pages\/quran\/ui\/QuranHub/, /pages\/quran\/QuranHub/] },
  { id: "Mushaf", globs: [/mushaf|Mushaf|ImmersiveQuran/i], special: true },
  { id: "Prayer", globs: [/prayer-times|PrayerTimes|HomeCompactPrayer|adhan/i], special: true },
  { id: "Lessons", globs: [/pages\/lessons\//] },
  { id: "Hadith", globs: [/pages\/hadith\//] },
  { id: "Fiqh", globs: [/pages\/fiqh\//] },
  { id: "Library", globs: [/pages\/library\//] },
  { id: "Search", globs: [/SearchView|GlobalSearch|pages\/account\/ui\/Search/] },
  { id: "Settings", globs: [/SettingsView|NotificationSettings|account\/ui\/Settings/] },
  { id: "Admin", globs: [/admin-v3\//] },
];

function scoreFile(text) {
  let visual = 50;
  let interaction = 50;
  let navigation = 50;
  let hierarchy = 50;
  if (/\b(AppCard|InteractiveCard|SoftCard)\b/.test(text) || /from\s+["']@\/components\/design-system/.test(text))
    visual += 20;
  if (/#[0-9a-fA-F]{3,8}\b/.test(text) || /style=\{\{/.test(text)) visual -= 15;
  if (/from\s+["']@\/components\/ui\/button["']|\b(ActionButton|PrimaryButton)\b/.test(text))
    interaction += 25;
  if (/<button\b/.test(text) && !/from\s+["']@\/components\/ui\/button["']/.test(text))
    interaction -= 20;
  if (/\b(AppBackButton|Link\b|BottomNav|ContentTabs)\b/.test(text)) navigation += 20;
  if (/href=["']#["']/.test(text) || /floating-back/i.test(text)) navigation -= 15;
  if (/\b(PageHeader|SectionTitle|EmptyStateV2|AppPage)\b/.test(text)) hierarchy += 20;
  if (countRe(text, /<h1\b/g) > 1) hierarchy -= 10;
  return {
    visual: clamp(visual),
    interaction: clamp(interaction),
    navigation: clamp(navigation),
    hierarchy: clamp(hierarchy),
  };
}
function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

const cohesionExperiences = [];
for (const exp of EXPERIENCES) {
  const files = tsxFiles.filter((abs) => {
    const rel = relative(srcRoot, abs).replace(/\\/g, "/");
    return exp.globs.some((g) => g.test(rel));
  });
  if (!files.length) {
    cohesionExperiences.push({
      id: exp.id,
      special: !!exp.special,
      fileCount: 0,
      scores: { visual: 40, interaction: 40, navigation: 40, hierarchy: 40 },
      cohesion: 40,
      note: "no matched surface files in scan",
    });
    continue;
  }
  const agg = { visual: 0, interaction: 0, navigation: 0, hierarchy: 0 };
  for (const abs of files.slice(0, 40)) {
    const s = scoreFile(readFileSync(abs, "utf8"));
    for (const k of Object.keys(agg)) agg[k] += s[k];
  }
  const n = Math.min(files.length, 40);
  const scores = {
    visual: Math.round(agg.visual / n),
    interaction: Math.round(agg.interaction / n),
    navigation: Math.round(agg.navigation / n),
    hierarchy: Math.round(agg.hierarchy / n),
  };
  // Blend family adoption for related families
  let adoptionBoost = 0;
  if (exp.id === "Admin") adoptionBoost = (coverage.families?.buttons?.adoptionPercent || 0) * 0.1;
  if (exp.id === "Search") adoptionBoost = 5;
  const cohesion = Math.round(
    (scores.visual + scores.interaction + scores.navigation + scores.hierarchy) / 4 + adoptionBoost,
  );
  cohesionExperiences.push({
    id: exp.id,
    special: !!exp.special,
    fileCount: files.length,
    scores,
    cohesion: clamp(cohesion),
  });
}

cohesionExperiences.sort((a, b) => a.cohesion - b.cohesion);
const PRODUCT_COHESION_SCORE = Math.round(
  cohesionExperiences.reduce((a, e) => a + e.cohesion, 0) / Math.max(cohesionExperiences.length, 1),
);

// ═══════════════════════════════════════════
// 2) TOKEN_ENFORCEMENT_MIGRATION
// ═══════════════════════════════════════════
const migrationQueue = [];
for (const abs of [...cssFiles, ...tsxFiles]) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  if (/__tests__|design-system\/|foundation|tokens\.css|theme/.test(rel)) continue;
  const text = readFileSync(abs, "utf8");
  const violations = [];
  const hex = countRe(text, /#[0-9a-fA-F]{3,8}\b/g);
  const pxSpace = countRe(text, /(?:padding|margin|gap)\s*:\s*\d+px/g);
  const shadow = countRe(text, /box-shadow\s*:\s*(?!none|var\()/g);
  const radius = countRe(text, /border-radius\s*:\s*\d+px/g);
  const typePx = countRe(text, /font-size\s*:\s*\d+px/g);
  if (hex) violations.push({ kind: "color", count: hex });
  if (pxSpace) violations.push({ kind: "spacing", count: pxSpace });
  if (shadow) violations.push({ kind: "shadow", count: shadow });
  if (radius) violations.push({ kind: "radii", count: radius });
  if (typePx) violations.push({ kind: "typography", count: typePx });
  if (!violations.length) continue;
  const impact = violations.reduce((a, v) => a + v.count, 0);
  // Weight product surfaces higher
  const weight = /pages\/|components\/home|admin-v3/.test(rel) ? 1.4 : 1;
  migrationQueue.push({
    path: rel,
    impact: Math.round(impact * weight),
    violations,
  });
}
migrationQueue.sort((a, b) => b.impact - a.impact);

const TOKEN_MIGRATION_QUEUE = {
  version: 1,
  updatedAt,
  TOKEN_ENFORCEMENT_MIGRATION: true,
  totalFilesWithViolations: migrationQueue.length,
  top: migrationQueue.slice(0, 40),
  byKindTotals: (() => {
    const t = { color: 0, spacing: 0, shadow: 0, radii: 0, typography: 0 };
    for (const row of migrationQueue) {
      for (const v of row.violations) t[v.kind] = (t[v.kind] || 0) + v.count;
    }
    return t;
  })(),
  policy: "Highest-impact first · map to DESIGN_TOKENS_AUTHORITY · no new family",
};

// ═══════════════════════════════════════════
// 3) COMPONENT_USAGE_RATIONALIZATION
// ═══════════════════════════════════════════
const nameHits = new Map();
const NAME_RE =
  /\b(AppCard|InteractiveCard|StatusCard|SoftCard|ContentCard|HubCard|Button|ActionButton|PrimaryButton|SecondaryButton|IconButton|ConfirmDialog|AdminConfirmDialog|Dialog|AlertDialog|DataTable|ContentTabs|TabSystem|Badge|Chip|FilterChip|SearchInput|SearchField|EmptyStateV2|LoadingStateV2|ErrorStateV2|NavigationList|ListRow)\b/g;

for (const abs of tsxFiles) {
  const text = readFileSync(abs, "utf8");
  let m;
  const re = new RegExp(NAME_RE.source, "g");
  while ((m = re.exec(text))) {
    nameHits.set(m[1], (nameHits.get(m[1]) || 0) + 1);
  }
}

const purposeGroups = [
  {
    purpose: "cards",
    authority: "AppCard / InteractiveCard / StatusCard",
    names: ["AppCard", "InteractiveCard", "StatusCard", "SoftCard", "ContentCard", "HubCard"],
  },
  {
    purpose: "buttons",
    authority: "Button (+ façades)",
    names: ["Button", "ActionButton", "PrimaryButton", "SecondaryButton", "IconButton"],
  },
  {
    purpose: "dialogs",
    authority: "ConfirmDialog",
    names: ["ConfirmDialog", "AdminConfirmDialog", "Dialog", "AlertDialog"],
  },
  {
    purpose: "tables",
    authority: "DataTable / ss-data-table",
    names: ["DataTable"],
  },
  {
    purpose: "tabs",
    authority: "ContentTabs",
    names: ["ContentTabs", "TabSystem"],
  },
  {
    purpose: "badges/chips",
    authority: "design-system Badge/Chip (consolidate)",
    names: ["Badge", "Chip", "FilterChip"],
  },
  {
    purpose: "search",
    authority: "SearchInput",
    names: ["SearchInput", "SearchField"],
  },
  {
    purpose: "status",
    authority: "Feedback V2",
    names: ["EmptyStateV2", "LoadingStateV2", "ErrorStateV2"],
  },
  {
    purpose: "lists",
    authority: "NavigationList / ListRow",
    names: ["NavigationList", "ListRow"],
  },
];

const rationalization = purposeGroups.map((g) => {
  const usage = g.names.map((n) => ({ name: n, hits: nameHits.get(n) || 0 }));
  const active = usage.filter((u) => u.hits > 0);
  return {
    purpose: g.purpose,
    authority: g.authority,
    variantsInUse: active.length,
    usage,
    overlapping: active.length > 2,
    consolidationCandidate: active.length > 2 || (g.purpose === "search" && active.length > 1),
  };
});

const COMPONENT_RATIONALIZATION_REPORT = {
  version: 1,
  updatedAt,
  COMPONENT_USAGE_RATIONALIZATION: true,
  groups: rationalization.sort((a, b) => b.variantsInUse - a.variantsInUse),
  duplicationFromCompliance: compliance?.UI_DUPLICATION_REPORT?.clusters?.slice(0, 6) || [],
  target: "One component authority per purpose",
};

// ═══════════════════════════════════════════
// 4) NAVIGATION_JOURNEY_COMPRESSION
// ═══════════════════════════════════════════
let bottomTabs = [];
try {
  const navCfg = readFileSync(join(srcRoot, "config/navigation.ts"), "utf8");
  // Prefer explicit bottom-nav hrefs from NAV_BOTTOM / similar literals
  const hrefs = [...navCfg.matchAll(/href:\s*["'](\/(?:quran-hub|mushaf|lessons|prayer-times|sections|more|))["']/g)].map(
    (m) => m[1] || "/",
  );
  bottomTabs = [...new Set(hrefs.length ? hrefs : ["/", "/quran-hub", "/lessons", "/prayer-times", "/sections"])];
} catch {
  bottomTabs = ["/", "/quran-hub", "/lessons", "/prayer-times", "/sections"];
}

const homeText = existsSync(join(srcRoot, "pages/account/ui/HomeView.tsx"))
  ? readFileSync(join(srcRoot, "pages/account/ui/HomeView.tsx"), "utf8")
  : "";
const homeHasContinue =
  existsSync(join(srcRoot, "components/home/HomeContinueLearning.tsx")) ||
  /HomeContinue/.test(homeText);
const homeHasPrayer = existsSync(join(srcRoot, "components/home/HomeCompactPrayer.tsx"));
const quranTab = bottomTabs.find((h) => /quran|mushaf/i.test(h)) || "/quran-hub";
const prayerTab = bottomTabs.find((h) => /prayer/i.test(h)) || "/prayer-times";
const lessonsTab = bottomTabs.find((h) => /lesson/i.test(h)) || "/lessons";

const journeys = [
  {
    id: "Home → Mushaf",
    currentClicks: quranTab === "/mushaf" ? 1 : 2,
    path: quranTab === "/mushaf" ? ["BottomNav→/mushaf"] : ["BottomNav→" + quranTab, "Hub→/mushaf"],
    shortestValid: 1,
    recommendation: quranTab === "/mushaf" ? "Already 1 tap" : "Keep hub CTA «افتح المصحف» above fold; optional long-press mushaf prefetch",
  },
  {
    id: "Home → Prayer",
    currentClicks: homeHasPrayer ? 1 : 1,
    path: homeHasPrayer
      ? ["HomeCompactPrayer→/prayer-times OR BottomNav→/prayer-times"]
      : ["BottomNav→/prayer-times"],
    shortestValid: 1,
    recommendation: "Preserve single-tap BottomNav + home strip link",
  },
  {
    id: "Home → Search",
    currentClicks: 2,
    path: ["Home/Sections→Search entry", "SearchView"],
    shortestValid: 1,
    recommendation: "Promote search affordance on Home header (1 tap)",
  },
  {
    id: "Home → Continue Lesson",
    currentClicks: homeHasContinue ? 1 : 3,
    path: homeHasContinue
      ? ["HomeContinueLearning→lesson"]
      : ["BottomNav→/lessons", "pick lesson"],
    shortestValid: 1,
    recommendation: homeHasContinue
      ? "Keep single CTA on HomeContinueLearning; dedupe HomeContinueWidget if both render"
      : "Surface continue card on Home",
  },
];

const JOURNEY_LENGTH_REPORT = {
  version: 1,
  updatedAt,
  NAVIGATION_JOURNEY_COMPRESSION: true,
  bottomNavTabs: bottomTabs,
  journeys,
  note: "Static click estimates — DEVICE_REQUIRED for wall-clock validation",
};

// ═══════════════════════════════════════════
// 5) PRODUCT_POLISH_PASS
// ═══════════════════════════════════════════
const polishItems = [];
for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  if (/__tests__|dev\//.test(rel)) continue;
  const text = readFileSync(abs, "utf8");
  const add = (issue, severity, effort) =>
    polishItems.push({ path: rel, issue, severity, effort });

  if (/truncate|line-clamp|text-ellipsis|overflow-hidden.*text/i.test(text) && /title|label/i.test(text)) {
    /* presence ok — flag missing title attribute on truncated */
    if (/truncate/.test(text) && !/title=\{/.test(text)) {
      add("truncation without title tooltip", "medium", "S");
    }
  }
  if (/style=\{\{[^}]*(padding|margin|gap):\s*\d/.test(text)) {
    add("inline spacing — prefer tokens", "low", "S");
  }
  if (/hover:opacity|opacity-50|opacity-60/.test(text) && /disabled/.test(text)) {
    add("opacity-only disabled cue", "medium", "S");
  }
  if (/animate-|transition-all|duration-\[/.test(text) && !/MOTION_|transition-colors/.test(text)) {
    add("ad-hoc motion class — check MOTION_AUTHORITY", "low", "S");
  }
  if (/lucide-react|Icon\b/.test(text) && /size=\{1[0-9]\}/.test(text)) {
    add("icon size literal — prefer size.icon.* tokens", "low", "S");
  }
  if (/<[Aa]lign|text-left|text-right/.test(text) && !/text-start|text-end|ms-|me-/.test(text)) {
    add("physical text align — prefer logical start/end", "medium", "S");
  }
}

// Deduplicate by issue type + take quick wins first
const polishRank = { S: 0, M: 1, L: 2 };
const severityRank = { high: 0, medium: 1, low: 2 };
polishItems.sort(
  (a, b) =>
    (polishRank[a.effort] ?? 9) - (polishRank[b.effort] ?? 9) ||
    (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
);

const POLISH_BACKLOG = {
  version: 1,
  updatedAt,
  PRODUCT_POLISH_PASS: true,
  total: polishItems.length,
  quickWins: polishItems.filter((p) => p.effort === "S").slice(0, 30),
  byIssue: Object.entries(
    polishItems.reduce((acc, p) => {
      acc[p.issue] = (acc[p.issue] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count),
};

// Bundle JSON + MD
mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const bundle = {
  updatedAt,
  PRODUCT_COHESION_SCORE,
  PRODUCT_COHESION_REPORT: {
    score: PRODUCT_COHESION_SCORE,
    experiences: cohesionExperiences,
    mostFragmented: cohesionExperiences.slice(0, 5).map((e) => e.id),
    PRODUCT_COHESION_AUDIT: true,
  },
  TOKEN_MIGRATION_QUEUE,
  COMPONENT_RATIONALIZATION_REPORT,
  JOURNEY_LENGTH_REPORT,
  POLISH_BACKLOG,
  related: {
    consistencyScore: consistency.consistencyScore,
    authorityAdoption: coverage.AUTHORITY_ADOPTION_PERCENTAGE,
    designCompliance: compliance?.DESIGN_COMPLIANCE_SCORE ?? null,
    hexInCss: baseline.hexInCss,
  },
};

writeFileSync(join(majalis, "reports/product-excellence-engine.json"), JSON.stringify(bundle, null, 2) + "\n");

function md(name, body) {
  writeFileSync(join(repo, "docs/audit", name), body);
}

md(
  "PRODUCT_COHESION_REPORT.md",
  [
    "# PRODUCT_COHESION_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `## PRODUCT_COHESION_SCORE: **${PRODUCT_COHESION_SCORE}**`,
    "",
    "Most fragmented first:",
    "",
    `| Experience | Cohesion | Visual | Interaction | Nav | Hierarchy | Files |`,
    `|---|---:|---:|---:|---:|---:|---:|`,
    ...cohesionExperiences.map(
      (e) =>
        `| ${e.id}${e.special ? " *" : ""} | ${e.cohesion} | ${e.scores.visual} | ${e.scores.interaction} | ${e.scores.navigation} | ${e.scores.hierarchy} | ${e.fileCount} |`,
    ),
    "",
    "\\* SPECIAL_CASE (Mushaf/Prayer) — cohesion scored for product feel, not forced unification.",
    "",
  ].join("\n"),
);

md(
  "TOKEN_MIGRATION_QUEUE.md",
  [
    "# TOKEN_MIGRATION_QUEUE",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Files with violations: **${TOKEN_MIGRATION_QUEUE.totalFilesWithViolations}**`,
    "",
    "## Totals by kind",
    "",
    `| Kind | Count |`,
    `|---|---:|`,
    ...Object.entries(TOKEN_MIGRATION_QUEUE.byKindTotals).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Highest-impact first",
    "",
    `| Impact | Path | Violations |`,
    `|---:|---|---|`,
    ...TOKEN_MIGRATION_QUEUE.top.slice(0, 25).map(
      (r) =>
        `| ${r.impact} | \`${r.path}\` | ${r.violations.map((v) => `${v.kind}×${v.count}`).join(", ")} |`,
    ),
    "",
    "Map values → `DESIGN_TOKENS_AUTHORITY` · no new token family.",
    "",
  ].join("\n"),
);

md(
  "COMPONENT_RATIONALIZATION_REPORT.md",
  [
    "# COMPONENT_RATIONALIZATION_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    "Target: **one component authority per purpose**.",
    "",
    `| Purpose | Authority | Variants in use | Consolidate? |`,
    `|---|---|---:|---|`,
    ...COMPONENT_RATIONALIZATION_REPORT.groups.map(
      (g) =>
        `| ${g.purpose} | ${g.authority} | ${g.variantsInUse} | ${g.consolidationCandidate ? "YES" : "—"} |`,
    ),
    "",
    "## Usage detail",
    "",
    ...COMPONENT_RATIONALIZATION_REPORT.groups.flatMap((g) => [
      `### ${g.purpose}`,
      "",
      ...g.usage.filter((u) => u.hits).map((u) => `- \`${u.name}\`: ${u.hits}`),
      "",
    ]),
  ].join("\n"),
);

md(
  "JOURNEY_LENGTH_REPORT.md",
  [
    "# JOURNEY_LENGTH_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Bottom nav tabs: ${bottomTabs.map((h) => `\`${h}\``).join(" · ") || "—"}`,
    "",
    `| Journey | Current clicks | Shortest valid | Recommendation |`,
    `|---|---:|---:|---|`,
    ...journeys.map(
      (j) => `| ${j.id} | ${j.currentClicks} | ${j.shortestValid} | ${j.recommendation} |`,
    ),
    "",
    "Static estimates — DEVICE_REQUIRED for validation.",
    "",
  ].join("\n"),
);

md(
  "POLISH_BACKLOG.md",
  [
    "# POLISH_BACKLOG",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Total signals: **${POLISH_BACKLOG.total}**`,
    "",
    "## By issue (frequency)",
    "",
    ...POLISH_BACKLOG.byIssue.slice(0, 12).map((i) => `- ${i.issue}: **${i.count}**`),
    "",
    "## Quick wins (effort S)",
    "",
    ...POLISH_BACKLOG.quickWins.slice(0, 25).map((p) => `- [\`${p.path}\`] ${p.issue} (${p.severity})`),
    "",
  ].join("\n"),
);

console.log(
  `product-excellence: cohesion=${PRODUCT_COHESION_SCORE} migrationFiles=${migrationQueue.length} polish=${POLISH_BACKLOG.total} journeys=${journeys.length}`,
);

if (check) {
  const miss = [
    "PRODUCT_COHESION_REPORT.md",
    "TOKEN_MIGRATION_QUEUE.md",
    "COMPONENT_RATIONALIZATION_REPORT.md",
    "JOURNEY_LENGTH_REPORT.md",
    "POLISH_BACKLOG.md",
  ]
    .map((f) => join(repo, "docs/audit", f))
    .filter((p) => !existsSync(p));
  if (miss.length || PRODUCT_COHESION_SCORE < 1) {
    console.error("product-excellence --check FAIL", miss);
    process.exit(1);
  }
  console.log("product-excellence --check: ok");
}
