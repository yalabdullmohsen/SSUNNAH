/**
 * بوابة تميّز البحث BP–BT.
 * Run: node --import tsx src/lib/__tests__/search-excellence-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { normalizeArabic } from "@/shared/arabic-normalize";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

assert.ok(existsSync(resolve(root, "docs/design/SEARCH_EXCELLENCE_PROGRAM.md")));
assert.match(readRepo("docs/design/SEARCH_EXCELLENCE_PROGRAM.md"), /ARABIC_SEARCH_OPTIMIZATION/);
assert.match(readRepo("docs/design/SEARCH_EXCELLENCE_PROGRAM.md"), /SEARCH_HEALTH_SCORECARD/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:search-excellence"] || "", /search-excellence-engine/);
assert.match(pkg.scripts["test:design-governance"] || "", /test:search-excellence/);

// Canonical Arabic pairs (user-facing BP targets)
assert.equal(normalizeArabic("قرآن"), normalizeArabic("قران"));
assert.equal(normalizeArabic("إسلام"), normalizeArabic("اسلام"));
assert.equal(normalizeArabic("مسئول"), normalizeArabic("مسؤول"));
assert.equal(normalizeArabic("Quran"), normalizeArabic("quran"));

const run = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/search-excellence-engine.mjs", "--check"],
  { cwd: majalis, encoding: "utf8" },
);
assert.equal(run.status, 0, run.stderr || run.stdout);

for (const rel of [
  "docs/audit/ARABIC_SEARCH_NORMALIZATION_REPORT.md",
  "docs/audit/SEARCH_RELEVANCE_SCORECARD.md",
  "docs/audit/SEARCH_QUERY_HEATMAP.md",
  "docs/audit/SEARCH_COVERAGE_REPORT.md",
  "docs/audit/SEARCH_UX_IMPROVEMENT_PLAN.md",
  "docs/audit/ARABIC_SEARCH_INFRASTRUCTURE_REPORT.md",
  "docs/audit/SEARCH_HEALTH_SCORECARD.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
}

assert.ok(existsSync(resolve(majalis, "supabase/arabic_search_infrastructure_v2.sql")));
assert.ok(existsSync(resolve(majalis, "supabase/arabic_search_hadiths_sources_v3.sql")));
assert.ok(existsSync(resolve(majalis, "supabase/arabic_search_hadith_source_infra_v4.sql")));
assert.ok(
  existsSync(
    resolve(majalis, "supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql"),
  ),
);
assert.ok(existsSync(resolve(majalis, "supabase/arabic_search_hadith_source_infra_v4_rollback.sql")));
const infraSql = readMaj("supabase/arabic_search_infrastructure_v2.sql");
const infraV3 = readMaj("supabase/arabic_search_hadiths_sources_v3.sql");
const infraV4 = readMaj("supabase/arabic_search_hadith_source_infra_v4.sql");
assert.match(infraSql, /ar_normalize/);
assert.match(infraSql, /pg_trgm/);
assert.match(infraSql, /search_lessons/);
assert.match(infraSql, /search_vector/);
assert.match(infraSql, /gin_trgm_ops/);
assert.match(infraV3, /idx_hadiths_title_trgm/);
assert.match(infraV3, /idx_hadiths_narrator_trgm/);
assert.match(infraV3, /idx_hadiths_search_vector/);
assert.match(infraV3, /idx_sources_search_vector/);
assert.match(infraV3, /search_hadiths/);
assert.match(infraV3, /search_sources/);
assert.match(infraV3, /CREATE OR REPLACE VIEW public\.hadiths/);
assert.match(infraV3, /CREATE OR REPLACE VIEW public\.sources/);
assert.match(infraV3, /verified_hadith_items/);
assert.match(infraV3, /trusted_sources/);
assert.match(infraV4, /REQUIRES_EXPLICIT_APPROVAL/);
assert.match(infraV4, /STRICT/);
assert.match(infraV4, /SECURITY INVOKER/);
assert.match(infraV4, /relevance_score/);
assert.match(infraV4, /p_cursor_score/);
assert.match(infraV4, /idx_hadith_rel_verified_auth_collection/);
assert.match(infraV4, /setweight/);
assert.ok(
  existsSync(resolve(root, "docs/audit/ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE_REPORT.md")),
);

const bundle = JSON.parse(readMaj("reports/search-excellence-engine.json"));
assert.equal(bundle.ARABIC_SEARCH_NORMALIZATION_REPORT.ARABIC_SEARCH_OPTIMIZATION, true);
assert.equal(bundle.SEARCH_RELEVANCE_SCORECARD.SEARCH_RELEVANCE_ENGINE_AUDIT, true);
assert.equal(bundle.SEARCH_QUERY_HEATMAP.SEARCH_QUERY_PERFORMANCE, true);
assert.equal(bundle.SEARCH_COVERAGE_REPORT.SEARCH_INDEX_COVERAGE, true);
assert.equal(bundle.SEARCH_UX_IMPROVEMENT_PLAN.SEARCH_UX_OPTIMIZATION, true);
assert.equal(bundle.ARABIC_SEARCH_INFRASTRUCTURE_REPORT.ARABIC_SEARCH_INFRASTRUCTURE_HARDENING, true);
assert.equal(bundle.ARABIC_SEARCH_INFRASTRUCTURE_REPORT.artifacts.arNormalizeSql, true);
assert.match(
  bundle.ARABIC_SEARCH_INFRASTRUCTURE_REPORT.latencyBenchmark,
  /NOT_CONNECTED/,
);
assert.equal(bundle.SEARCH_HEALTH_SCORECARD.SEARCH_EXCELLENCE_CERTIFICATION, true);
assert.ok(bundle.SEARCH_COVERAGE_REPORT.docsTotal >= 1000);
assert.ok(
  ["EXCELLENT", "GOOD", "PARTIAL", "NEEDS_WORK"].includes(
    bundle.SEARCH_HEALTH_SCORECARD.overallRating,
  ),
);
assert.equal(bundle.ARABIC_SEARCH_NORMALIZATION_REPORT.pairsFailed, 0);

assert.match(readRepo("docs/audit/SEARCH_HEALTH_SCORECARD.md"), /EXCELLENT|GOOD|PARTIAL|NEEDS_WORK/);
assert.match(readRepo("docs/audit/SEARCH_QUERY_HEATMAP.md"), /NOT_MEASURED/);

console.log(
  `search-excellence-gate: ok (${bundle.SEARCH_HEALTH_SCORECARD.overallScore}/${bundle.SEARCH_HEALTH_SCORECARD.overallRating} docs=${bundle.SEARCH_COVERAGE_REPORT.docsTotal} relevance=${bundle.SEARCH_RELEVANCE_SCORECARD.passRate}%)`,
);
