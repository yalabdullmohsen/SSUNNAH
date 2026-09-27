/**
 * بوابة: تجربة التعريف بالإسلام — تباين/هرمية/أكورديون بعد card-system.
 * تشغيل: node --import tsx src/lib/__tests__/islam-intro-experience-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const cssPath = "src/styles/islam-intro-experience.css";
assert.ok(existsSync(resolve(root, cssPath)), "ملف التجربة موجود");
const css = read(cssPath);
const main = read("src/main.tsx");
const discover = read("src/styles/discover-islam.css");
const tawhid = read("src/styles/pages/tawhid.css");
const reading = read("src/components/content/ReadingSectionCard.tsx");
const surface = read("src/components/knowledge/KnowledgeDetailSurface.tsx");

console.log("=== الربط بعد card-system + صفحات النطاق ===");
assert.match(main, /islam-intro-experience\.css/);
assert.match(
  main,
  /card-system\.css[\s\S]{0,220}?islam-intro-experience\.css/,
);
for (const rel of [
  "src/views/DiscoverIslamPage.tsx",
  "src/views/TawhidPage.tsx",
  "src/views/IslamicSectsPage.tsx",
  "src/pages/account/ui/IslamicGlossaryView.tsx",
  "src/components/knowledge-collection/KnowledgeCollectionSystem.tsx",
]) {
  assert.match(read(rel), /islam-intro-experience\.css/, `${rel} يستورد الطبقة`);
}

console.log("=== لا ألوان تباين ضعيفة صلبة ===");
assert.doesNotMatch(tawhid, /\.twh-hub-card__desc[\s\S]{0,120}?#4A5C55/);
assert.doesNotMatch(tawhid, /\.twh-hub-card__desc[\s\S]{0,120}?#A8BDB6/);
assert.match(tawhid, /\.twh-hub-card__desc[\s\S]{0,160}?--color-text-muted|--mj-ink-2/);

console.log("=== بطاقات اكتشف الإسلام فاتحة ===");
assert.match(discover, /\.dii-hub-card\.hub-card[\s\S]{0,280}?background[\s\S]{0,80}?--mj-surface/);
assert.match(discover, /\.dii-hub-card \.hub-card__desc[\s\S]{0,80}?#3a4a42/);
assert.match(css, /\.dii-page \.hub-card/);
assert.match(css, /background:\s*var\(--ii-surface\)\s*!important/);

console.log("=== هرمية عنوان + سهم مدمج ===");
assert.match(css, /hub-card__title[\s\S]{0,120}?font-weight:\s*800/);
assert.match(css, /hub-card__go[\s\S]{0,200}?border-radius:\s*999px/);
assert.match(css, /\.gl-term--open/);
assert.match(css, /\.kc-category-card__title/);

console.log("=== تفاصيل كاملة بلا قصّ ===");
assert.match(reading, /collapsible/);
assert.match(reading, /rsc--accordion/);
assert.match(reading, /عرض التفصيل الكامل/);
assert.match(surface, /data-detail-full="1"/);
assert.doesNotMatch(surface, /collapsible/);
assert.doesNotMatch(css, /display:\s*contents\s*;/);
assert.match(css, /kx-detail-surface[\s\S]{0,500}?line-clamp:\s*unset/);

console.log("=== أدلة مضغوطة ===");
assert.match(css, /\.kx-block--evidence|\.rsc--evidence/);
assert.match(css, /padding:\s*0\.55rem 0\.75rem/);

console.log("islam-intro-experience-gate.test.ts: ok");
