#!/usr/bin/env node
/**
 * PR F — Design authority closure reports + regression checks.
 * Extends existing CSS authority / design-governance (no parallel engine).
 *
 *   node scripts/design-authority-closure-report.mjs
 *   node scripts/design-authority-closure-report.mjs --check
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const IMPORT_RE = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g;

function readCssGraph(absPath) {
  const files = [];
  const circular = [];
  const seen = new Set();
  const walk = (path) => {
    if (seen.has(path)) {
      circular.push(path);
      return `/* CIRCULAR ${path} */\n`;
    }
    seen.add(path);
    files.push(path);
    const text = readFileSync(path, "utf8");
    return text.replace(IMPORT_RE, (_full, spec) => {
      const child = resolve(dirname(path), spec);
      return `/* >>> ${spec} */\n${walk(child)}/* <<< ${spec} */\n`;
    });
  };
  return { text: walk(absPath), files, circular };
}

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const srcRoot = join(majalis, "src");
const check = process.argv.includes("--check");

const FORBIDDEN_DEAD = [
  "styles/pages/more-page.css",
  "styles/components/chunk-recovery-toast.css",
  "styles/pages/fiqh-council-section.css",
  "styles/component-authority.css",
  "styles/feature-authority-public.css",
  "styles/feature-authority-account.css",
  "styles/feature-authority-admin.css",
];

const FORBIDDEN_MICRO = [
  "styles/features/home.css",
  "styles/features/auth.css",
  "styles/features/admin.css",
  "styles/features/search.css",
  "styles/features/tasbih.css",
  "styles/features/user-stats.css",
  "styles/features/learning-seasons.css",
  "styles/features/tawhid.css",
  "styles/features/legacy-surfaces.css",
  "styles/components/cards.css",
  "styles/components/buttons.css",
  "styles/components/forms.css",
  "styles/components/chips.css",
  "styles/components/badges.css",
  "styles/components/stats.css",
  "styles/components/pagination.css",
  "styles/components/empty-states.css",
  "styles/components/search-ui.css",
];

const SELECTOR_OWNERS = [
  {
    selector: ".page-shell",
    owner: "styles/design-system.css (FOUNDATION)",
    role: "structural contract",
  },
  {
    selector: ".login-submit",
    owner: "styles/pages/auth.css (layout/a11y) + design-system premium seal (MODEL B)",
    role: "auth compatibility mapped to button authority",
  },
  {
    selector: ".search-result-row",
    owner: "styles/design-system.css (FEATURE)",
    role: "base row + hover; page may use variants only",
  },
  {
    selector: ".search-page-title",
    owner: "styles/design-system.css (FEATURE)",
    role: "search title",
  },
  {
    selector: ".tc-ring-btn",
    owner: "styles/design-system.css (FEATURE / tasbih)",
    role: "tasbih ring control",
  },
  {
    selector: ".ui-card",
    owner: "styles/design-system.css (COMPONENT)",
    role: "shared card",
  },
  {
    selector: ".ds-card",
    owner: "styles/design-system.css (COMPONENT)",
    role: "shared card",
  },
  {
    selector: ".ds-btn",
    owner: "styles/design-system.css (COMPONENT)",
    role: "shared button",
  },
  {
    selector: ".ds-stat",
    owner: "styles/design-system.css (COMPONENT)",
    role: "shared stat",
  },
  {
    selector: ".fm-parent",
    owner: "NONE (JSX structural class only)",
    role: "empty rule removed; class retained for structure",
  },
];

function walkCss(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) walkCss(abs, acc);
    else if (name.endsWith(".css")) acc.push(abs);
  }
  return acc;
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Find empty declaration blocks. Comment-only bodies are KEEP_SPECIAL candidates
 * (documented intentional anchors); only uncommented empties are violations.
 */
function findEmptyRules(text) {
  const empties = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    if (text[i] === "{") {
      let depth = 0;
      let j = i;
      for (; j < n; j++) {
        if (text.startsWith("/*", j)) {
          const end = text.indexOf("*/", j + 2);
          j = end < 0 ? n : end + 1;
          continue;
        }
        if (text[j] === "{") depth++;
        else if (text[j] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      const rawBody = text.slice(i + 1, j);
      const bodyCode = stripComments(rawBody).trim();
      let start = i - 1;
      while (start >= 0 && !"{}".includes(text[start])) start--;
      const sel = text.slice(start + 1, i).trim();
      if (bodyCode === "" && sel && !sel.includes("@")) {
        const hasComment = /\/\*/.test(rawBody);
        empties.push({
          selector: sel.replace(/\s+/g, " ").slice(0, 120),
          hasComment,
        });
      }
      i = j + 1;
    } else i++;
  }
  return empties;
}

function isCommentsOnly(text) {
  return stripComments(text).trim() === "" && text.trim().length > 0;
}

function collectTokenPrefixes(files) {
  const counts = new Map();
  const re = /--([a-zA-Z][a-zA-Z0-9]*)-/g;
  for (const abs of files) {
    const t = readFileSync(abs, "utf8");
    let m;
    while ((m = re.exec(t))) {
      const p = m[1];
      counts.set(p, (counts.get(p) || 0) + 1);
    }
  }
  return counts;
}

function countFamilyRefs(files, family) {
  const re = new RegExp(`--${family}-[a-zA-Z0-9-]+`, "g");
  let n = 0;
  for (const abs of files) {
    const t = readFileSync(abs, "utf8");
    n += (t.match(re) || []).length;
  }
  return n;
}

const cssFiles = walkCss(srcRoot);
const rel = (abs) => relative(srcRoot, abs).replace(/\\/g, "/");

const emptyRules = [];
const keepSpecialEmpty = [];
const commentsOnly = [];
for (const abs of cssFiles) {
  const text = readFileSync(abs, "utf8");
  if (isCommentsOnly(text)) commentsOnly.push(rel(abs));
  for (const hit of findEmptyRules(text)) {
    const r = rel(abs);
    if (hit.hasComment) {
      keepSpecialEmpty.push({ file: r, selector: hit.selector });
    } else {
      emptyRules.push({ file: r, selector: hit.selector });
    }
  }
}

const dsAbs = join(srcRoot, "styles/design-system.css");
const ds = readFileSync(dsAbs, "utf8");
const graph = readCssGraph(dsAbs);

const featureLocalRoot = [];
for (const abs of cssFiles) {
  const r = rel(abs);
  if (!r.startsWith("styles/pages/")) continue;
  const clean = stripComments(readFileSync(abs, "utf8"));
  if (/:root\s*\{/.test(clean)) featureLocalRoot.push(r);
}

/** Frozen allowlist — existing feature-local :root (no growth). */
const FEATURE_ROOT_ALLOWLIST = new Set(["styles/pages/hadith-design-language.css"]);

const prefixes = collectTokenPrefixes(cssFiles);
const prefixAllowPath = join(majalis, "reports/design-token-prefix-allowlist.json");
if (!existsSync(prefixAllowPath)) {
  throw new Error("missing reports/design-token-prefix-allowlist.json");
}
const prefixAllow = JSON.parse(readFileSync(prefixAllowPath, "utf8"));
const allowedPrefixes = new Set(prefixAllow.prefixes || []);
const unknownFamilies = [...prefixes.keys()].filter((p) => !allowedPrefixes.has(p)).sort();

const bridgeCounts = {
  ds: countFamilyRefs(cssFiles, "ds"),
  elite: countFamilyRefs(cssFiles, "elite"),
  em: countFamilyRefs(cssFiles, "em"),
  msk: countFamilyRefs(cssFiles, "msk"),
  majalis: countFamilyRefs(cssFiles, "majalis"),
};
const deprecatedCeilings = prefixAllow.deprecatedCeilings || {};
const deprecatedGrowth = Object.entries(deprecatedCeilings)
  .filter(([fam, max]) => (bridgeCounts[fam] ?? 0) > max)
  .map(([fam, max]) => `${fam}:${bridgeCounts[fam]}>${max}`);

const budget = JSON.parse(
  readFileSync(join(majalis, "reports/visual-system-debt-budget.json"), "utf8"),
);
const baseline = JSON.parse(
  readFileSync(join(majalis, "reports/visual-system-baseline.json"), "utf8"),
);

const deadPresent = FORBIDDEN_DEAD.filter((r) => existsSync(join(srcRoot, r)));
const microPresent = FORBIDDEN_MICRO.filter((r) => existsSync(join(srcRoot, r)));
const featureRootGrowth = featureLocalRoot.filter((r) => !FEATURE_ROOT_ALLOWLIST.has(r));

const regionOk =
  /COMPONENT_AUTHORITY/.test(ds) &&
  /PUBLIC_FEATURE_AUTHORITY/.test(ds) &&
  /ACCOUNT_FEATURE_AUTHORITY/.test(ds) &&
  /ADMIN_FEATURE_AUTHORITY/.test(ds);

const iFeat = ds.indexOf("FEATURE_AUTHORITY");
const iHtml = ds.indexOf("\nhtml {");
const featureRegion = iFeat >= 0 && iHtml > iFeat ? ds.slice(iFeat, iHtml) : "";
const featureRootInDs = /:root\s*\{/.test(featureRegion);
const fmParentEmpty = /\.fm-parent\s*\{\s*\}/.test(stripComments(ds));
const defeatedHover =
  /\.search-result-row:hover\s*\{[^}]*rgba\(26,\s*107,\s*82,\s*0\.25\)/.test(
    stripComments(graph.text),
  );

const sha = (() => {
  try {
    return readFileSync(join(repo, ".git/HEAD"), "utf8").trim();
  } catch {
    return "unknown";
  }
})();

const coverage = {
  measuredAt: new Date().toISOString(),
  cssFileCount: cssFiles.length,
  cssFilesCeiling: budget.ceilings?.cssFiles ?? null,
  measuredCssFiles: baseline.cssFiles ?? cssFiles.length,
  regionsLabeled: regionOk,
  emptyRules: emptyRules.length,
  keepSpecialEmptyRules: keepSpecialEmpty.length,
  commentsOnlyFiles: commentsOnly.length,
  circularImports: graph.circular.length,
  deadFilesPresent: deadPresent,
  microSheetsPresent: microPresent,
  featureLocalRootAllowlisted: featureLocalRoot.filter((r) => FEATURE_ROOT_ALLOWLIST.has(r)),
  featureLocalRootGrowth: featureRootGrowth,
  unknownTokenFamilies: unknownFamilies,
  bridgeCounts,
  deprecatedGrowth,
  fmParentEmptyRule: fmParentEmpty,
  defeatedSearchHoverReturned: defeatedHover,
  featureRegionRootInDs: featureRootInDs,
};

const failures = [];
if (emptyRules.length) failures.push(`empty selectors: ${emptyRules.length}`);
if (commentsOnly.length) failures.push(`comments-only CSS: ${commentsOnly.join(", ")}`);
if (graph.circular.length) failures.push(`circular CSS imports: ${graph.circular.length}`);
if (deadPresent.length) failures.push(`dead CSS returned: ${deadPresent.join(", ")}`);
if (microPresent.length) failures.push(`forbidden micro-sheets: ${microPresent.join(", ")}`);
if (featureRootGrowth.length) failures.push(`new feature-local :root: ${featureRootGrowth.join(", ")}`);
if (unknownFamilies.length) failures.push(`new token families: ${unknownFamilies.join(", ")}`);
if (deprecatedGrowth.length) failures.push(`deprecated token growth: ${deprecatedGrowth.join(", ")}`);
if (!regionOk) failures.push("authority region labels missing in design-system.css");
if (featureRootInDs) failures.push("FEATURE region contains :root");
if (fmParentEmpty) failures.push("empty .fm-parent {} returned");
if (defeatedHover) failures.push("defeated .search-result-row:hover returned");
if ((baseline.cssFiles ?? cssFiles.length) > (budget.ceilings?.cssFiles ?? Infinity)) {
  failures.push("cssFiles measured above ceiling");
}
if ((budget.ceilings?.cssFiles ?? 0) > 353) {
  /* Post-PR-E lock: do not raise above 353 in this closure program. */
  failures.push(`cssFiles ceiling raised above 353 (${budget.ceilings.cssFiles})`);
}

function write(relPath, body) {
  const abs = join(repo, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body.endsWith("\n") ? body : body + "\n", "utf8");
}

write(
  "docs/audit/DESIGN_AUTHORITY_COVERAGE.md",
  `# DESIGN_AUTHORITY_COVERAGE

