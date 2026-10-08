/**
 * بوابة: بطاقات الدروس على سلطة الأسطح (بلا ui-card/mj-card حي، بلا soft-card مباشر).
 * node --import tsx src/lib/__tests__/lesson-cards-soft-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const unified = readFileSync(resolve(root, "src/components/lessons/UnifiedLessonCard.tsx"), "utf8");
const detail = readFileSync(resolve(root, "src/pages/lessons/ui/LessonDetailView.tsx"), "utf8");
const list = readFileSync(resolve(root, "src/pages/lessons/ui/LessonsView.tsx"), "utf8");
const annual = readFileSync(resolve(root, "src/pages/lessons/ui/AnnualCourseDetailView.tsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles/pages/lessons.css"), "utf8");
const mur = readFileSync(resolve(root, "src/styles/modern-ui-refresh.css"), "utf8");

assert.match(unified, /lesson-unified-card/, "UnifiedLessonCard على صنف الدومين");
assert.doesNotMatch(unified, /\bui-card\b/, "UnifiedLessonCard بلا ui-card");
assert.doesNotMatch(unified, /\bmj-card\b/, "UnifiedLessonCard بلا mj-card");
assert.doesNotMatch(unified, /\bsoft-card\b/, "لا soft-card مباشر");

assert.doesNotMatch(detail, /\bui-card\b/, "LessonDetailView بلا ui-card");
assert.doesNotMatch(detail, /\bmj-card\b/, "LessonDetailView بلا mj-card");
assert.doesNotMatch(detail, /\bsoft-card\b/, "LessonDetailView بلا soft-card مباشر");

assert.doesNotMatch(list, /lessons-v2-filters[^"]*\bui-card\b/, "فلاتر بلا ui-card");
assert.doesNotMatch(list, /\bsoft-card\b/, "LessonsView بلا soft-card مباشر");

assert.doesNotMatch(annual, /\bui-card\b/, "AnnualCourseDetailView بلا ui-card");
assert.doesNotMatch(annual, /\bsoft-card\b/, "AnnualCourseDetailView بلا soft-card مباشر");

assert.match(css, /\.lesson-unified-card\b/, "CSS تخطيط مربوط بـ lesson-unified-card");
assert.doesNotMatch(mur, /\.lesson-unified-card\s*,/, "modern-ui-refresh لا يفرض سطحًا منفصلًا");

console.log("lesson-cards-soft-gate.test.ts: ok");
