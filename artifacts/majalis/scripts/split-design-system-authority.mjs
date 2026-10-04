#!/usr/bin/env node
/**
 * Partition design-system.css into authority files by exact original line ranges.
 * Does not rewrite rule bodies. Runtime order is declared by the barrel @import graph.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const majalis = resolve(here, "..");
const repo = resolve(majalis, "../..");
const srcRoot = resolve(majalis, "src");
const dsPath = resolve(srcRoot, "styles/design-system.css");
const stylesRoot = resolve(srcRoot, "styles");

const original = readFileSync(dsPath, "utf8");
const lines = original.endsWith("\n") ? original.slice(0, -1).split("\n") : original.split("\n");
const lineCount = lines.length;

/** @type {Array<[string, number, number]>} dest, start (1-based), end inclusive */
const SLICES = [
  ["FOUNDATION", 1, 50],
  ["features/legacy-surfaces.css", 51, 86],
  ["FOUNDATION", 87, 122],
  ["components/cards.css", 123, 144],
  ["FOUNDATION", 145, 208],
  ["features/legacy-surfaces.css", 209, 216],
  ["components/buttons.css", 217, 265],
  ["components/forms.css", 266, 285],
  ["FOUNDATION", 286, 318],
  ["components/empty-states.css", 319, 326],
  ["FOUNDATION", 327, 362],
  ["features/home.css", 363, 374],
  ["features/legacy-surfaces.css", 375, 401],
  ["features/auth.css", 402, 422],
  ["features/admin.css", 423, 427],
  ["FOUNDATION", 428, 432],
  ["features/home.css", 433, 437],
  ["features/search.css", 438, 448],
  ["features/legacy-surfaces.css", 449, 453],
  ["FOUNDATION", 454, 481],
  ["components/stats.css", 482, 501],
  ["components/search-ui.css", 502, 523],
  ["components/chips.css", 524, 554],
  ["components/cards.css", 555, 656],
  ["components/chips.css", 657, 707],
  ["features/legacy-surfaces.css", 708, 821],
  ["features/search.css", 822, 934],
  ["features/legacy-surfaces.css", 935, 989],
  ["features/admin.css", 990, 1000],
  ["features/legacy-surfaces.css", 1001, 1010],
  ["components/pagination.css", 1011, 1039],
  ["features/legacy-surfaces.css", 1040, 1082],
  ["FOUNDATION", 1083, 1088],
  ["components/chips.css", 1089, 1101],
  ["FOUNDATION", 1102, 1209],
  ["components/stats.css", 1210, 1258],
  ["FOUNDATION", 1259, 1276],
  ["components/cards.css", 1277, 1282],
  ["features/search.css", 1283, 1301],
  ["FOUNDATION", 1302, 1328],
  ["features/admin.css", 1329, 1367],
  ["features/auth.css", 1368, 1421],
  ["features/home.css", 1422, 1836],
  ["features/tasbih.css", 1837, 2101],
  ["features/user-stats.css", 2102, 2157],
  ["features/tasbih.css", 2158, 2162],
  ["components/buttons.css", 2163, 2174],
  ["features/tasbih.css", 2175, 2253],
  ["features/legacy-surfaces.css", 2254, 2269],
  ["features/learning-seasons.css", 2270, 2348],
  ["features/legacy-surfaces.css", 2349, 2350],
  ["features/tawhid.css", 2351, 2570],
  ["FOUNDATION", 2571, 2988],
  ["features/home.css", 2989, 3066],
  ["features/legacy-surfaces.css", 3067, 3147],
];

