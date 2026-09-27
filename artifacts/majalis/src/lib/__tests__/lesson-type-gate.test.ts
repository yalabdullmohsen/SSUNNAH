/**
 * بوابة هوية أنواع الدروس.
 * Run: node --import tsx src/lib/__tests__/lesson-type-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveLessonType } from "../lesson-type.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const card = readFileSync(resolve(root, "src/components/lessons/UnifiedLessonCard.tsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles/pages/lessons.css"), "utf8");
const detail = readFileSync(resolve(root, "src/pages/lessons/ui/LessonDetailView.tsx"), "utf8");

assert.equal(resolveLessonType({ category: "تفسير" }).id, "tafsir");
assert.equal(resolveLessonType({ title: "شرح صحيح البخاري" }).id, "hadith");
assert.equal(resolveLessonType({ category: "عقيدة" }).id, "aqeedah");
assert.equal(resolveLessonType({ title: "سيرة النبي" }).id, "seerah");
assert.equal(resolveLessonType({ category: "فقه" }).id, "fiqh");
assert.equal(resolveLessonType({ category: "تجويد" }).id, "quran");
assert.equal(resolveLessonType({ title: "مجلس عام" }).id, "general");

assert.match(card, /data-lesson-type/);
assert.match(card, /lesson-unified-card--dense/);
assert.match(card, /lesson-unified-card__overflow|lesson-unified-card__menu/);
assert.match(detail, /lesson-detail-map--compact/);
assert.match(detail, /عرض الخريطة/);
assert.match(detail, /lesson-detail-meta-disclosure/);
assert.match(css, /\[data-lesson-type="quran"\]/);
assert.match(css, /lesson-unified-card--dense/);

console.log("lesson-type-gate.test.ts: ok");
