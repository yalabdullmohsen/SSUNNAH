/**
 * Static index↔query alignment for Arabic search v4.
 * Run: node --import tsx src/lib/__tests__/index-query-alignment-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const sql = readFileSync(
  resolve(majalis, "supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql"),
  "utf8",
);

const requiredIndexes = [
  "idx_hadith_rel_verified_auth_collection",
  "idx_hadith_rel_verified_collection_chapter",
  "idx_hadith_rel_verified_source_name",
  "idx_hadith_rel_verified_narrator",
  "idx_hadiths_title_trgm",
  "idx_hadiths_narrator_trgm",
  "idx_hadiths_search_trgm",
  "idx_hadiths_search_vector",
  "idx_sources_name_trgm",
  "idx_sources_search_trgm",
  "idx_sources_search_vector",
  "idx_trusted_sources_filter_active_category",
  "idx_trusted_sources_filter_active_type",
];
for (const idx of requiredIndexes) {
  assert.match(sql, new RegExp(`CREATE INDEX IF NOT EXISTS ${idx}`), idx);
}

// Expression alignment
assert.match(sql, /gin \(public\.ar_normalize\(title\) gin_trgm_ops\)/);
assert.match(sql, /gin \(search_text gin_trgm_ops\)/);
assert.match(sql, /gin \(search_vector\)/);
assert.match(sql, /to_tsvector\('simple'/);
assert.match(sql, /plainto_tsquery\('simple'/);
assert.match(sql, /verification_status = 'verified'/);
assert.match(sql, /deleted_at IS NULL/);
assert.match(sql, /coalesce\(s\.is_active, true\) = true|is_active/);

// No executable CONCURRENTLY in migration (comments/runbook refs allowed)
const concurrentExec = sql
  .split("\n")
  .filter((line) => !/^\s*--/.test(line) && /CREATE\s+INDEX\s+CONCURRENTLY/i.test(line));
assert.equal(concurrentExec.length, 0, `unexpected CONCURRENTLY lines: ${concurrentExec.join(" | ")}`);
assert.ok(
  existsSync(resolve(root, "docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md")),
);
assert.ok(existsSync(resolve(root, "docs/audit/QUERY_TO_INDEX_MATRIX.md")));
assert.match(
  readFileSync(resolve(root, "docs/audit/QUERY_TO_INDEX_MATRIX.md"), "utf8"),
  /PRODUCTION_INDEX_DELETION_NOT_PERFORMED:\s*true/,
);
assert.match(
  readFileSync(resolve(root, "docs/audit/QUERY_TO_INDEX_MATRIX.md"), "utf8"),
  /PENDING_LIVE_PROOF/,
);

console.log("index-query-alignment-gate: ok");