function sliceText(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function assertPartition() {
  let next = 1;
  const seen = [];
  for (const [dest, start, end] of SLICES) {
    if (start !== next) {
      throw new Error(`Gap/overlap before ${dest} ${start}-${end}; expected start ${next}`);
    }
    if (end < start) throw new Error(`Bad range ${dest} ${start}-${end}`);
    seen.push([dest, start, end]);
    next = end + 1;
  }
  if (next !== lineCount + 1) {
    throw new Error(`Partition end ${next - 1} != file lines ${lineCount}`);
  }
  const rebuilt =
    SLICES.map(([, s, e]) => sliceText(s, e)).join("\n") + (original.endsWith("\n") ? "\n" : "");
  if (rebuilt !== original) {
    throw new Error("Partition rebuild !== original design-system.css");
  }
}

assertPartition();

const FILE_HEADERS = {
  "components/cards.css": "DS component authority — cards (rule text unchanged from design-system.css).",
  "components/buttons.css": "DS component authority — buttons (rule text unchanged).",
  "components/forms.css": "DS component authority — forms (rule text unchanged).",
  "components/chips.css": "DS component authority — chips / filter panels (rule text unchanged).",
  "components/badges.css": "DS component authority — badges. revelation-badge remains in features/legacy-surfaces.css (KEEP_COMPATIBILITY, same computed rules).",
  "components/stats.css": "DS component authority — stats rows / .ds-stat (rule text unchanged).",
  "components/pagination.css": "DS component authority — pagination (rule text unchanged).",
  "components/empty-states.css": "DS component authority — empty states (rule text unchanged).",
  "components/search-ui.css": "DS component authority — generic search inputs (not search-page*).",
  "features/search.css": "DS feature authority — search-page / search-results / search-filters / search-topic.",
  "features/home.css": "DS feature authority — hcp / home-about / home-kicker / ds-quiz-home-card / hpv4 / hcz.",
  "features/tasbih.css": "DS feature authority — tc-* / tasbih-*.",
  "features/tawhid.css": "DS feature authority — tawheed-*.",
  "features/learning-seasons.css": "DS feature authority — lsw-*.",
  "features/user-stats.css": "DS feature authority — user-stat* / user-stats*.",
  "features/auth.css": "DS feature authority — login-oauth* and login-card. Generic .login-submit remains in buttons.css (KEEP_COMPATIBILITY).",
  "features/admin.css": "DS feature authority — admin-*.",
  "features/legacy-surfaces.css": "DS feature authority — unlisted page surfaces moved out of foundation (revelation, fiqh-comparative, lessons-v2, miracles, quran stories, am-*, adhan keyframes). KEEP_TEMPORARILY until per-route owners absorb them.",
};

const buckets = new Map();
for (const [dest, start, end] of SLICES) {
  if (!buckets.has(dest)) buckets.set(dest, []);
  buckets.get(dest).push({ start, end, text: sliceText(start, end) });
}

function banner(rel, extra = "") {
  return `/**\n * ${FILE_HEADERS[rel] || rel}\n * Extracted by exact line partition from design-system.css. Do not restyle.\n${extra} */\n\n`;
}

for (const [rel, parts] of buckets) {
  if (rel === "FOUNDATION") continue;
  const abs = resolve(stylesRoot, rel);
  mkdirSync(dirname(abs), { recursive: true });
  const body = parts.map((p) => p.text).join("\n");
  writeFileSync(abs, banner(rel, ` * Original lines: ${parts.map((p) => `${p.start}-${p.end}`).join(", ")}.\n`) + body.replace(/\n+$/, "") + "\n");
}

const badgesPath = resolve(stylesRoot, "components/badges.css");
writeFileSync(
  badgesPath,
  banner("components/badges.css") +
    "/* No exclusive DS badge block remained after Wave 1A.\n" +
    "   .revelation-badge* stays in features/legacy-surfaces.css to avoid splitting its original cluster.\n" +
    "   This file is the component-authority slot; do not add restyled duplicates. */\n",
);

const foundationParts = buckets.get("FOUNDATION");
const foundationBody = foundationParts.map((p) => p.text).join("\n");

const IMPORTS = [
  "./components/cards.css",
  "./components/buttons.css",
  "./components/forms.css",
  "./components/chips.css",
  "./components/badges.css",
  "./components/stats.css",
  "./components/pagination.css",
  "./components/empty-states.css",
  "./components/search-ui.css",
  "./features/home.css",
  "./features/auth.css",
  "./features/admin.css",
  "./features/search.css",
  "./features/tasbih.css",
  "./features/user-stats.css",
  "./features/learning-seasons.css",
  "./features/tawhid.css",
  "./features/legacy-surfaces.css",
];

const barrel = `/**
 * Majlis Design System — FOUNDATION AUTHORITY + explicit import graph.
 *
 * Runtime cascade (Vite inlines @import into this deferred sheet):
 *   COMPONENTS → FEATURES → FOUNDATION (this file, including v5 tokens + premium seal)
 *
 * Foundation stays last so existing winners are preserved:
 *   html / :root v5 / body line-height / .ds-card / .ds-btn / heading color / .ds-stat
 * Feature files must consume tokens, never redefine them.
 *
 * Original lines kept in this file: ${foundationParts.map((p) => `${p.start}-${p.end}`).join(", ")}.
 * Do not reorder @import statements without a selector-competition review.
 */

${IMPORTS.map((s) => `@import "${s}";`).join("\n")}

${foundationBody.replace(/\n+$/, "")}
`;

writeFileSync(dsPath, barrel);

/* ── inventory ── */
const CLASS_RE = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
const TOKEN_DEF_RE = /(--(?:ds|mj|msk|sf|ss)-[a-z0-9-]+)\s*:/gi;

function classesIn(text) {
  const set = new Set();
  let m;
  const copy = text.replace(/\/\*[\s\S]*?\*\//g, "");
  CLASS_RE.lastIndex = 0;
  while ((m = CLASS_RE.exec(copy))) set.add(m[1]);
  return [...set];
}

function classify(name, dest) {
  if (/^(tc-|tasbih-)/.test(name) || dest.includes("tasbih")) return "TASBIH_FEATURE";
  if (/^tawheed-/.test(name) || dest.includes("tawhid")) return "TAWHID_FEATURE";
  if (/^(hcp-|hcz-|hpv4-|home-|ds-quiz-home|site-footer-email)/.test(name) || dest.includes("features/home")) return "HOME_FEATURE";
  if (/^lsw-/.test(name) || dest.includes("learning-seasons")) return "LEARNING_SEASONS_FEATURE";
  if (/^user-stat/.test(name) || dest.includes("user-stats")) return "USER_STATS_FEATURE";
  if (/^(login-|auth-)/.test(name) || dest.includes("features/auth")) return "AUTH_FEATURE";
  if (/^admin-/.test(name) || dest.includes("features/admin")) return "ADMIN_FEATURE";
  if (/^(search-page|search-result|search-filter|search-topic|search-toolbar)/.test(name) || dest.includes("features/search")) return "SEARCH";
  if (/^(ds-page-search|page-search|content-hub-search|quran-search)/.test(name)) return "SEARCH";
  if (dest.includes("search-ui")) return "SEARCH";
  if (/^(ds-card|ui-card|page-card|library-card)/.test(name)) return "COMPONENT";
  if (/^(ds-btn|ui-card-btn|page-action-btn|citation-btn)/.test(name)) return "COMPONENT";
  if (/^(ds-input|login-field)/.test(name)) return "COMPONENT";
  if (/^(page-chip|content-hub-chip|ds-filter)/.test(name)) return "COMPONENT";
  if (/^(ds-stat|page-stats|ruling-stats)/.test(name)) return "COMPONENT";
  if (/ruling-pagination/.test(name)) return "COMPONENT";
  if (/^(ds-empty|ds-skeleton)/.test(name)) return "COMPONENT";
  if (/^(ds-page|page-shell|ds-section|ds-grid|content-hub)/.test(name)) return "LAYOUT";
  if (/^(navbar|bottom-nav|site-brand)/.test(name)) return "NAVIGATION";
  if (/^(reading-|article|seo-listing)/.test(name)) return "CONTENT_PROSE";
  if (dest === "FOUNDATION") return "FOUNDATION";
  if (dest.includes("components/")) return "COMPONENT";
  if (dest.includes("features/")) return "UTILITY";
  return "UTILITY";
}

function walk(dir, acc = []) {
  for (const ent of readdirSync(dir)) {
    if (ent === "node_modules" || ent === "dist" || ent === "coverage") continue;
    const p = join(dir, ent);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else {
      const ext = extname(p);
      if ([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".md"].includes(ext)) acc.push(p);
    }
  }
  return acc;
}

const consumerFiles = walk(srcRoot).filter((p) => p !== dsPath);
const consumerCache = new Map();
for (const p of consumerFiles) {
  try {
    consumerCache.set(p, readFileSync(p, "utf8"));
  } catch {
    /* ignore */
  }
}

function countConsumers(cls) {
  const needle = cls;
  let tsx = 0;
  let css = 0;
  let dyn = 0;
  const tsxHits = [];
  const cssHits = [];
  const dynHits = [];
  const classToken = new RegExp(`(?:^|["'\`\\s.=])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:["'\`\\s]|$)`);
  for (const [p, text] of consumerCache) {
    if (!text.includes(needle)) continue;
    const rel = relative(srcRoot, p);
    const isCss = p.endsWith(".css");
    const isTs = /\.(tsx|ts|jsx|js)$/.test(p);
    if (isCss && classToken.test(text)) {
      css++;
      cssHits.push(rel);
    } else if (isTs && classToken.test(text)) {
      tsx++;
      tsxHits.push(rel);
    } else if (isTs) {
      dyn++;
      dynHits.push(rel);
    }
  }
  return { tsx, css, dyn, tsxHits: tsxHits.slice(0, 8), cssHits: cssHits.slice(0, 8), dynHits: dynHits.slice(0, 8) };
}

const selectorRows = [];
const destOfClass = new Map();
for (const [dest, start, end] of SLICES) {
  const text = sliceText(start, end);
  for (const cls of classesIn(text)) {
    if (!destOfClass.has(cls)) destOfClass.set(cls, []);
    destOfClass.get(cls).push({ dest, start, end });
  }
}

const authorityTarget = {
  FOUNDATION: "styles/design-system.css",
  COMPONENT: "styles/components/*",
  LAYOUT: "styles/design-system.css (BASE_LAYOUT / PAGE_SHELL)",
  NAVIGATION: "styles/design-system.css premium seal (chrome colors only)",
  SEARCH: "styles/features/search.css",
  CONTENT_PROSE: "styles/design-system.css (prose rhythm)",
  HOME_FEATURE: "styles/features/home.css",
  TASBIH_FEATURE: "styles/features/tasbih.css",
  TAWHID_FEATURE: "styles/features/tawhid.css",
  ADMIN_FEATURE: "styles/features/admin.css",
  AUTH_FEATURE: "styles/features/auth.css",
  USER_STATS_FEATURE: "styles/features/user-stats.css",
  LEARNING_SEASONS_FEATURE: "styles/features/learning-seasons.css",
  UTILITY: "styles/features/legacy-surfaces.css",
  DEAD: "delete only with DEAD_WITH_PROOF",
};

for (const [cls, locs] of [...destOfClass.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const dest = locs[0].dest;
  const cat = classify(cls, dest);
  const c = countConsumers(cls);
  const total = c.tsx + c.css + c.dyn;
  let dead = "ACTIVE";
  if (total === 0) dead = "KEEP_TEMPORARILY";
  if (c.dyn > 0 && c.tsx === 0) dead = "DYNAMIC";
  selectorRows.push({
    selector: `.${cls}`,
    category: cat,
    file: dest === "FOUNDATION" ? "styles/design-system.css" : `styles/${dest}`,
    lines: locs.map((l) => `${l.start}-${l.end}`).join(", "),
    tsx: c.tsx,
    css: c.css,
    dyn: c.dyn,
    consumers: total,
    status: dead,
    duplication: locs.length > 1 || destOfClass.get(cls).length > 1 ? "MULTI_BLOCK" : "SINGLE",
    authority: authorityTarget[cat] || dest,
  });
}

const tokenDefs = [];
{
  let m;
  const re = /(--(?:ds|mj|msk|sf|ss)-[a-z0-9-]+)\s*:/gi;
  while ((m = re.exec(original))) {
    const idx = original.slice(0, m.index).split("\n").length;
    tokenDefs.push({ name: m[1], line: idx });
  }
}
const tokenDup = new Map();
for (const t of tokenDefs) {
  if (!tokenDup.has(t.name)) tokenDup.set(t.name, []);
  tokenDup.get(t.name).push(t.line);
}

const inventoryDir = resolve(repo, "docs/design");
mkdirSync(inventoryDir, { recursive: true });

const invMd = `# DESIGN_SYSTEM_SELECTOR_INVENTORY

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Source | \`artifacts/majalis/src/styles/design-system.css\` |
| Initial lines | 3147 |
| Initial bytes | 85391 |
| Phase | 0 — live inventory after exact-line partition |

CONSUMER METHOD: literal class token search across \`artifacts/majalis/src\` (\`.ts/.tsx/.js/.css\`). DYNAMIC = string/template hit without a class-attribute token. KEEP_TEMPORARILY = zero hits; **not deleted** (Phase 6: NO_UNPROVEN_CSS_DELETION).

## Totals

| Category | Selectors |
|---|---:|
${[...selectorRows.reduce((m, r) => m.set(r.category, (m.get(r.category) || 0) + 1), new Map())]
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}
| ALL | ${selectorRows.length} |

## Selectors

| Selector | Category | File | Lines | TSX | CSS | Dynamic | Consumers | Status | Dup | Authority target |
|---|---|---|---|---:|---:|---:|---:|---|---|---|
${selectorRows
  .map(
    (r) =>
      `| \`${r.selector}\` | ${r.category} | \`${r.file}\` | ${r.lines} | ${r.tsx} | ${r.css} | ${r.dyn} | ${r.consumers} | ${r.status} | ${r.duplication} | ${r.authority} |`,
  )
  .join("\n")}
`;

writeFileSync(resolve(inventoryDir, "DESIGN_SYSTEM_SELECTOR_INVENTORY.md"), invMd);

const dupTokens = [...tokenDup.entries()].filter(([, ls]) => ls.length > 1);
const tokenMd = `# TOKEN_AUTHORITY_REPORT

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Scope | \`design-system.css\` foundation + extracted consumers |
| Rule | Foundation tokens remain in design-system authority. Feature files may consume, not redefine. |

## Families declared in the original mega-file

| Prefix | Definition count |
|---|---:|
| \`--ds-*\` | ${tokenDefs.filter((t) => t.name.startsWith("--ds-")).length} |
| \`--mj-*\` | ${tokenDefs.filter((t) => t.name.startsWith("--mj-")).length} |
| \`--msk-*\` | ${tokenDefs.filter((t) => t.name.startsWith("--msk-")).length} |
| \`--sf-*\` | ${tokenDefs.filter((t) => t.name.startsWith("--sf-")).length} |
| \`--ss-*\` | ${tokenDefs.filter((t) => t.name.startsWith("--ss-")).length} |

DS file **consumes** \`--mj-*\` / \`--msk-*\` / \`--sf-*\` / \`--ss-*\` via \`var()\` but does not own their literals (owners: \`index.css\`, \`theme-aliases.css\`, \`sunnah-foundation-tokens.css\`).

## Duplicated definitions inside the original file (shadow / cascade)

| Token | Lines | Resolution |
|---|---|---|
${dupTokens.map(([n, ls]) => `| \`${n}\` | ${ls.join(", ")} | FOUNDATION_WINNER — last \`:root\` (v5 @ 1103) wins; earlier alias kept as compatibility bridge |`).join("\n") || "| — | — | none |"}

