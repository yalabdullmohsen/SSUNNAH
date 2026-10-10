/**
 * حارس: 325 درسًا بحالة verification_status='needs_review' (قيد المراجعة الشرعية).
 * - أسطح الاكتشاف (sitemap/RSS/جسر البحث/التوصيات/البحث/وضع السيارة) تستثنيها.
 * - صفحة الدرس تُظهر ContentTrustBox وnoindex (عميل + خادم) ولا تُخفي الدرس.
 * - أي ملف جديد يقرأ lessons من أسطح عامة يجب أن يذكر verification_status.
 * تشغيل: node --import tsx src/lib/__tests__/lessons-needs-review-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const cond = /\.neq\(\s*["']verification_status["']\s*,\s*["']needs_review["']\s*\)/;

const discovery: Array<[string, string]> = [
  ["lib/cms/sitemap-builder.mjs", "lessons"],
  ["lib/knowledge-search-bridge.mjs", "lessons"],
  ["lib/api-handlers/recommendations.js", "lessons"],
  ["lib/api-handlers/search.js", "lessons"],
  ["src/views/CarModePage.tsx", "lessons"],
  ["src/lib/supabase.ts", "searchLessonsFallback"],
];
let checked = 0;
for (const [file, anchor] of discovery) {
  const text = read(file);
  const starts = anchor === "lessons"
    ? [...text.matchAll(/\.from\(\s*["']lessons["']\s*\)|admin\.from\("lessons"\)/g)].map((m) => m.index!)
    : [text.indexOf(`function ${anchor}`)];
  assert.ok(starts.length && starts.every((i) => i >= 0), `${file}: لا قراءة lessons`);
  for (const i of starts) {
    const chain = text.slice(i, i + (anchor === "lessons" ? 500 : 700));
    assert.match(chain, cond, `${file}: قراءة lessons بلا استثناء needs_review`);
    checked++;
  }
}
assert.ok(checked >= 7, `عدد القراءات المفحوصة ${checked}`);

assert.match(read("src/pages/lessons/ui/LessonDetailView.tsx"), /needsShariaReview[\s\S]*<ContentTrustBox[\s\S]*قيد المراجعة الشرعية/, "صفحة الدرس بلا ContentTrustBox");
assert.match(read("src/lib/seo.ts"), /verificationStatus === "needs_review"[\s\S]{0,80}noindex/, "noindex للعميل مفقود");
assert.match(read("lib/api-handlers/lesson-page.js"), /needs_review[\s\S]{0,400}X-Robots-Tag/, "X-Robots-Tag للخادم مفقود");
console.log(`lessons-needs-review-gate: ${checked} قراءة مستثناة + شارة + noindex`);
