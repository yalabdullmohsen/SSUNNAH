/**
 * ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE (v4) regression gate.
 * Run: node --import tsx src/lib/__tests__/arabic-hadith-source-search-v4.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeArabic } from "@/shared/arabic-normalize";
import {
  arNormalizeLite,
  keysetPage,
  rankHadithDocs,
  rankSourceDocs,
  scoreHadithDoc,
  scoreSourceDoc,
} from "@/lib/arabic-search-relevance";
import {
  isArabicSearchRpcMissingError,
  mapHadithRpcRowToSearchHit,
} from "@/lib/arabic-db-search";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const sqlPath = "supabase/arabic_search_hadith_source_infra_v4.sql";
const migPath = "supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql";
const rollbackPath = "supabase/arabic_search_hadith_source_infra_v4_rollback.sql";

assert.ok(existsSync(resolve(majalis, sqlPath)), sqlPath);
assert.ok(existsSync(resolve(majalis, migPath)), migPath);
assert.ok(existsSync(resolve(majalis, rollbackPath)), rollbackPath);
assert.ok(
  existsSync(resolve(root, "docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md")),
);

const sql = readMaj(sqlPath);
const rollback = readMaj(rollbackPath);

// ── Normalization authority ──
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.ar_normalize/);
assert.match(sql, /IMMUTABLE/);
assert.match(sql, /STRICT/);
assert.match(sql, /PARALLEL SAFE/);
assert.match(sql, /SET search_path = public/);
assert.match(sql, /pg_trgm/);

const pairs: Array<[string, string]> = [
  ["القُرآن", "القران"],
  ["إسلام", "اسلام"],
  ["الأذكار", "الاذكار"],
  ["مسؤول", "مسئول"],
  ["فتاوى", "فتاوي"],
];
for (const [a, b] of pairs) {
  assert.equal(normalizeArabic(a), normalizeArabic(b), `${a} ≡ ${b}`);
  assert.equal(arNormalizeLite(a), arNormalizeLite(b), `lite ${a} ≡ ${b}`);
}
assert.equal(
  normalizeArabic("نـــصٌ   مُكَرَّر"),
  normalizeArabic("نص مكرر"),
);

// ة→ه quality decision: KEEP (client parity). Compare keep vs drop-recall.
const withTaMarbuta = normalizeArabic("صلاة");
const withoutKeep = withTaMarbuta; // KEEP path → صلاه
assert.equal(withoutKeep, "صلاه");
const dropTa = "صلاة".replace(/ة/g, "ة"); // identity if we refused conversion
assert.notEqual(normalizeArabic("صلاه"), dropTa);
assert.equal(normalizeArabic("صلاة"), normalizeArabic("صلاه"));

// ── Real schema mapping (no invented FK indexes) ──
assert.match(sql, /verified_hadith_items/);
assert.match(sql, /trusted_sources/);
assert.doesNotMatch(sql, /CREATE INDEX[\s\S]{0,80}source_id/i);
assert.doesNotMatch(sql, /CREATE INDEX[\s\S]{0,80}narrator_id/i);
assert.doesNotMatch(sql, /CREATE TABLE[\s\S]{0,40}hadith_tags/i);
assert.match(sql, /No FK columns exist|no source_id\/narrator_id/i);
assert.match(sql, /idx_hadith_rel_verified_auth_collection/);
assert.match(sql, /idx_hadith_rel_verified_collection_chapter/);
assert.match(sql, /idx_hadith_rel_verified_source_name/);
assert.match(sql, /idx_hadith_rel_verified_narrator/);
assert.match(sql, /verification_status = 'verified'/);

// ── Trigram + FTS ──
assert.match(sql, /idx_hadiths_title_trgm/);
assert.match(sql, /idx_hadiths_narrator_trgm/);
assert.match(sql, /idx_hadiths_search_trgm/);
assert.match(sql, /idx_hadiths_search_vector/);
assert.match(sql, /idx_sources_name_trgm/);
assert.match(sql, /idx_sources_search_vector/);
assert.match(sql, /setweight/);
assert.match(sql, /to_tsvector\('simple'/);

// ── RPCs ──
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.search_hadiths/);
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.search_sources/);
assert.match(sql, /SECURITY INVOKER/);
assert.match(sql, /relevance_score/);
assert.match(sql, /matched_field/);
assert.match(sql, /cursor_score/);
assert.match(sql, /p_collection/);
assert.match(sql, /p_authenticity_class/);
assert.match(sql, /p_category/);
assert.doesNotMatch(sql, /RETURNS SETOF public\.verified_hadith_items/);
assert.doesNotMatch(sql, /SELECT \* FROM public\.verified_hadith_items/);

// Views without SELECT *
assert.match(sql, /CREATE OR REPLACE VIEW public\.hadiths AS/);
assert.match(sql, /CREATE OR REPLACE VIEW public\.sources AS/);
assert.doesNotMatch(sql, /VIEW public\.hadiths AS\s+SELECT \*/i);