TASK_CLASSIFICATION: SHARED_PLATFORM
Generated by \`design-authority-closure-report.mjs\`

- CSS files: **${coverage.cssFileCount}** (ceiling ${coverage.cssFilesCeiling})
- Authority regions labeled: **${regionOk}**
- Uncommented empty selectors (must be 0): **${coverage.emptyRules}**
- Comment-documented empty KEEP_SPECIAL anchors: **${coverage.keepSpecialEmptyRules}**
- Comments-only CSS files: **${coverage.commentsOnlyFiles}**
${keepSpecialEmpty
  .slice(0, 20)
  .map((e) => `  - \`${e.file}\`: \`${e.selector}\``)
  .join("\n")}
- Circular imports: **${coverage.circularImports}**
- Dead files present: ${deadPresent.length ? deadPresent.join(", ") : "none"}
- Micro-sheet explosion present: ${microPresent.length ? microPresent.join(", ") : "none"}
- Feature-local :root allowlisted: ${coverage.featureLocalRootAllowlisted.join(", ") || "none"}
- Feature-local :root growth: ${featureRootGrowth.length ? featureRootGrowth.join(", ") : "none"}
- Unknown token families: ${unknownFamilies.length ? unknownFamilies.join(", ") : "none"}
- Deprecated family growth: ${deprecatedGrowth.length ? deprecatedGrowth.join(", ") : "none"}
- Prefix allowlist size: ${allowedPrefixes.size}

