/**
 * Program 13 — Shubuhat center W1.
 * Run: node --import tsx src/lib/__tests__/shubuhat-center-w1-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS } from "@/config/sections.registry";
import { SECTION_PRODUCT_CATALOG } from "@/lib/product";
import { STATIC_DAWAH_SHUBUHAT } from "@/lib/dawah-static-fallback";
import {
  SHUBUHAT_CANONICAL_LIST_ROUTE,
  isShubuhatSearchEligible,
  shubuhatCompletenessTier,
  summarizeShubuhatCatalog,
  validateShubuhatStructure,
} from "@/lib/shubuhat-contract";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

for (const doc of [
  "docs/shubuhat/SHUBUHAT_CENTER.md",
  "docs/shubuhat/SHUBUHAT_SOURCE_MATRIX.md",
  "docs/shubuhat/SHUBUHAT_VALIDATION.md",
  "docs/remediation/waves/WAVE_SHUBUHAT_CENTER_W1.md",
]) {
  assert.ok(existsSync(resolve(repo, doc)), `missing ${doc}`);
  assert.match(read(doc), /Program 13|PROVENANCE|Never|لا|مصدر/i);
}

assert.ok(STATIC_DAWAH_SHUBUHAT.length >= 10, "static shubuhat catalog present");

for (const item of STATIC_DAWAH_SHUBUHAT) {
  const issues = validateShubuhatStructure(item);
  assert.equal(issues.length, 0, JSON.stringify({ slug: item.slug, issues }));
}

const summary = summarizeShubuhatCatalog(STATIC_DAWAH_SHUBUHAT);
assert.equal(summary.blocked, 0);
assert.ok(summary.structureOk === summary.total);
assert.ok(
  summary.provenanceComplete < summary.total,
  "honesty: most rows still lack named sources — do not claim COMPLETE",
);
assert.ok(
  STATIC_DAWAH_SHUBUHAT.filter((i) => isShubuhatSearchEligible(i)).length === summary.provenanceComplete,
);

const product = SECTION_PRODUCT_CATALOG.find((e) => e.id === "tafnid-shubuhat");
assert.ok(product);
assert.equal(product!.canonicalRoute, SHUBUHAT_CANONICAL_LIST_ROUTE);
assert.equal(product!.availability, "PARTIAL");
assert.equal(product!.searchStatus, "EXCLUDED");
assert.equal(product!.completeContentCount, summary.provenanceComplete);
assert.equal(product!.contentCount, summary.total);

const seed = SECTIONS.find((s) => s.id === "shubuhat");
assert.ok(seed, "shubuhat nav seed required");
assert.equal(seed!.route, SHUBUHAT_CANONICAL_LIST_ROUTE);
assert.equal(seed!.status, "live");

const routes = readFileSync(resolve(root, "src/AppRoutes.tsx"), "utf8");
assert.match(routes, /path="\/shubuhat"/);
assert.match(routes, /discover-islam\/doubts/);

const detail = readFileSync(resolve(root, "src/views/DiscoverIslamDoubtDetailPage.tsx"), "utf8");
assert.match(detail, /updated_at|آخر تحديث/);
assert.match(detail, /مصدر|provenance|limitation|قيد الإكمال|المصادر/);
assert.match(detail, /ar|العربية|اللغة/);

// Sample tier honesty
const partial = STATIC_DAWAH_SHUBUHAT.find((i) => !i.sources?.length);
assert.ok(partial);
assert.equal(shubuhatCompletenessTier(partial!), "PROVENANCE_PARTIAL");

console.log("shubuhat-center-w1-gate.test.ts: ok", summary);
