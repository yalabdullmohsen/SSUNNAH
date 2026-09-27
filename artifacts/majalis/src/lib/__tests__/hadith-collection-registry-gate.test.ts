/**
 * بوابة السجل الكانوني لمجموعات الحديث.
 * تشغيل: node --import tsx src/lib/__tests__/hadith-collection-registry-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  HADITH_COLLECTION_REGISTRY,
  REGISTRY_ARBAEEN,
  REGISTRY_CURATED,
  REGISTRY_SAHIHAYN,
  USER_LABELS,
  getCollectionRegistryEntry,
} from "../hadith/hadith-collection-registry";
import { FORBIDDEN_COMBINED_TOTAL, VERIFIED_CURATED } from "../hadith/hadith-dataset-stats";
import { ARBAEEN_NAWAWI } from "../arbaeen-nawawi-seed";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

console.log("=== مواءمة السجل مع manifests ===");
const sahihayn = JSON.parse(read("public/data/hadith/manifest.json")) as {
  totalHadiths: number;
  files: Array<{ collection: string; count: number }>;
};
const verified = JSON.parse(read("public/data/hadith-verified/manifest.json")) as {
  total: number;
  chunks: Array<{ file: string; count: number; key: string }>;
};
assert.equal(REGISTRY_SAHIHAYN.total, sahihayn.totalHadiths);
assert.equal(REGISTRY_CURATED.total, verified.total);
assert.equal(VERIFIED_CURATED.total, verified.total);
assert.equal(REGISTRY_ARBAEEN.total, ARBAEEN_NAWAWI.length);

let chunkSum = 0;
for (const ch of verified.chunks) {
  const rows = JSON.parse(read(`public/data/hadith-verified/${ch.file}`)) as unknown[];
  assert.equal(rows.length, ch.count, `${ch.file} count mismatch`);
  chunkSum += rows.length;
}
assert.equal(chunkSum, verified.total);

const byKey = verified.chunks.reduce<Record<string, number>>((acc, c) => {
  acc[c.key] = (acc[c.key] || 0) + c.count;
  return acc;
}, {});
assert.equal(REGISTRY_CURATED.sahih, byKey.sahih);
assert.equal(REGISTRY_CURATED.daif, byKey.daif);
assert.equal(REGISTRY_CURATED.mawdu, byKey.mawdu);

console.log("=== اكتمال السجل والحالات ===");
assert.ok(HADITH_COLLECTION_REGISTRY.length >= 20);
assert.equal(getCollectionRegistryEntry("bukhari")?.localAvailability, "LOCAL_COMPLETE");
assert.equal(getCollectionRegistryEntry("muslim")?.localAvailability, "LOCAL_COMPLETE");
assert.equal(getCollectionRegistryEntry("nawawi40")?.classificationModel, "learning-path");
assert.equal(getCollectionRegistryEntry("riyadh")?.localAvailability, "NOT_IMPORTED");
assert.equal(getCollectionRegistryEntry("silsila")?.publicationStatus, "BLOCKED_LICENSE");
assert.equal(getCollectionRegistryEntry("ara-tirmidhi")?.userAvailabilityLabelAr, USER_LABELS.network);

console.log("=== لا مجموع مضلّل ===");
assert.doesNotMatch(
  read("src/components/hadith/HadithDatasetSummary.tsx"),
  new RegExp(String(FORBIDDEN_COMBINED_TOTAL)),
);
assert.match(read("src/lib/hadith/hadith-dataset-stats.ts"), /hadith-collection-registry/);

console.log("=== وثائق السجل ===");
const repo = resolve(root, "../..");
assert.match(readFileSync(resolve(repo, "docs/hadith/HADITH_COLLECTION_REGISTRY.md"), "utf8"), /LOCAL_COMPLETE/);
assert.match(readFileSync(resolve(repo, "docs/hadith/HADITH_COMPLETENESS_AUDIT.md"), "utf8"), /1,?740/);
assert.match(readFileSync(resolve(repo, "docs/hadith/HADITH_SOURCE_LICENSE_MATRIX.md"), "utf8"), /APPROVED_FOR_LOCAL_DISTRIBUTION/);
assert.match(readFileSync(resolve(repo, "docs/hadith/HADITH_SOURCE_APPROVALS.md"), "utf8"), /fawazahmed0/);

console.log("hadith-collection-registry-gate.test.ts: ok");