// ── Rollback ──
assert.match(rollback, /DROP FUNCTION IF EXISTS public\.search_hadiths/);
assert.match(rollback, /DROP INDEX IF EXISTS public\.idx_hadiths_search_vector/);
assert.match(rollback, /REQUIRES_EXPLICIT_APPROVAL|ROLLBACK/);

// ── Relevance ranking (offline fixtures) ──
const fixtures = [
  {
    id: "a",
    title: "باب النية",
    text: "إنما الأعمال بالنيات",
    narrator: "عمر بن الخطاب",
    source_name: "صحيح البخاري",
    collection: "bukhari",
    hadith_number: "1",
  },
  {
    id: "b",
    title: "حديث آخر",
    text: "من حسن إسلام المرء",
    narrator: "أبو هريرة",
    source_name: "صحيح مسلم",
    collection: "muslim",
    hadith_number: "47",
  },
  {
    id: "c",
    title: "النيات",
    text: "نص جزئي عن النيات",
    narrator: "عائشة",
    source_name: "سنن الترمذي",
    collection: "tirmidhi",
    hadith_number: "9",
  },
];

const exactTitle = rankHadithDocs(fixtures, "باب النية");
assert.equal(exactTitle[0].id, "a");
assert.equal(exactTitle[0].matched_field, "title_exact");

const exactNumber = rankHadithDocs(fixtures, "1");
assert.equal(exactNumber[0].id, "a");
assert.ok(exactNumber[0].relevance_score >= 900);

const prefix = rankHadithDocs(fixtures, "باب");
assert.equal(prefix[0].id, "a");
assert.equal(prefix[0].matched_field, "title_prefix");

const narratorQ = rankHadithDocs(fixtures, "عمر بن الخطاب");
assert.equal(narratorQ[0].id, "a");

const sourceQ = rankHadithDocs(fixtures, "صحيح البخاري");
assert.equal(sourceQ[0].id, "a");

const typo = scoreHadithDoc(fixtures[0], "النيات");
assert.ok(typo.relevance_score > 0);

const empty = scoreHadithDoc(fixtures[0], "   ");
assert.equal(empty.matched_field, "empty");
assert.equal(empty.relevance_score, 0);

const short = rankHadithDocs(fixtures, "1");
assert.ok(short.length >= 1);

// Expanded relevance / normalization fixtures (Phase 6)
assert.equal(arNormalizeLite("القُرآن"), arNormalizeLite("القران"));
assert.equal(arNormalizeLite("نـــصٌ"), arNormalizeLite("نص"));
assert.equal(arNormalizeLite("فتاوى"), arNormalizeLite("فتاوي"));
assert.equal(arNormalizeLite("صلاة"), arNormalizeLite("صلاه")); // ة→ه KEEP
assert.equal(arNormalizeLite("  نية   صالحة  "), "نيه صالحه");
assert.ok(arNormalizeLite("١٢٣").length >= 0);
assert.ok(scoreHadithDoc(fixtures[0], "a").relevance_score >= 0); // latin mixed
assert.ok(rankHadithDocs(fixtures, "zzzz-no-hit-xyz")[0].relevance_score < 120);
assert.equal(rankHadithDocs(fixtures, "ن").length, fixtures.length); // one-char still ranks
// Ordering: title_exact > number > prefix
const orderDoc = [
  { id: "t", title: "باب الوضوء", text: "x", hadith_number: "99" },
  { id: "n", title: "غيره", text: "x", hadith_number: "باب الوضوء" },
  { id: "p", title: "باب الوضوء الطويل", text: "x", hadith_number: "7" },
];
const ordered = rankHadithDocs(orderDoc, "باب الوضوء");
assert.equal(ordered[0].id, "t");
assert.ok(ordered[0].relevance_score >= ordered[1].relevance_score);

