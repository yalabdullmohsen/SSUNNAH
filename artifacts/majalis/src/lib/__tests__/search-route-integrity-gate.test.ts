/**
 * سلامة تنقّل البحث: لا إعادة كتابة href · لا وجهات تاريخ مكسورة · إصدار الفهرس.
 * node --import tsx src/lib/__tests__/search-route-integrity-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ISLAMIC_HISTORY_ITEMS } from "@/data/islamic-history";
import { resolveSearchHit } from "@/lib/knowledge-platform/content-resolver";
import { SEARCH_INDEX_SCHEMA_VERSION } from "@/features/search/search-index-version";
import { runKnowledgeSearch } from "@/lib/knowledge-platform/universal-search";
import { primeUnifiedSearchIndex, clearUnifiedSearchIndexCache } from "@/features/search/unified-local";
import { isBlockedPublicSearchHref } from "@/features/search/public-search-blocklist";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const indexPath = resolve(root, "public/data/search/index.json");
assert.ok(existsSync(indexPath), "فهرس البحث موجود");
const index = JSON.parse(read("public/data/search/index.json")) as {
  version: number;
  docs: { id: string; kind: string; titleAr: string; href: string; meta?: string }[];
};

assert.ok(
  index.version >= SEARCH_INDEX_SCHEMA_VERSION,
  `إصدار الفهرس ${index.version} >= ${SEARCH_INDEX_SCHEMA_VERSION}`,
);

const histIds = new Set(ISLAMIC_HISTORY_ITEMS.map((i) => i.id));
let invalidPublicSearchDestinations = 0;

assert.equal(isBlockedPublicSearchHref("/islamic-sects"), true, "sects blocked");
assert.equal(isBlockedPublicSearchHref("/arabic-language"), true, "arabic EXCLUDED blocked");

for (const d of index.docs) {
  const href = (d.href || "").split("?")[0].split("#")[0];
  if (isBlockedPublicSearchHref(href)) {
    invalidPublicSearchDestinations += 1;
  }
  if (href.includes("/knowledge/history/")) {
    invalidPublicSearchDestinations += 1;
  }
  if (href.startsWith("/tarikh-islami/") && href !== "/tarikh-islami") {
    const id = decodeURIComponent(href.slice("/tarikh-islami/".length));
    if (!histIds.has(id)) invalidPublicSearchDestinations += 1;
  }
  const resolved = resolveSearchHit({
    id: d.id,
    kind: d.kind,
    title: d.titleAr,
    href: d.href,
    summary: d.meta,
  });
  const nav = (resolved?.href || d.href).split("?")[0].split("#")[0];
  if (nav !== href) invalidPublicSearchDestinations += 1;
}

assert.equal(invalidPublicSearchDestinations, 0, "invalidPublicSearchDestinations = 0");

const historyHit = resolveSearchHit({
  id: "history:rashidun-abu-bakr",
  kind: "history",
  title: "خلافة أبي بكر الصديق",
  href: "/tarikh-islami/rashidun-abu-bakr",
});
assert.equal(historyHit?.href, "/tarikh-islami/rashidun-abu-bakr");
assert.doesNotMatch(historyHit?.href ?? "", /history%3A|history:/);

const knowledgeStyle = resolveSearchHit({
  id: "knowledge:history-abu-bakr",
  kind: "history",
  title: "خلافة أبي بكر الصديق",
  href: "/knowledge/history/history-abu-bakr",
});
assert.equal(knowledgeStyle?.href, "/knowledge/history/history-abu-bakr");

clearUnifiedSearchIndexCache();
primeUnifiedSearchIndex(index);
const search = await runKnowledgeSearch("أبي بكر", { scope: "history", limit: 40 });
assert.ok(search.results.length >= 1, "نتائج تاريخ لأبي بكر");
for (const r of search.results) {
  if (r.href.startsWith("/tarikh-islami/")) {
    const id = decodeURIComponent(r.href.split("/")[2] || "");
    assert.ok(histIds.has(id), `نتيجة بحث تحل: ${r.href}`);
    assert.doesNotMatch(r.href, /%3A/);
  }
  assert.equal(r.href.includes("/knowledge/history/"), false, "لا نتائج knowledge/history");
}

const detail = read("src/views/TarikhIslamiDetailPage.tsx");
assert.match(detail, /tarikh-unavailable/);
assert.doesNotMatch(detail, /EmptyStateV2/);

const resolver = read("src/lib/knowledge-platform/content-resolver.ts");
assert.match(resolver, /nav:index-href|indexHref/);

const unified = read("src/lib/knowledge-platform/universal-search.ts");
assert.match(unified, /item\.href \|\| entity\?\.href/);

const gen = read("scripts/generate-unified-search-index.mjs");
assert.match(gen, /section === "history"/);
assert.match(gen, /SEARCH_INDEX_SCHEMA_VERSION/);

const local = read("src/features/search/unified-local.ts");
assert.match(local, /SEARCH_INDEX_SCHEMA_VERSION/);
assert.match(local, /purgeStaticJsonCache/);

console.log("search-route-integrity-gate.test.ts: ok");
