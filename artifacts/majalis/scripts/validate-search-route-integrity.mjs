#!/usr/bin/env node
/**
 * بوابة سلامة مسارات فهرس البحث العام.
 * تفشل إن وُجدت وجهات غير قابلة للحل أو إعادة كتابة تنقّل تكسر href الفهرس.
 *
 * التشغيل: node --import tsx scripts/validate-search-route-integrity.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");

const { SEARCH_INDEX_SCHEMA_VERSION } = await import(
  "../src/features/search/search-index-version.ts"
);
const { ISLAMIC_HISTORY_ITEMS } = await import("../src/data/islamic-history/index.ts");
const { PROPHETS } = await import("../src/lib/prophets-data.ts");
const { NATIONS } = await import("../src/lib/nations-seed.ts");
const { resolveSearchHit } = await import("../src/lib/knowledge-platform/content-resolver.ts");
const { isBlockedPublicSearchHref } = await import(
  "../src/features/search/public-search-blocklist.ts"
);

const indexPath = path.join(appRoot, "public/data/search/index.json");
const idx = JSON.parse(fs.readFileSync(indexPath, "utf8"));

assert.ok(
  Number(idx.version) >= SEARCH_INDEX_SCHEMA_VERSION,
  `إصدار الفهرس ${idx.version} < ${SEARCH_INDEX_SCHEMA_VERSION}`,
);
assert.ok(Array.isArray(idx.docs) && idx.docs.length > 0, "فهرس البحث فارغ");

const histIds = new Set(ISLAMIC_HISTORY_ITEMS.map((i) => i.id));
const prophetSlugs = new Set(PROPHETS.map((p) => p.slug));
const nationSlugs = new Set(NATIONS.map((n) => n.slug));

const exclusions = [];
let invalidPublicSearchDestinations = 0;

function exclude(doc, reasonCode, technicalReason) {
  invalidPublicSearchDestinations += 1;
  exclusions.push({
    sourceId: doc.id,
    domain: doc.kind,
    attemptedUrl: doc.href,
    reasonCode,
    technicalReason,
  });
}

for (const d of idx.docs) {
  const href = String(d.href || "").split("?")[0].split("#")[0];
  if (!href || !d.titleAr?.trim()) {
    exclude(d, "MISSING_TITLE_OR_HREF", "عنوان أو مسار فارغ");
    continue;
  }
  if (isBlockedPublicSearchHref(href)) {
    exclude(d, "COMING_SOON_OR_EXCLUDED", "وجهة قريبًا / مستبعدة من البحث العام");
    continue;
  }
  if (href.includes("/knowledge/history/")) {
    exclude(d, "STALE_ALIAS", "مسار معرفة مزدوج — المعتمد /tarikh-islami");
    continue;
  }
  if (href.startsWith("/tarikh-islami/") && href !== "/tarikh-islami") {
    const id = decodeURIComponent(href.slice("/tarikh-islami/".length));
    if (!histIds.has(id)) {
      exclude(d, "MISSING_RECORD", `getHistoryItem(${id}) فشل`);
    }
  }
  if (href.startsWith("/prophets/") && !href.includes("/tree")) {
    const slug = href.split("/")[2];
    if (!prophetSlugs.has(slug)) exclude(d, "MISSING_RECORD", `نبي غير موجود: ${slug}`);
  }
  if (href.startsWith("/nations/") && href !== "/nations") {
    const slug = href.split("/")[2];
    if (!nationSlugs.has(slug)) exclude(d, "MISSING_RECORD", `أمة غير موجودة: ${slug}`);
  }

  const resolved = resolveSearchHit({
    id: d.id,
    kind: d.kind,
    title: d.titleAr,
    href: d.href,
    summary: d.meta,
  });
  const navHref = resolved?.href || d.href;
  const navClean = String(navHref).split("?")[0].split("#")[0];
  const indexClean = href;
  if (navClean !== indexClean) {
    exclude(
      d,
      "INVALID_ROUTE_PARAMETERS",
      `إعادة كتابة تنقّل: ${d.href} → ${navHref}`,
    );
  }
}

const reportDir = path.resolve(appRoot, "../../docs/remediation");
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, "SEARCH_INDEX_EXCLUSIONS.json"),
  JSON.stringify(
    {
      generatedForIndexVersion: idx.version,
      invalidPublicSearchDestinations,
      exclusions,
    },
    null,
    2,
  ) + "\n",
);

assert.equal(
  invalidPublicSearchDestinations,
  0,
  `invalidPublicSearchDestinations=${invalidPublicSearchDestinations}`,
);

console.log(
  `validate-search-route-integrity: ok — docs=${idx.docs.length} version=${idx.version} invalid=0`,
);