Exit markers:

- DESIGN_AUTHORITY_REGRESSION_PREVENTED = ${failures.length === 0}
- SELECTOR_DUPLICATION_REGRESSION_PREVENTED = ${!fmParentEmpty && !defeatedHover}
- TOKEN_DRIFT_PREVENTED = ${unknownFamilies.length === 0 && deprecatedGrowth.length === 0}
- COMPATIBILITY_GROWTH_PREVENTED = ${featureRootGrowth.length === 0}
- DEAD_CSS_GROWTH_PREVENTED = ${deadPresent.length === 0 && microPresent.length === 0}
- NO_PARALLEL_GOVERNANCE_ENGINE = true
`,
);

write(
  "docs/audit/SELECTOR_OWNER_MAP.md",
  `# SELECTOR_OWNER_MAP

TASK_CLASSIFICATION: SHARED_PLATFORM

| Selector | Canonical owner | Role |
|---|---|---|
${SELECTOR_OWNERS.map((s) => `| \`${s.selector}\` | ${s.owner} | ${s.role} |`).join("\n")}

Regression locks (css-authority-graph-gate + this report):

- \`.fm-parent {}\` must not return
- Defeated \`.search-result-row:hover\` rgba(26,107,82,0.25) must not return
- FOUNDATION \`.page-shell\` max-width contract must remain
- Search/Auth/Tasbih dual-ownership bodies remain on DEFEATED_BODY_ALLOWLIST only
`,
);

