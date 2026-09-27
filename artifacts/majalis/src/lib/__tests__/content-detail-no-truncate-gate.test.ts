/**
 * بوابة: صفحات التفاصيل تعرض النص كاملًا — بلا طيّ افتراضي وبلا line-clamp على الجسم.
 * Run: node --import tsx src/lib/__tests__/content-detail-no-truncate-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const surface = read("src/components/knowledge/KnowledgeDetailSurface.tsx");
const reading = read("src/components/content/ReadingSectionCard.tsx");
const rscCss = read("src/styles/components/reading-section-card.css");
const kxCss = read("src/styles/components/knowledge-summary-card.css");
const introCss = read("src/styles/islam-intro-experience.css");
const glossaryView = read("src/pages/account/ui/IslamicGlossaryView.tsx");
const glossaryCss = read("src/styles/pages/glossary.css");
const cardSystem = read("src/styles/card-system.css");

console.log("=== سطح التفاصيل: كامل بلا طيّ ===");
assert.match(surface, /data-detail-full="1"/);
assert.doesNotMatch(surface, /\bcollapsible\b/);
assert.doesNotMatch(surface, /defaultOpen=\{index === 0\}/);
assert.match(surface, /ReadingProse/);

console.log("=== ReadingSectionCard: جسم كامل + تلميح أكورديون اختياري ===");
assert.match(reading, /data-detail-full="1"/);
assert.match(reading, /عرض التفصيل الكامل/);
assert.match(reading, /إخفاء التفصيل/);
assert.doesNotMatch(reading, /className="rsc__title rsc__summary"/);

console.log("=== CSS: لا clamp على جسم التفاصيل ===");
assert.match(rscCss, /rsc__body\[data-detail-full="1"\][\s\S]{0,200}?line-clamp:\s*unset/);
assert.match(rscCss, /\.rsc\.soft-card[\s\S]{0,80}?overflow:\s*visible/);
assert.match(kxCss, /data-detail-full="1"[\s\S]{0,220}?line-clamp:\s*unset/);
assert.doesNotMatch(introCss, /\.rsc__title[\s\S]{0,40}?display:\s*contents/);
assert.match(introCss, /kx-detail-surface[\s\S]{0,500}?line-clamp:\s*unset/);

console.log("=== المعجم: معاينة مقصوصة + تفصيل كامل عند الفتح ===");
assert.match(glossaryView, /gl-label">التفصيل</);
assert.match(glossaryView, /gl-label">التعريف</);
assert.match(glossaryView, /data-detail-full="1"/);
assert.match(glossaryCss, /-webkit-line-clamp:\s*2/);
assert.match(glossaryCss, /gl-term__body\[data-detail-full="1"\][\s\S]{0,220}?line-clamp:\s*unset/);
assert.match(cardSystem, /\.gl-term\.gl-term--open[\s\S]{0,120}?overflow:\s*visible/);

/* صفحات تستخدم السطح المشترك */
for (const rel of [
  "src/views/IslamicSectsDetailPage.tsx",
  "src/views/MadhahibDetailPage.tsx",
]) {
  assert.match(read(rel), /KnowledgeDetailSurface/, `${rel} يستخدم السطح المشترك`);
}

console.log("content-detail-no-truncate-gate.test.ts: ok");
