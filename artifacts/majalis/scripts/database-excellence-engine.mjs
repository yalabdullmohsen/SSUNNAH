#!/usr/bin/env node
/**
 * Database Excellence Engine (Phase BK–BO).
 * Static schema + client query audit. Live pg_stat = NOT_CONNECTED unless env provided.
 *
 *   node scripts/database-excellence-engine.mjs
 *   node scripts/database-excellence-engine.mjs --check
 *
 * Outputs:
 *   DATABASE_HEATMAP_REPORT
 *   QUERY_OPTIMIZATION_QUEUE
 *   INDEX_AUTHORITY_REPORT
 *   CACHE_OPTIMIZATION_PLAN
 *   SUNNAH_DATABASE_HEALTH_SCORECARD
 */
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
const updatedAt = new Date().toISOString();

const liveDb = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);

function walk(dir, pred, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
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

function countRe(text, re) {
  return (text.match(re) || []).length;
}

const sqlRoots = [
  join(majalis, "supabase"),
  join(repo, "supabase"),
  join(repo, "artifacts/supabase"),
].filter(existsSync);

const sqlFiles = sqlRoots.flatMap((r) => walk(r, (n) => n.endsWith(".sql")));
const tsFiles = walk(srcRoot, (n) => n.endsWith(".ts") || n.endsWith(".tsx"));

// ── Schema scan ──
let createTable = 0;
let createIndex = 0;
let createUniqueIndex = 0;
let enableRls = 0;
let createPolicy = 0;
let ginTrigram = 0;
let fts = 0;
let partialIndex = 0;
const indexNames = new Map();
const tableNames = new Set();
const rlsFiles = [];
const indexFiles = [];
const openPolicies = [];

const openAllRe =
  /for\s+all(?![^\n;]{0,80}to\s+service_role)\s+using\s*\(\s*true\s*\)/gi;

for (const abs of sqlFiles) {
  const base = abs.split(/[/\\]/).pop();
  const sql = readFileSync(abs, "utf8");
  const ct = countRe(sql, /create\s+table\b/gi);
  const ci = countRe(sql, /create\s+(unique\s+)?index\b/gi);
  const cu = countRe(sql, /create\s+unique\s+index\b/gi);
  const rls = countRe(sql, /enable\s+row\s+level\s+security/gi);
  const pol = countRe(sql, /create\s+policy\b/gi);
  createTable += ct;
  createIndex += ci;
  createUniqueIndex += cu;
  enableRls += rls;
  createPolicy += pol;
  ginTrigram += countRe(sql, /gin_trgm_ops|pg_trgm/gi);
  fts += countRe(sql, /to_tsvector|tsvector|websearch_to_tsquery/gi);
  partialIndex += countRe(sql, /create\s+index[\s\S]{0,200}\bwhere\s+/gi);

  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?["']?([a-zA-Z0-9_]+)/gi)) {
    tableNames.add(m[1].toLowerCase());
  }
  for (const m of sql.matchAll(
    /create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?(?:concurrently\s+)?["']?([a-zA-Z0-9_]+)/gi,
  )) {
    const name = m[1].toLowerCase();
    indexNames.set(name, (indexNames.get(name) || 0) + 1);
  }
  if (ci) indexFiles.push({ file: base, indexes: ci });
  if (rls || pol) rlsFiles.push({ file: base, enableRls: rls, policies: pol });

  if (base !== "20260729_enterprise_phase5_hardening.sql") {
    const danger = sql.match(openAllRe) || [];
    for (const d of danger) {
      openPolicies.push({ file: base, snippet: d.replace(/\s+/g, " ").slice(0, 100) });
    }
  }
}

const duplicateIndexDefs = [...indexNames.entries()].filter(([, n]) => n > 1).slice(0, 30);

// ── Client query scan ──
const SURFACE_RE = [
  { id: "Home", re: /pages\/account\/ui\/Home|components\/home\// },
  { id: "Quran Hub", re: /pages\/quran\/|quran-hub/i },
  { id: "Mushaf", re: /mushaf|Mushaf/ },
  { id: "Prayer", re: /prayer|adhan/i },
  { id: "Search", re: /[Ss]earch|unified-search/ },
  { id: "Lessons", re: /lessons|lesson-/ },
  { id: "Library", re: /library|vault|cms\// },
  { id: "Account", re: /account\/|profiles|user-progress|vault/ },
  { id: "Admin", re: /admin-v3\/|learning-paths-admin|categories-admin|cms\// },
];

const queryHits = [];
const selectStar = [];
const missingLimit = [];
const fromTables = new Map();
let useQueryCount = 0;
let staleTimeHits = 0;
let channelCount = 0;
let subscribeCount = 0;

for (const abs of tsFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  if (/__tests__|\.test\.|\/tests\//.test(rel)) continue;
  const text = readFileSync(abs, "utf8");

  useQueryCount += countRe(text, /\buseQuery\s*\(/g) + countRe(text, /\buseInfiniteQuery\s*\(/g);
  if (/staleTime\s*:/.test(text)) staleTimeHits++;
  channelCount += countRe(text, /\.channel\s*\(/g);
  subscribeCount += countRe(text, /\.subscribe\s*\(/g);

  const fromMatches = [...text.matchAll(/\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g)];
  for (const m of fromMatches) {
    const table = m[1];
    fromTables.set(table, (fromTables.get(table) || 0) + 1);
  }

  const starMatches = [...text.matchAll(/\.select\(\s*["'`]\*["'`]\s*\)/g)];
  for (const m of starMatches) {
    // find nearby .from(
    const before = text.slice(Math.max(0, m.index - 200), m.index);
    const tableM = before.match(/\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g);
    const table = tableM ? tableM[tableM.length - 1].match(/["'`]([^"'`]+)["'`]/)?.[1] : "?";
    selectStar.push({ path: rel, table: table || "?", lineHint: text.slice(0, m.index).split("\n").length });
  }

  // .from().select(...) without .limit/.range/.maybeSingle/.single in same chain window
  for (const m of fromMatches) {
    const window = text.slice(m.index, m.index + 280);
    if (!/\.select\s*\(/.test(window)) continue;
    const hasBound =
      /\.limit\s*\(/.test(window) ||
      /\.range\s*\(/.test(window) ||
      /\.maybeSingle\s*\(/.test(window) ||
      /\.single\s*\(/.test(window) ||
      /\.select\(\s*["'`][^"'`]*["'`]\s*,\s*\{\s*count:/i.test(window);
    if (!hasBound && /\.select\(\s*["'`]\*/.test(window)) {
      missingLimit.push({ path: rel, table: m[1], reason: "select(*) without limit/range/single in chain window" });
    }
  }

  if (fromMatches.length) {
    const surfaces = SURFACE_RE.filter((s) => s.re.test(rel)).map((s) => s.id);
    queryHits.push({
      path: rel,
      fromCount: fromMatches.length,
      selectStar: starMatches.length,
      surfaces: surfaces.length ? surfaces : ["Other"],
      weight: fromMatches.length * 2 + starMatches.length * 8,
    });
  }
}

queryHits.sort((a, b) => b.weight - a.weight);
const topTables = [...fromTables.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);

// Heatmap by surface
const heatmap = SURFACE_RE.map((s) => {
  const files = queryHits.filter((q) => q.surfaces.includes(s.id));
  const selectStarN = files.reduce((a, f) => a + f.selectStar, 0);
  const fromN = files.reduce((a, f) => a + f.fromCount, 0);
  return {
    surface: s.id,
    files: files.length,
    fromCalls: fromN,
    selectStar: selectStarN,
    // frequency proxy = fromCalls; cost proxy = selectStar*5 + fromCalls
    costProxy: selectStarN * 5 + fromN,
    frequencyProxy: fromN,
    latencyProxy: "NOT_CONNECTED — needs pg_stat_statements",
  };
}).sort((a, b) => b.costProxy - a.costProxy);

const DATABASE_HEATMAP_REPORT = {
  version: 1,
  updatedAt,
  DATABASE_PERFORMANCE_DEEP_AUDIT: true,
  connection: liveDb ? "ENV_PRESENT" : "NOT_CONNECTED",
  liveMetrics: liveDb
    ? "Run with DATABASE_URL to attach pg_stat (not implemented in this static engine)"
    : "NOT_CONNECTED — no DATABASE_URL / SUPABASE_DB_URL",
  schema: {
    sqlFiles: sqlFiles.length,
    createTableStatements: createTable,
    distinctTablesMentioned: tableNames.size,
    createIndexStatements: createIndex,
    createUniqueIndexStatements: createUniqueIndex,
    enableRlsStatements: enableRls,
    createPolicyStatements: createPolicy,
    ginTrigramMentions: ginTrigram,
    ftsMentions: fts,
    partialIndexMentions: partialIndex,
  },
  surfaces: heatmap,
  topClientTables: topTables.map(([table, count]) => ({ table, clientFromCount: count })),
  top20pctNote: "Client-side frequency/cost proxies only until pg_stat attached",
};

// Query optimization queue
const queue = [];
for (const s of selectStar) {
  queue.push({
    priority: "P0",
    kind: "select_star",
    path: s.path,
    table: s.table,
    action: "Replace select('*') with explicit columns",
  });
}
for (const m of missingLimit.slice(0, 40)) {
  queue.push({
    priority: "P1",
    kind: "unbounded_read",
    path: m.path,
    table: m.table,
    action: "Add .limit() / .range() / pagination",
  });
}
// N+1 heuristic: multiple .from in loops
for (const abs of tsFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  if (/__tests__|\.test\./.test(rel)) continue;
  const text = readFileSync(abs, "utf8");
  if (/for\s*\([^)]+\)\s*\{[\s\S]{0,400}\.from\(/.test(text) || /\.map\s*\(\s*async[\s\S]{0,300}\.from\(/.test(text)) {
    queue.push({
      priority: "P1",
      kind: "n_plus_one_suspect",
      path: rel,
      table: "?",
      action: "Batch fetch / join / .in() instead of per-item query",
    });
  }
}

const byPriority = { P0: 0, P1: 0, P2: 0 };
for (const q of queue) byPriority[q.priority] = (byPriority[q.priority] || 0) + 1;

const QUERY_OPTIMIZATION_QUEUE = {
  version: 1,
  updatedAt,
  SUPABASE_QUERY_OPTIMIZATION: true,
  counts: { total: queue.length, ...byPriority, selectStar: selectStar.length },
  items: queue.slice(0, 80),
  target: "Fetch only required columns and rows",
};

// Index authority
const INDEX_AUTHORITY_REPORT = {
  version: 1,
  updatedAt,
  DATABASE_INDEX_STRATEGY_REVIEW: true,
  inventory: {
    createIndexStatements: createIndex,
    uniqueIndexes: createUniqueIndex,
    partialIndexMentions: partialIndex,
    ginTrigramMentions: ginTrigram,
    ftsMentions: fts,
    duplicateIndexNameDefs: duplicateIndexDefs.length,
  },
  hotFilterMigrationPresent: sqlFiles.some((f) => /add_hot_filter_indexes/i.test(f)),
  fkIndexMigrationPresent: sqlFiles.some((f) => /add_missing_fk_indexes/i.test(f)),
  searchIndexPresent: sqlFiles.some((f) => /search_index/i.test(f)),
  duplicateIndexNameDefs: duplicateIndexDefs.slice(0, 20).map(([name, n]) => ({ name, defs: n })),
  topIndexFiles: indexFiles.sort((a, b) => b.indexes - a.indexes).slice(0, 15),
  recommendations: [
    "Prefer partial indexes on status IN (pending, failed) for queues",
    "Ensure FK columns used in joins have indexes (add_missing_fk_indexes_*)",
    "Search: keep pg_trgm / FTS on search_index — avoid select(*) on large corpora",
    "Unused indexes: DEVICE_REQUIRED via pg_stat_user_indexes",
  ],
  unusedIndexes: "NOT_CONNECTED",
};

// Cache plan
const queryClientPath = join(srcRoot, "lib/query-client.ts");
const queryClient = existsSync(queryClientPath) ? readFileSync(queryClientPath, "utf8") : "";
const CACHE_OPTIMIZATION_PLAN = {
  version: 1,
  updatedAt,
  DATA_CACHING_STRATEGY_REVIEW: true,
  reactQuery: {
    defaultsPresent: /staleTime/.test(queryClient),
    staleTimeMs: /staleTime:\s*([\d_]+)/.exec(queryClient)?.[1]?.replace(/_/g, "") || null,
    gcTimeMs: /gcTime:\s*([\d_]+)/.exec(queryClient)?.[1]?.replace(/_/g, "") || null,
    useQueryCallSitesApprox: useQueryCount,
    filesWithCustomStaleTime: staleTimeHits,
  },
  realtime: {
    channelCalls: channelCount,
    subscribeCalls: subscribeCount,
  },
  opportunities: [
    {
      area: "Lessons / content lists",
      action: "Ensure list queries share queryKeys + staleTime; avoid select(*)",
      priority: "P0",
    },
    {
      area: "Prayer",
      action: "Keep prayer computation local; cache location/day — avoid polling DB",
      priority: "P1",
    },
    {
      area: "Search",
      action: "Cache normalized query results briefly; prefer search_index over wide selects",
      priority: "P1",
    },
    {
      area: "Admin CRUD",
      action: "Invalidate targeted queryKeys only after mutations",
      priority: "P2",
    },
  ],
  duplicateFetchRisk: selectStar.length > 20 ? "HIGH" : "MODERATE",
};

// Health scorecard
function rate(score) {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "NEEDS_WORK";
  return "CRITICAL";
}

const dims = [
  {
    name: "performance",
    score: liveDb ? 70 : Math.max(35, 70 - Math.min(30, Math.round(selectStar.length / 2))),
    note: liveDb ? "env present" : "static proxies only",
  },
  {
    name: "indexes",
    score: Math.min(
      90,
      40 +
        (INDEX_AUTHORITY_REPORT.hotFilterMigrationPresent ? 15 : 0) +
        (INDEX_AUTHORITY_REPORT.fkIndexMigrationPresent ? 15 : 0) +
        (INDEX_AUTHORITY_REPORT.searchIndexPresent ? 10 : 0) +
        Math.min(10, Math.round(createIndex / 50)),
    ),
  },
  {
    name: "RLS",
    score: openPolicies.length
      ? 35
      : Math.min(88, 50 + Math.min(30, Math.round(createPolicy / 20)) + (enableRls > 0 ? 10 : 0)),
    note: openPolicies.length ? `${openPolicies.length} open FOR ALL USING(true)` : "policy audit pattern clean",
  },
  {
    name: "search",
    score: Math.min(85, 40 + (ginTrigram ? 20 : 0) + (fts ? 15 : 0) + (INDEX_AUTHORITY_REPORT.searchIndexPresent ? 15 : 0)),
  },
  {
    name: "realtime",
    score: channelCount + subscribeCount > 40 ? 55 : channelCount + subscribeCount > 10 ? 70 : 80,
    note: `channels=${channelCount} subscribe=${subscribeCount}`,
  },
  {
    name: "costs",
    score: Math.max(30, 85 - Math.min(40, selectStar.length) - Math.min(15, Math.round(topTables[0]?.[1] / 20 || 0))),
    note: "select(*) and hot table frequency as cost proxies",
  },
  {
    name: "schema_quality",
    score: Math.min(80, 45 + Math.min(20, Math.round(sqlFiles.length / 30)) - Math.min(15, duplicateIndexDefs.length)),
  },
  {
    name: "scalability",
    score: Math.max(
      35,
      75 -
        (selectStar.length > 30 ? 15 : 0) -
        (missingLimit.length > 20 ? 10 : 0) -
        (liveDb ? 0 : 10),
    ),
    note: "Needs pagination discipline + live stats",
  },
];

for (const d of dims) d.rating = rate(d.score);
const overall = Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length);
const overallRating = rate(overall);

const SUNNAH_DATABASE_HEALTH_SCORECARD = {
  version: 1,
  updatedAt,
  DATABASE_READINESS_CERTIFICATION: true,
  overallScore: overall,
  overallRating,
  dimensions: dims,
  nonClaims: [
    "NOT live pg_stat without DATABASE_URL",
    "Client proxies ≠ server latency",
    "No UNIFIED_100",
  ],
};

// Write
mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const bundle = {
  updatedAt,
  DATABASE_HEATMAP_REPORT,
  QUERY_OPTIMIZATION_QUEUE,
  INDEX_AUTHORITY_REPORT,
  CACHE_OPTIMIZATION_PLAN,
  SUNNAH_DATABASE_HEALTH_SCORECARD,
  rlsOpenPolicies: openPolicies,
};

writeFileSync(join(majalis, "reports/database-excellence-engine.json"), JSON.stringify(bundle, null, 2) + "\n");

function md(name, body) {
  writeFileSync(join(repo, "docs/audit", name), body);
}

md(
  "DATABASE_HEATMAP_REPORT.md",
  [
    "# DATABASE_HEATMAP_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Connection: **${DATABASE_HEATMAP_REPORT.connection}**`,
    "",
    "## Schema inventory (SQL migrations)",
    "",
    `| Metric | Value |`,
    `|---|---:|`,
    ...Object.entries(DATABASE_HEATMAP_REPORT.schema).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Surfaces (client cost/frequency proxies)",
    "",
    `| Surface | Files | from() | select(*) | costProxy |`,
    `|---|---:|---:|---:|---:|`,
    ...heatmap.map(
      (s) => `| ${s.surface} | ${s.files} | ${s.fromCalls} | ${s.selectStar} | ${s.costProxy} |`,
    ),
    "",
    "## Top client tables",
    "",
    ...topTables
      .slice(0, 15)
      .map(([t, c], i) => `${i + 1}. \`${t}\` — ${c} .from() refs`),
    "",
    "Live latency/seq scans: **NOT_CONNECTED** (attach DATABASE_URL + pg_stat_statements).",
    "",
  ].join("\n"),
);

md(
  "QUERY_OPTIMIZATION_QUEUE.md",
  [
    "# QUERY_OPTIMIZATION_QUEUE",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Total: **${queue.length}** · P0=${byPriority.P0 || 0} · P1=${byPriority.P1 || 0} · select(*)=${selectStar.length}`,
    "",
    `| Priority | Kind | Table | Path | Action |`,
    `|---|---|---|---|---|`,
    ...queue
      .slice(0, 40)
      .map((q) => `| ${q.priority} | ${q.kind} | \`${q.table}\` | \`${q.path}\` | ${q.action} |`),
    "",
    "Target: fetch only required columns and rows.",
    "",
  ].join("\n"),
);

md(
  "INDEX_AUTHORITY_REPORT.md",
  [
    "# INDEX_AUTHORITY_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `| Metric | Value |`,
    `|---|---:|`,
    ...Object.entries(INDEX_AUTHORITY_REPORT.inventory).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    `- Hot filter indexes migration: ${INDEX_AUTHORITY_REPORT.hotFilterMigrationPresent ? "✅" : "❌"}`,
    `- FK indexes migration: ${INDEX_AUTHORITY_REPORT.fkIndexMigrationPresent ? "✅" : "❌"}`,
    `- Search index SQL: ${INDEX_AUTHORITY_REPORT.searchIndexPresent ? "✅" : "❌"}`,
    "",
    "## Recommendations",
    "",
    ...INDEX_AUTHORITY_REPORT.recommendations.map((r) => `- ${r}`),
    "",
    "## Duplicate index name definitions (migration churn)",
    "",
    ...(INDEX_AUTHORITY_REPORT.duplicateIndexNameDefs.length
      ? INDEX_AUTHORITY_REPORT.duplicateIndexNameDefs.map((d) => `- \`${d.name}\` ×${d.defs}`)
      : ["- none detected"]),
    "",
    "Unused indexes: NOT_CONNECTED (pg_stat_user_indexes).",
    "",
  ].join("\n"),
);

md(
  "CACHE_OPTIMIZATION_PLAN.md",
  [
    "# CACHE_OPTIMIZATION_PLAN",
    "",
    `Generated: ${updatedAt}`,
    "",
    "## React Query",
    "",
    `| Field | Value |`,
    `|---|---|`,
    `| defaults present | ${CACHE_OPTIMIZATION_PLAN.reactQuery.defaultsPresent} |`,
    `| staleTime ms | ${CACHE_OPTIMIZATION_PLAN.reactQuery.staleTimeMs} |`,
    `| gcTime ms | ${CACHE_OPTIMIZATION_PLAN.reactQuery.gcTimeMs} |`,
    `| useQuery sites ≈ | ${CACHE_OPTIMIZATION_PLAN.reactQuery.useQueryCallSitesApprox} |`,
    `| custom staleTime files | ${CACHE_OPTIMIZATION_PLAN.reactQuery.filesWithCustomStaleTime} |`,
    `| duplicate fetch risk | ${CACHE_OPTIMIZATION_PLAN.duplicateFetchRisk} |`,
    "",
    "## Realtime",
    "",
    `- channel(): ${channelCount}`,
    `- subscribe(): ${subscribeCount}`,
    "",
    "## Opportunities",
    "",
    ...CACHE_OPTIMIZATION_PLAN.opportunities.map(
      (o) => `- **${o.priority}** ${o.area}: ${o.action}`,
    ),
    "",
  ].join("\n"),
);

md(
  "SUNNAH_DATABASE_HEALTH_SCORECARD.md",
  [
    "# SUNNAH_DATABASE_HEALTH_SCORECARD",
    "",
    `Generated: ${updatedAt}`,
    "",
    `## Overall: **${overall}** · **${overallRating}**`,
    "",
    `| Dimension | Score | Rating | Note |`,
    `|---|---:|---|---|`,
    ...dims.map((d) => `| ${d.name} | ${d.score} | ${d.rating} | ${d.note || ""} |`),
    "",
    "Ratings: EXCELLENT ≥85 · GOOD ≥70 · NEEDS_WORK ≥50 · CRITICAL <50",
    "",
    "## Non-claims",
    "",
    ...SUNNAH_DATABASE_HEALTH_SCORECARD.nonClaims.map((n) => `- ${n}`),
    "",
  ].join("\n"),
);

console.log(
  `database-excellence: health=${overall}/${overallRating} select*=${selectStar.length} sql=${sqlFiles.length} indexes=${createIndex} rlsPolicies=${createPolicy} openPolicies=${openPolicies.length} liveDb=${liveDb}`,
);

if (check) {
  const miss = [
    join(repo, "docs/audit/DATABASE_HEATMAP_REPORT.md"),
    join(repo, "docs/audit/QUERY_OPTIMIZATION_QUEUE.md"),
    join(repo, "docs/audit/INDEX_AUTHORITY_REPORT.md"),
    join(repo, "docs/audit/CACHE_OPTIMIZATION_PLAN.md"),
    join(repo, "docs/audit/SUNNAH_DATABASE_HEALTH_SCORECARD.md"),
    join(repo, "docs/design/DATABASE_EXCELLENCE_PROGRAM.md"),
    join(majalis, "reports/database-excellence-engine.json"),
  ].filter((p) => !existsSync(p));
  if (miss.length || overall < 1 || sqlFiles.length < 10) {
    console.error("database-excellence --check FAIL", { miss, sqlFiles: sqlFiles.length });
    process.exit(1);
  }
  if (openPolicies.length) {
    console.error("database-excellence --check FAIL: open RLS policies", openPolicies.length);
    process.exit(1);
  }
  console.log("database-excellence --check: ok");
}