## Compatibility bridges (keep)

- \`--ds-emerald\` → \`var(--msk-gold, var(--mj-brand))\`
- \`--ds-radius\` → \`var(--radius-control, 0.875rem)\`
- \`--ds-radius-xl\` / \`--card-radius\` → \`var(--radius-card, 1.5rem)\`
- Early \`:root\` (lines 17–24) aliases \`--card-radius\`, \`--card-padding\`, \`--mobile-gap\` — shadowed by v5; kept because consumers may read them before/after v5 in the same sheet after inlining.

## Feature redefinition check

After extraction, feature CSS must not contain \`:root { --ds-*\` or \`:root { --mj-*\` declarations. Enforced by \`css-authority-graph-gate\`.
`;

writeFileSync(resolve(inventoryDir, "TOKEN_AUTHORITY_REPORT.md"), tokenMd);

writeFileSync(
  resolve(majalis, "reports/design-system-selector-inventory.json"),
  JSON.stringify(
    {
      source: "src/styles/design-system.css",
      initialLines: 3147,
      initialBytes: 85391,
      selectors: selectorRows,
      tokenDefs,
      duplicatedTokens: Object.fromEntries(dupTokens),
    },
    null,
    2,
  ),
);

console.log("partition ok");
console.log("selectors", selectorRows.length);
console.log("foundation bytes", Buffer.byteLength(barrel));
console.log("out files", [...buckets.keys()].filter((k) => k !== "FOUNDATION").length + 1);