// Source ranking (Phase 7)
const sources = [
  { id: "s1", name: "صحيح البخاري", category: "hadith", source_type: "book" },
  { id: "s2", name: "صحيح مسلم", category: "hadith", source_type: "book" },
  { id: "s3", name: "فتح الباري", category: "sharh", source_type: "book" },
];
const srcExact = rankSourceDocs(sources, "صحيح البخاري");
assert.equal(srcExact[0].id, "s1");
assert.equal(srcExact[0].matched_field, "name_exact");
const srcPrefix = rankSourceDocs(sources, "صحيح");
assert.ok(srcPrefix[0].relevance_score >= srcPrefix[1].relevance_score);
assert.equal(scoreSourceDoc(sources[0], "   ").matched_field, "empty");
assert.ok(existsSync(resolve(root, "docs/audit/QUERY_TO_INDEX_MATRIX.md")));

// SQL security static checks (Phase 5)
assert.match(sql, /SECURITY INVOKER/);
assert.doesNotMatch(sql, /SECURITY DEFINER/);
assert.match(sql, /SET search_path = public/);
assert.match(sql, /least\(|greatest\(/i);
assert.match(sql, /deleted_at IS NULL/);
assert.match(sql, /verification_status = 'verified'/);
assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.search_hadiths/);

// Pagination stability (no dupes / no loss across pages)
const ranked = rankHadithDocs(
  [
    ...fixtures,
    { id: "d", title: "نية", text: "نية", narrator: "سعد", source_name: "مسند", hadith_number: "2" },
    { id: "e", title: "نية صالحة", text: "نية", narrator: "علي", source_name: "مسند", hadith_number: "3" },
  ],
  "نية",
);
const page1 = keysetPage(ranked, 2, null);
assert.equal(page1.length, 2);
const page2 = keysetPage(ranked, 2, {
  score: page1[page1.length - 1].relevance_score,
  id: page1[page1.length - 1].id,
});
const ids = [...page1, ...page2].map((x) => x.id);
assert.equal(new Set(ids).size, ids.length, "no duplicate ids across pages");

assert.equal(
  mapHadithRpcRowToSearchHit({
    id: "h1",
    title: "t",
    text_snippet: "snippet",
    narrator: "n",
    source_name: "s",
    collection: "bukhari",
    chapter: null,
    hadith_number: "1",
    grade: "sahih",
    authenticity_class: "sahih",
    matched_field: "title",
    relevance_score: 100,
    cursor_score: 100,
    cursor_id: "h1",
  }).text,
  "snippet",
);
assert.ok(isArabicSearchRpcMissingError(new Error('function public.search_hadiths does not exist')));
assert.ok(!isArabicSearchRpcMissingError(new Error("timeout")));

const supabaseLib = readMaj("src/lib/supabase.ts");
assert.match(supabaseLib, /searchHadithsDb/);
assert.match(supabaseLib, /mapHadithRpcRowToSearchHit/);

// Client helper accepts new filters + feature-flagged RPC path
const client = readMaj("src/lib/arabic-db-search.ts");
assert.match(client, /search_hadiths/);
assert.match(client, /HadithRpcSearchRow/);
assert.match(client, /isArabicSearchRpcMissingError/);
assert.match(client, /p_collection|collection/);
assert.match(client, /cursor/);
assert.match(client, /resolveArabicSearchPath|legacy_fallback/);
assert.match(client, /Math\.min\(lim/);
assert.ok(existsSync(resolve(majalis, "src/lib/arabic-search-feature-flag.ts")));
assert.ok(existsSync(resolve(majalis, "src/lib/search-observability.ts")));

// Reports
for (const rel of [
  "docs/audit/ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE_REPORT.md",
  "docs/audit/ARABIC_HADITH_SOURCE_INDEX_INVENTORY.md",
  "docs/audit/ARABIC_HADITH_SOURCE_QUERY_INDEX_MATRIX.md",
  "docs/audit/ARABIC_HADITH_SOURCE_RELEVANCE_BENCHMARK.md",
  "docs/audit/ARABIC_HADITH_SOURCE_CLIENT_MIGRATION_PLAN.md",
  "docs/audit/ARABIC_HADITH_SOURCE_EXPLAIN_REPORT.md",
]) {
  assert.ok(existsSync(resolve(root, rel)), rel);
  assert.match(readRepo(rel), /REQUIRES_EXPLICIT_APPROVAL|NOT_CONNECTED|REAL_SCHEMA/);
}

assert.match(sql, /REQUIRES_EXPLICIT_APPROVAL/);
assert.doesNotMatch(sql, /PRODUCTION_MIGRATION_APPLIED/);

console.log("arabic-hadith-source-search-v4: ok");
