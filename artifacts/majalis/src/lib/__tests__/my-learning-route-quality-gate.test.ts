/**
 * Final Internal Closure PR1 — `/my-learning` critical route quality.
 * node --import tsx src/lib/__tests__/my-learning-route-quality-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const majalisRoot = resolve(here, "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const view = readMaj("src/pages/lessons/ui/MyLearningView.tsx");
const css = readMaj("src/styles/pages/my-learning.css");
const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
const route = (matrix.routes as Array<Record<string, unknown>>).find(
  (r) => r.route === "/my-learning",
);

assert.ok(route, "/my-learning موجود في ROUTE_QUALITY_MATRIX");
for (const field of [
  "loading",
  "empty",
  "error",
  "dark",
  "rtl",
  "accessibility",
  "visualSystem",
] as const) {
  assert.equal(route[field], "COMPLETE", `/my-learning.${field} = COMPLETE`);
}

assert.match(view, /dir="rtl"/, "RTL صريح");
assert.match(view, /aria-busy=\{loading\s*\|\|\s*resumeLoading\}/, "aria-busy");
assert.match(view, /<h1[\s>]/, "عنوان h1");
assert.match(view, /myl2-card__title[\s\S]*id="myl2-/, "عناوين أقسام h2 مع id");
assert.match(view, /myl2-skeletons/, "هيكل تحميل");
assert.match(view, /loading\s*&&\s*library\.length\s*===\s*0/, "تحميل مكتبة بلا وميض");
assert.match(view, /ErrorState/, "حالة خطأ رسمية");
assert.match(view, /onRetry=\{\(\)\s*=>\s*setRetryTick/, "إعادة محاولة");
assert.match(view, /STATUS\.networkError/, "offline → رسالة شبكة");
assert.match(view, /STATUS\.loadError/, "فشل بيانات → رسالة تحميل");
assert.match(
  view,
  /\.catch\(\(\)\s*=>\s*\{[\s\S]*أبقِ البيانات السابقة/,
  "keep-previous عند الخطأ",
);
assert.doesNotMatch(
  view,
  /\.catch\(\(\)\s*=>\s*\{[^}]*setLibrary\(\[\]\)/s,
  "لا تفريغ المكتبة عند الخطأ",
);
assert.match(view, /!user\s*\?/, "حالة ضيف / empty بدون جلسة");
assert.match(view, /href="\/login"/, "CTA دخول للضيف");
assert.match(view, /EMPTY\.bookmarks/, "فراغ مكتبة للمستخدم");
assert.match(view, /aria-label="إعدادات الحساب"/, "اسم وصول لرابط الإعدادات");
assert.match(view, /role="progressbar"/, "شريط تقدّم دلالي");
assert.match(css, /html\[data-theme="dark"\]\s*\.myl2-page/, "أنماط Dark Mode");
assert.match(css, /\.myl2-page\s*\{/, "سطح الصفحة");
assert.match(css, /max-width:\s*700px/, "قيد عرض المحتوى (تقليل overflow)");

console.log("my-learning-route-quality-gate.test.ts: ok");