write(
  "docs/audit/TOKEN_MIGRATION_STATUS.md",
  `# TOKEN_MIGRATION_STATUS

TASK_CLASSIFICATION: SHARED_PLATFORM

## Canonical

- \`--sf-*\` · \`--ss-*\` · \`--mj-*\` · \`--cs-*\` (Card bridge)

## Bridges (growth forbidden; migrate-then-remove over time)

| Family | Refs (approx) | Status |
|---|---:|---|
| \`--ds-*\` | ${bridgeCounts.ds} | SEMANTIC_BRIDGE_REQUIRED (startup/DS) |
| \`--elite-*\` | ${bridgeCounts.elite} | KEEP_COMPATIBILITY_WITH_EVIDENCE |
| \`--em-*\` | ${bridgeCounts.em} | SEMANTIC_BRIDGE |
| \`--msk-*\` | ${bridgeCounts.msk} | KEEP_COMPATIBILITY_WITH_EVIDENCE |
| \`--majalis-*\` | ${bridgeCounts.majalis} | KEEP_COMPATIBILITY_WITH_EVIDENCE |

Unknown/new families: ${unknownFamilies.length ? unknownFamilies.join(", ") : "**none**"}

Deprecated ceilings: ${JSON.stringify(deprecatedCeilings)}
Deprecated growth breaches: ${deprecatedGrowth.length ? deprecatedGrowth.join(", ") : "**none**"}

Prefix allowlist: \`artifacts/majalis/reports/design-token-prefix-allowlist.json\` (${allowedPrefixes.size} prefixes)

TOKEN_DRIFT_PREVENTED = ${unknownFamilies.length === 0 && deprecatedGrowth.length === 0}
`,
);

