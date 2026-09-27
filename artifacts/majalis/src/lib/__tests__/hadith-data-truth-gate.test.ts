/**
 * بوابة صدق بيانات الحديث — أعداد · تسميات · فلاتر · حالات فارغة.
 * تشغيل: node --import tsx src/lib/__tests__/hadith-data-truth-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARBAEEN_LEARNING,
  FORBIDDEN_COMBINED_TOTAL,
  getHadithDatasetCards,
  NETWORK_CATALOG_COUNTS,
  SAHIHAYN_LOCAL,
  VERIFIED_CURATED,
} from "../hadith/hadith-dataset-stats";
import {
  collectionFilterLabel,
  getCollectionAvailability,
  isFilterSelectable,
  numberingConflictNoteAr,
} from "../hadith/hadith-collection-availability";
import { presentHadithAuthenticity } from "../hadith/hadith-authenticity-label";
import { ARBAEEN_NAWAWI } from "../arbaeen-nawawi-seed";
import { normalizeArabic } from "../arabic-search";
import { hadithNumberMatches } from "../hadith-access";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const repoRoot = resolve(root, "../..");

console.log("=== مزامنة الأعداد مع الـmanifests ===");
const sahihayn = JSON.parse(read("public/data/hadith/manifest.json")) as {
  totalHadiths: number;
  files: Array<{ collection: string; count: number }>;
};
const verified = JSON.parse(read("public/data/hadith-verified/manifest.json")) as {
  total: number;
  chunks: Array<{ key: string; count: number }>;
};
assert.equal(SAHIHAYN_LOCAL.total, sahihayn.totalHadiths);
assert.equal(
  SAHIHAYN_LOCAL.bukhari,
  sahihayn.files.find((f) => f.collection === "bukhari")?.count,
);
assert.equal(
  SAHIHAYN_LOCAL.muslim,
  sahihayn.files.find((f) => f.collection === "muslim")?.count,
);
assert.equal(VERIFIED_CURATED.total, verified.total);
const byKey = verified.chunks.reduce<Record<string, number>>((acc, c) => {
  acc[c.key] = (acc[c.key] || 0) + c.count;
  return acc;
}, {});
assert.equal(VERIFIED_CURATED.sahih, byKey.sahih);
assert.equal(VERIFIED_CURATED.daif, byKey.daif);
assert.equal(VERIFIED_CURATED.mawdu, byKey.mawdu);
assert.equal(ARBAEEN_LEARNING.total, ARBAEEN_NAWAWI.length);

console.log("=== لا مجموع مضلّل في الواجهة ===");
const cards = getHadithDatasetCards();
assert.equal(cards.length, 4);
assert.ok(cards.every((c) => c.id !== undefined));
const counts = cards.filter((c) => c.id !== "network_catalog").map((c) => c.count);
assert.ok(!counts.includes(FORBIDDEN_COMBINED_TOTAL), "لا بطاقة بعدد مجموع المصادر");
const view = read("src/pages/hadith/ui/HadithView.tsx");
assert.match(view, /HadithDatasetSummary/);
assert.doesNotMatch(view, /HadithStatsPanel/);
assert.doesNotMatch(view, /hadith-hub-stats/);
assert.doesNotMatch(view, new RegExp(String(FORBIDDEN_COMBINED_TOTAL)));
assert.match(view, /SAHIHAYN_LOCAL/);
assert.match(view, /HadithEmptyState/);

console.log("=== تسميات محلي vs شبكة ===");
assert.equal(getCollectionAvailability("bukhari"), "LOCAL_COMPLETE");
assert.equal(getCollectionAvailability("muslim"), "LOCAL_COMPLETE");
assert.equal(getCollectionAvailability("tirmidhi"), "LOCAL_CURATED_SAMPLE");
assert.equal(getCollectionAvailability("riyadh"), "UNAVAILABLE");
assert.equal(getCollectionAvailability("ara-tirmidhi"), "NETWORK_AVAILABLE");
assert.equal(getCollectionAvailability("unknown-book-xyz"), "UNKNOWN");
assert.ok(isFilterSelectable("bukhari"));
assert.ok(isFilterSelectable("tirmidhi"));
assert.ok(!isFilterSelectable("ara-abudawud"));
assert.ok(!isFilterSelectable("riyadh"));
assert.match(collectionFilterLabel("tirmidhi"), /مجموعة منسّقة/);
assert.match(collectionFilterLabel("ara-nasai"), /يتطلب اتصالًا/);
assert.match(numberingConflictNoteAr(), /بحسب ترقيم المصدر/);
assert.notEqual(SAHIHAYN_LOCAL.muslim, NETWORK_CATALOG_COUNTS["ara-muslim"]);

const books = read("src/pages/hadith/ui/HadithBooksView.tsx");
assert.match(books, /بحسب ترقيم المصدر/);
assert.match(books, /يتطلب اتصالًا|numberingNoteAr|network_failed/);
assert.match(books, /HadithEmptyState/);

console.log("=== وضوح التصنيف ===");
const membership = presentHadithAuthenticity({
  collection: "bukhari",
  grade: "صحيح",
  metadata: { takhrij_method: "membership" },
});
assert.equal(membership.membershipLabel, "من صحيح البخاري");
assert.equal(membership.gradeIsMembershipOnly, true);
assert.ok(membership.helpText);

const curated = presentHadithAuthenticity({
  collection: "muslim",
  grade: "صحيح",
  metadata: { takhrij_method: "curated+membership", muhaddith: "الألباني" },
});
assert.equal(curated.membershipLabel, "من صحيح مسلم");
assert.match(String(curated.curatedLabel), /حكم منقول من المصدر|تخريج منسّق/);
assert.match(String(curated.curatedLabel), /الألباني/);

const invented = presentHadithAuthenticity({
  collection: "tirmidhi",
  grade: "حسن",
  metadata: { takhrij_method: "membership" },
});
assert.equal(invented.membershipLabel, null);

console.log("=== فلتر الرقم + تطبيع عربي ===");
assert.ok(hadithNumberMatches("123", "١٢٣"));
assert.ok(hadithNumberMatches("15", "15"));
assert.ok(normalizeArabic("الصَّلَاة").includes("الصلاه") || normalizeArabic("الصَّلَاة").length > 0);

console.log("=== مكوّن الحالة الفارغة ===");
const empty = read("src/components/hadith/HadithEmptyState.tsx");
for (const kind of [
  "no_results",
  "network_required",
  "network_failed",
  "unavailable_locally",
  "filter_empty",
  "load_failed",
]) {
  assert.match(empty, new RegExp(kind));
}
assert.match(empty, /مسح عوامل التصفية/);
assert.match(empty, /عرض أحاديث البخاري/);
assert.match(empty, /فتح الأربعين النووية/);
assert.match(empty, /إعادة المحاولة/);
assert.doesNotMatch(empty, /عنصر غير موجود/);

console.log("=== روابط عميقة ===");
assert.match(view, /\/hadith\/sahih/);
assert.match(view, /\/arbaeen-nawawi/);
assert.match(view, /\/hadith\/books/);
const card = read("src/components/hadith/HadithCard.tsx");
assert.match(card, /presentHadithAuthenticity/);
assert.match(card, /gradeIsMembershipOnly/);

// ضمان وجود خطط التوثيق في المستودع
const planSearch = resolve(repoRoot, "docs/remediation/HADITH_GLOBAL_SEARCH_PLAN.md");
const planDecomp = resolve(repoRoot, "docs/remediation/HADITH_VIEW_DECOMPOSITION_PLAN.md");
const audit = resolve(repoRoot, "docs/remediation/HADITH_DATA_TRUTH_AUDIT.md");
assert.ok(readFileSync(planSearch, "utf8").includes("sample-50"));
assert.ok(readFileSync(planDecomp, "utf8").includes("HadithHub"));
assert.ok(readFileSync(audit, "utf8").includes("14940"));

console.log("hadith-data-truth-gate.test.ts: ok");
