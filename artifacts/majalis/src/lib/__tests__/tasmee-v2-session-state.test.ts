/**
 * حالة التسميع داخل المصحف: الوضع، الإخفاء، العلامات، العدّاد، الرجوع.
 * node --import tsx src/lib/__tests__/tasmee-v2-session-state.test.ts
 */
import assert from "node:assert/strict";
import { alertToFire, initialTasmeeState, tasmeeReducer, type TasmeeState } from "../tasmee-v2/session-state";
import { wantsTasmeeFromSearch } from "../tasmee-v2/flags";
import {
  ayahEndOf,
  ayahStartBefore,
  ayahStartOf,
  stepsBackToAyahStart,
} from "../tasmee-v2/word-model";

const run = (s: TasmeeState, ...a: Parameters<typeof tasmeeReducer>[1][]) =>
  a.reduce(tasmeeReducer, s);

// الوضع: التسميع يبدأ مخفيًا، والاستماع لا يخفي
let s = run(initialTasmeeState(), { type: "setMode", mode: "tasmee" });
assert.equal(s.hideAyahs, true);
assert.equal(run(s, { type: "setMode", mode: "listen" }).hideAyahs, false);

// التسجيل لا يعمل خارج الوضعين الفعّالين
assert.equal(run(initialTasmeeState(), { type: "toggleRecording" }).recording, false);
assert.equal(run(s, { type: "toggleRecording" }).recording, true);
assert.equal(run(s, { type: "toggleRecording" }, { type: "stopRecording" }).recording, false);

// كشف يدوي وتقدّم المؤشر
s = run(s, { type: "revealNext", total: 3 }, { type: "revealNext", total: 3 });
assert.equal(s.cursor, 2);
assert.deepEqual(s.marks, { 0: "ok", 1: "ok" });
s = run(s, { type: "revealNext", total: 3 }, { type: "revealNext", total: 3 });
assert.equal(s.cursor, 3, "لا يتجاوز العدد الكلي");

// الأخطاء: عدّ الخاطئة فقط؛ المنسيّة ليست خطأً في العدّاد
s = run(
  initialTasmeeState("tasmee"),
  { type: "mark", index: 0, mark: "ok" },
  { type: "mark", index: 1, mark: "wrong" },
  { type: "mark", index: 2, mark: "skipped" },
);
assert.equal(s.errors, 1);
assert.equal(s.pendingAlerts, 1);
assert.equal(s.cursor, 3);
// إعادة وسم الخطأ نفسه لا تضاعف التنبيه
assert.equal(run(s, { type: "mark", index: 1, mark: "wrong" }).pendingAlerts, 1);
assert.equal(run(s, { type: "flushAlerts" }).pendingAlerts, 0);

// الرجوع يمسح علامات ما بعد الهدف ويعيد حساب الأخطاء
s = run(s, { type: "back", steps: 2 });
assert.equal(s.cursor, 1);
assert.deepEqual(s.marks, { 0: "ok" });
assert.equal(s.errors, 0);
assert.equal(run(s, { type: "back", steps: 9 }).cursor, 0);

// النظرة الخاطفة تُعدّ تلميحًا لا خطأً
s = run(initialTasmeeState("tasmee"), { type: "peek" }, { type: "peek" });
assert.equal(s.peeks, 2);
assert.equal(s.errors, 0);

// من البداية يصفّر الجلسة ويحافظ على الإخفاء
s = run(s, { type: "mark", index: 0, mark: "wrong" }, { type: "restart" });
assert.deepEqual([s.cursor, s.errors, s.peeks, s.hideAyahs], [0, 0, 0, true]);

// تنبيهات: تبقى تفضيلات المستخدم عند تبديل الوضع
s = run(initialTasmeeState("tasmee"), { type: "alerts", patch: { tone: true, timing: "after-segment" } });
s = run(s, { type: "setMode", mode: "listen" });
assert.equal(s.alerts.tone, true);
assert.equal(s.alerts.timing, "after-segment");

// الرجوع للآية: من منتصفها إلى بدايتها، ثم إلى بداية السابقة
const keys = ["1:1", "1:1", "1:1", "1:2", "1:2", "1:3"];
assert.equal(ayahStartBefore(keys, 4), 3);
assert.equal(ayahStartBefore(keys, 3), 0);
assert.equal(ayahStartBefore(keys, 0), 0);
assert.equal(stepsBackToAyahStart(keys, 5), 2);
assert.equal(ayahStartOf(keys, 2), 0);
assert.equal(ayahEndOf(keys, 3), 4);

// الرابط
assert.equal(wantsTasmeeFromSearch("?tasmee=1"), true);
assert.equal(wantsTasmeeFromSearch("page=3&tasmee=1"), true);
assert.equal(wantsTasmeeFromSearch("?page=3"), false);

console.log("tasmee-v2-session-state ✅");

// إطلاق التنبيه: فوري عند كل خطأ جديد فقط، والمؤجَّل عند نهاية المقطع فقط
{
  const rec = run(initialTasmeeState(), { type: "setMode", mode: "tasmee" }, { type: "toggleRecording" });
  const w1 = run(rec, { type: "mark", index: 0, mark: "wrong" });
  assert.equal(alertToFire(0, w1), "instant", "خطأ جديد يُطلق فورًا");
  assert.equal(alertToFire(1, run(w1, { type: "mark", index: 0, mark: "wrong" })), null, "إعادة الوسم لا تُطلق ثانية");
  assert.equal(alertToFire(0, run(rec, { type: "mark", index: 0, mark: "skipped" })), null, "التجاوز لا يُنبِّه");
  const late = run(rec, { type: "alerts", patch: { timing: "after-segment" } }, { type: "mark", index: 0, mark: "wrong" });
  assert.equal(alertToFire(0, late), null, "المؤجَّل لا يُطلق أثناء التسجيل");
  assert.equal(alertToFire(0, run(late, { type: "stopRecording" })), "after-segment", "ويُطلق عند نهاية المقطع");
}
