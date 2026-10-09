import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTENT_HOLDS, filterHeld, isHeld } from "../content-hold";
import { isBlockedFromPublic, isWeakGrade } from "../content-display-zones";
import { ADHKAR_ITEMS } from "../adhkar-seed";
import { getUnverifiedAdhkarItems, isPublishableAdhkar } from "../adhkar-service";
import { isPublishedLesson, getAllFiqhBooks, type FiqhLesson } from "../fiqh-books";

// بنية الملف
const ids = CONTENT_HOLDS.map((h) => h.id);
assert.equal(new Set(ids).size, ids.length, "معرّف مكرر في content-hold.json");
for (const h of CONTENT_HOLDS) {
  assert.ok(h.id?.trim(), "معرّف فارغ");
  assert.ok(h.reason?.trim().length >= 10, `${h.id}: سبب الإيقاف مطلوب`);
  assert.match(h.since, /^\d{4}-\d{2}-\d{2}$/, `${h.id}: تاريخ الإيقاف مطلوب`);
}

// السلوك
assert.equal(isHeld("hajj-arkan-arafa"), true);
assert.equal(isHeld("غير-موجود"), false);
assert.equal(isHeld(undefined), false);
assert.deepEqual(filterHeld([{ id: "curriculum-1" }, { id: "x" }], (r) => r.id), [{ id: "x" }]);

const okRecord = { text: "نص", source: "مصدر", grade: "صحيح" };
assert.equal(isBlockedFromPublic({ ...okRecord, id: "adh-1" }), false);
assert.equal(isBlockedFromPublic({ ...okRecord, id: "curriculum-10" }), true, "المعرّف الموقوف يُحجب عن العرض العام");

// الدرس الموقوف لا يُنشر حتى لو اكتملت شروطه الأخرى
const lesson = getAllFiqhBooks().flatMap((b) => b.chapters.flatMap((c) => c.lessons)).find((l) => l.id === "hajj-arkan-arafa");
assert.ok(lesson, "hajj-arkan-arafa يجب أن يبقى في المصدر (الإيقاف لا يحذف)");
assert.equal(isPublishedLesson(lesson as FiqhLesson), false, "hajj-arkan-arafa موقوف العرض");
assert.equal(isPublishedLesson({ ...(lesson as FiqhLesson), id: "غير-موقوف" }), true, "نفس المحتوى بمعرّف غير موقوف يُنشر — أي أن الإيقاف هو السبب الوحيد");

// «غير مسندة» ضعيف الدرجة فيخرج من التذكيرات والبحث
assert.equal(isWeakGrade("صيغة غير مسندة — ليست من الأذكار المرفوعة الثابتة"), true);
assert.equal(isWeakGrade("صحيح"), false);

// adh-324 صيغة غير مسندة: خارج العرض العام، وتبقى في «تنبيه وتمييز»
const adh324 = ADHKAR_ITEMS.find((i) => i.id === "adh-324");
assert.ok(adh324, "adh-324 يبقى في المصدر");
assert.equal(isPublishableAdhkar(adh324), false);
assert.ok(getUnverifiedAdhkarItems(ADHKAR_ITEMS).some((i) => i.id === "adh-324"), "adh-324 يبقى في تبويب التنبيه والتمييز");

// بوابة عدم التجاوز: مسارات القراءة المركزية يجب أن تستهلك الإيقاف
for (const f of ["src/lib/fiqh-books.ts", "src/lib/content-display-zones.ts"]) {
  assert.match(readFileSync(f, "utf8"), /content-hold/, `${f} لا يستهلك content-hold`);
}

console.log("content-hold-gate OK");
