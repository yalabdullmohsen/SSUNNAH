/**
 * بوابة: الجامعات/المعرفة/الموضوعات/المسارات/المشايخ تُبقي المحتوى أثناء إعادة الجلب.
 * node --import tsx src/lib/__tests__/universities-knowledge-keep-previous-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const universities = read("src/views/UniversitiesPage.tsx");
assert.match(
  universities,
  /loading\s*&&\s*universities\.length\s*===\s*0/,
  "Universities: هيكل فقط بلا نتائج سابقة",
);
assert.match(universities, /aria-busy=\{loading\}/, "Universities: aria-busy أثناء التحديث");

const universityDetail = read("src/views/UniversityDetailPage.tsx");
assert.match(
  universityDetail,
  /loading\s*&&\s*!hasMatchingUniversity/,
  "UniversityDetail: هيكل فقط بلا جامعة مطابقة للـslug",
);

const knowledge = read("src/views/KnowledgeSectionPage.tsx");
assert.match(
  knowledge,
  /loading\s*&&\s*!hasMatchingItem\s*&&\s*!hasMatchingList/,
  "Knowledge: هيكل فقط بلا عنصر/قائمة مطابقة",
);
assert.match(knowledge, /knowledge-index-link/, "Knowledge: فهرس روابط");
assert.doesNotMatch(knowledge, /\bsoft-card\b/, "Knowledge بلا soft-card مباشر");

const topics = read("src/views/TopicsIndexPage.tsx");
assert.match(
  topics,
  /loading\s*&&\s*Object\.keys\(displayed\)\.length\s*===\s*0/,
  "Topics: هيكل فقط بلا موضوعات معروضة",
);
assert.doesNotMatch(topics, /\bsoft-card\b/, "Topics بلا soft-card مباشر");

const paths = read("src/views/learning/LearningPathsPage.tsx");
assert.match(
  paths,
  /loading\s*&&\s*paths\.length\s*===\s*0/,
  "LearningPaths: هيكل فقط بلا مسارات سابقة",
);
assert.doesNotMatch(
  paths,
  /\.catch\(\(\)\s*=>\s*\{\s*setPaths\(\[\]\)/,
  "LearningPaths: لا تفرّغ المسارات عند فشل إعادة الجلب",
);
assert.doesNotMatch(paths, /\bsoft-card\b/, "LearningPaths بلا soft-card مباشر");

const pathDetail = read("src/views/learning/LearningPathDetailPage.tsx");
assert.match(
  pathDetail,
  /loading\s*&&\s*!\(path\s*&&\s*path\.slug\s*===\s*slug\)/,
  "LearningPathDetail: هيكل فقط بلا مسار مطابق للـslug",
);

const teachers = read("src/pages/lessons/TeachersIndexPage.tsx");
assert.match(
  teachers,
  /loading\s*&&\s*teachers\.length\s*===\s*0/,
  "TeachersIndex: هيكل فقط بلا مشايخ سابقة",
);
assert.match(teachers, /tch-card/, "TeachersIndex: بطاقات المشايخ");
assert.doesNotMatch(teachers, /\bsoft-card\b/, "TeachersIndex بلا soft-card مباشر");

const teacherDetail = read("src/pages/lessons/TeacherDetailPage.tsx");
assert.match(
  teacherDetail,
  /loading\s*&&\s*lessons\.length\s*===\s*0/,
  "TeacherDetail: هيكل فقط بلا دروس سابقة",
);

console.log("universities-knowledge-keep-previous-gate.test.ts: ok");