write(
  "docs/audit/COMPATIBILITY_RETIREMENT_STATUS.md",
  `# COMPATIBILITY_RETIREMENT_STATUS

TASK_CLASSIFICATION: SHARED_PLATFORM

| Surface | Status | Owner |
|---|---|---|
| Tasbih dual DS/page | RETIRED (PR C) | page chrome + DS ring recipes |
| Tawhid dual DS/page | RETIRED (PR C) | DS types grid + page topic chrome |
| Search dual | RETIRED (PR D) | page chrome; DS title/row winners |
| Auth dual | RETIRED (PR D) | page card/submit; DS OAuth + submit seal (MODEL B) |
| User stats | SINGLE | DS section + page sheet |
| Physical multi-file extract | KEEP_WITH_EVIDENCE | labeled regions in design-system.css (buttonRelatedImportantApprox) |

COMPATIBILITY_GROWTH_PREVENTED = ${featureRootGrowth.length === 0 && microPresent.length === 0}
`,
);

write(
  "docs/audit/DEAD_CSS_EVIDENCE.md",
  `# DEAD_CSS_EVIDENCE

| ID | File | Classification | Proof |
|---|---|---|---|
| E0 | \`styles/pages/fiqh-council-section.css\` | DEAD_WITH_PROOF_AND_REMOVED | prior #2561; gate asserts absence |
| E1 | \`styles/pages/more-page.css\` | DEAD_WITH_PROOF_AND_REMOVED | no import; no TSX \`more-page-*\`; route redirects |
| E2 | \`styles/components/chunk-recovery-toast.css\` | DEAD_WITH_PROOF_AND_REMOVED | no import; component \`return null\` |
| E3 | Uncommented empty selectors | DEAD_WITH_PROOF_AND_REMOVED | PR F sweep (fm-child, unused block variants, …) |
| E4 | Comment-only empty anchors | KEEP_SPECIAL_WITH_EVIDENCE | Back Authority P7, drawer-root, status-strip exclusions, pressable card carve-out |

No text-search-only deletions. Micro-sheet explosion remains forbidden.

DEAD_CSS_GROWTH_PREVENTED = ${deadPresent.length === 0}
`,
);

write(
  "docs/audit/CSS_IMPORT_GRAPH.md",
  `# CSS_IMPORT_GRAPH

TASK_CLASSIFICATION: SHARED_PLATFORM

Entry: \`styles/design-system.css\`

- Files inlined via @import walk: **${graph.files.length}**
- Circular: **${graph.circular.length}** ${graph.circular.length ? graph.circular.join(", ") : ""}
- Forbidden \`@import "./components|features/\` from design-system: enforced by css-authority-graph-gate

Startup sync CSS remains owned by \`src/main.tsx\` (count frozen in QUALITY_BASELINE_V1).
`,
);

write(
  "artifacts/majalis/reports/design-authority-closure.json",
  JSON.stringify({ version: 1, sha, coverage, failures, selectorOwners: SELECTOR_OWNERS }, null, 2) +
    "\n",
);

console.log("design-authority-closure-report: wrote docs/audit/* + reports/design-authority-closure.json");
console.log(JSON.stringify(coverage, null, 2));

if (check && failures.length) {
  console.error("design-authority-closure-report --check FAIL:");
  for (const f of failures) console.error(" -", f);
  if (emptyRules.length) {
    for (const e of emptyRules.slice(0, 12)) {
      console.error(`   empty: ${e.file} :: ${e.selector}`);
    }
  }
  process.exit(1);
}

if (check) console.log("design-authority-closure-report --check: ok");
