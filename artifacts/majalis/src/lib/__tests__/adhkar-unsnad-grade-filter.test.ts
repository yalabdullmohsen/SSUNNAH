import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllAdhkarItems, getAdhkarByCategory, isWeakAdhkarGrade } from "../adhkar-seed";

test("«غير مسندة» تُعامل كدرجة ضعيفة", () => {
  assert.equal(isWeakAdhkarGrade("صيغة غير مسندة — ليست من الأذكار المرفوعة الثابتة"), true);
  assert.equal(isWeakAdhkarGrade("غير  مسند"), true);
  assert.equal(isWeakAdhkarGrade("صحيح"), false);
  assert.equal(isWeakAdhkarGrade(undefined), false);
});

test("adh-324 لا يظهر في أي مخرجات عامة", () => {
  assert.equal(getAllAdhkarItems().some((i) => i.id === "adh-324"), false);
  assert.equal(getAdhkarByCategory("adh-salawat").some((i) => i.id === "adh-324"), false);
});

test("لا ذكر عام درجته غير مسندة", () => {
  assert.equal(getAllAdhkarItems().filter((i) => isWeakAdhkarGrade(i.grade)).length, 0);
});
