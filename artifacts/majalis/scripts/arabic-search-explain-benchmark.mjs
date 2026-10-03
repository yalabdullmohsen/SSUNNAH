#!/usr/bin/env node
/**
 * Staging/local EXPLAIN harness for hadith/source Arabic search.
 * Never targets Production automatically.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/arabic-search-explain-benchmark.mjs
 * Without env → writes NOT_CONNECTED report and exits 0.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(majalis, "../..");
const outPath = join(repo, "docs/audit/ARABIC_HADITH_SOURCE_EXPLAIN_REPORT.md");
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

const queries = [
  { name: "exact_title", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('باب النية', 20)` },
  { name: "no_tashkeel", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('القران', 20)` },
  { name: "hamza_variant", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('اسلام', 20)` },
  { name: "typo", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('النيات', 20)` },
  { name: "narrator", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('عمر', 20)` },
  { name: "source_name", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('البخاري', 20)` },
  { name: "partial_matn", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('انما الاعمال', 20)` },
  { name: "empty", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('', 20)` },
  { name: "short", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('1', 20)` },
  { name: "sources_name", sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_sources('اسلام', 20)` },
];

mkdirSync(dirname(outPath), { recursive: true });

if (!dbUrl) {
  const md = [
    "# ARABIC_HADITH_SOURCE_EXPLAIN_REPORT",
    "",
    "REAL_SCHEMA_DISCOVERED: yes",
    "Status: **NOT_CONNECTED**",
    "PRODUCTION_MIGRATION_APPLIED: false",
    "REQUIRES_EXPLICIT_APPROVAL: true",
    "",
    "No DATABASE_URL / SUPABASE_DB_URL in environment.",
    "EXPLAIN (ANALYZE, BUFFERS) intentionally skipped (local/staging only).",
    "",
    "## Planned cases",
    ...queries.map((q) => `- ${q.name}`),
    "",
    "Re-run on Staging:",
    "```bash",
    "DATABASE_URL=... node artifacts/majalis/scripts/arabic-search-explain-benchmark.mjs",
    "```",
    "",
  ].join("\n");
  writeFileSync(outPath, md);
  console.log("arabic-search-explain: NOT_CONNECTED → wrote report");
  process.exit(0);
}

// Optional dependency: pg — only when connected
let Client;
try {
  ({ Client } = await import("pg"));
} catch {
  writeFileSync(
    outPath,
    [
      "# ARABIC_HADITH_SOURCE_EXPLAIN_REPORT",
      "",
      "Status: **DRIVER_MISSING** (package `pg` not installed)",
      "REQUIRES_EXPLICIT_APPROVAL: true",
      "PRODUCTION_MIGRATION_APPLIED: false",
      "",
    ].join("\n"),
  );
  console.log("arabic-search-explain: DRIVER_MISSING");
  process.exit(0);
}

const client = new Client({ connectionString: dbUrl });
await client.connect();
const lines = [
  "# ARABIC_HADITH_SOURCE_EXPLAIN_REPORT",
  "",
  `Updated: ${new Date().toISOString()}`,
  "Environment: STAGING_OR_LOCAL (caller-provided URL)",
  "PRODUCTION_MIGRATION_APPLIED: false",
  "REQUIRES_EXPLICIT_APPROVAL: true",
  "",
];

for (const q of queries) {
  try {
    const res = await client.query(q.sql);
    const plan = res.rows?.[0]?.["QUERY PLAN"] ?? res.rows?.[0];
    const json = typeof plan === "string" ? JSON.parse(plan) : plan;
    const root = Array.isArray(json) ? json[0] : json;
    const exec = root?.["Execution Time"] ?? root?.Plan?.["Actual Total Time"];
    const shared = root?.Plan?.["Shared Hit Blocks"] ?? "n/a";
    lines.push(`## ${q.name}`);
    lines.push(`- execution_ms: ${exec}`);
    lines.push(`- shared_hit_blocks: ${shared}`);
    lines.push(`- plan_node: ${root?.Plan?.["Node Type"] ?? "unknown"}`);
    lines.push("");
  } catch (e) {
    lines.push(`## ${q.name}`);
    lines.push(`- error: ${e.message}`);
    lines.push("");
  }
}

await client.end();
writeFileSync(outPath, lines.join("\n"));
console.log("arabic-search-explain: wrote", outPath);
