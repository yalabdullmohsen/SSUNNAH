/**
 * بوابة جدولة تذكيرات الأذكار: ميزانية 64، المنطقة الزمنية، DST، بداية الشهر الهجري،
 * تغيّر الإعدادات، عدم التكرار، والنصوص من بيانات موثّقة بمصدر ودرجة فقط.
 */
import assert from "node:assert/strict";
import {
  REMINDER_CATEGORIES,
  defaultReminderPrefs,
  hijriOf,
  planAdhkarReminders,
  planToSmartItems,
  sourcedAdhkar,
  type AdhkarReminderPrefs,
  type PlanInput,
} from "../adhkar-reminders/plan";
import { computeAdhkarBudget, IOS_PENDING_LIMIT, ADHKAR_ID_BASE } from "../adhkar-reminders";

const PRAYERS = { Fajr: 270, Sunrise: 360, Dhuhr: 720, Asr: 920, Maghrib: 1080, Isha: 1170 };
const allOn = (): AdhkarReminderPrefs => ({
  hijriOffset: 0,
  categories: Object.fromEntries(REMINDER_CATEGORIES.map((c) => [c.id, { enabled: true }])),
});
const only = (cats: AdhkarReminderPrefs["categories"]): AdhkarReminderPrefs => ({
  hijriOffset: 0,
  categories: { ...Object.fromEntries(REMINDER_CATEGORIES.map((c) => [c.id, { enabled: false }])), ...cats },
});
const base = (over: Partial<PlanInput> = {}): PlanInput => ({
  prefs: defaultReminderPrefs(),
  groups: { adhkar: true, occasions: true },
  now: Date.parse("2026-10-06T00:00:00Z"),
  timeZone: "Asia/Kuwait",
  days: 14,
  prayerMinutes: () => PRAYERS,
  budget: 100,
  ...over,
});
const localHM = (tz: string, at: number) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(at));
const localDay = (tz: string, at: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(at));

/* 1) الافتراضي معتدل: الصباح والمساء والكهف فقط */
assert.deepEqual(
  REMINDER_CATEGORIES.filter((c) => c.defaultEnabled).map((c) => c.id).sort(),
  ["evening", "friday-kahf", "morning"],
);

/* 2) الصباح بعد الفجر بالإزاحة، والمساء بعد العصر — بتوقيت الموقع */
const def = planAdhkarReminders(base());
const morning = def.filter((r) => r.categoryId === "morning");
assert.equal(morning.length, 14, "صباح كل يوم من النافذة");
assert.ok(morning.every((r) => localHM("Asia/Kuwait", r.at) === "04:50"), "الفجر 04:30 + 20 دقيقة");
assert.ok(def.filter((r) => r.categoryId === "evening").every((r) => localHM("Asia/Kuwait", r.at) === "15:40"));
assert.ok(def.every((r, i) => i === 0 || def[i - 1].at <= r.at), "مرتّبة زمنيًا");
assert.ok(def.every((r) => r.at > base().now), "لا شيء في الماضي");

/* 3) الجمعة فقط للكهف */
const kahf = def.filter((r) => r.categoryId === "friday-kahf");
assert.equal(kahf.length, 2);
assert.ok(kahf.every((r) => new Date(Date.parse(`${localDay("Asia/Kuwait", r.at)}T12:00:00Z`)).getUTCDay() === 5));
assert.ok(kahf.every((r) => r.url === "/mushaf/18"));

/* 4) ميزانية 64: الخطة لا تتجاوز الميزانية وتحتفظ بالأقرب */
const big = planAdhkarReminders(base({ prefs: allOn(), budget: 10 }));
assert.equal(big.length, 10);
const full = planAdhkarReminders(base({ prefs: allOn(), budget: 1000 }));
assert.deepEqual(big.map((r) => r.at), full.slice(0, 10).map((r) => r.at), "الأقرب أولًا");
assert.equal(computeAdhkarBudget([]), IOS_PENDING_LIMIT - 2);
const prayerPending = Array.from({ length: 30 }, (_, i) => ({ id: 300000 + i, extra: { kind: "prayer-enter" } }));
const other = Array.from({ length: 8 }, (_, i) => ({ id: 9401 + i, extra: { kind: "dhikr-phrase" } }));
const ours = Array.from({ length: 12 }, (_, i) => ({ id: ADHKAR_ID_BASE + i, extra: { kind: "adhkar-reminder" } }));
const budget = computeAdhkarBudget([...prayerPending, ...other, ...ours]);
assert.equal(budget, 64 - 40 - 8 - 2, "الصلاة لها حجز 40 أولًا، وأذكارنا القديمة لا تُحتسب");
assert.ok(30 + 8 + budget <= 64);

/* 5) لا تكرار: نفس الفئة لا تتكرر في نفس اللحظة */
const keys = full.map((r) => `${r.categoryId}@${r.at}`);
assert.equal(new Set(keys).size, keys.length);

/* 6) المنطقة الزمنية: بعد السفر تُحسب الأوقات بمنطقة الموقع الجديد */
const london = planAdhkarReminders(base({ timeZone: "Europe/London" })).filter((r) => r.categoryId === "morning");
assert.ok(london.every((r) => localHM("Europe/London", r.at) === "04:50"), "04:50 بتوقيت لندن لا الكويت");
assert.notEqual(london[0].at, morning[0].at);

/* 7) DST: وقت ثابت 22:30 يبقى 22:30 محليًا قبل التحول الصيفي وبعده (لندن 29 مارس 2026) */
const dstPrefs = only({ sleep: { enabled: true } });
const dst = planAdhkarReminders(base({
  prefs: dstPrefs, timeZone: "Europe/London", now: Date.parse("2026-03-26T00:00:00Z"), days: 6,
})).filter((r) => r.categoryId === "sleep");
assert.equal(dst.length, 6);
assert.ok(dst.every((r) => localHM("Europe/London", r.at) === "22:30"), dst.map((r) => localHM("Europe/London", r.at)).join());
const autumn = planAdhkarReminders(base({ prefs: only({ morning: { enabled: true } }),
  timeZone: "America/New_York", now: Date.parse("2026-10-30T00:00:00Z"), days: 5 })).filter((r) => r.categoryId === "morning");
assert.equal(autumn.length, 4, "30/31 أكتوبر و1/2 نوفمبر");
assert.ok(autumn.every((r) => localHM("America/New_York", r.at) === "04:50"), "انتهاء التوقيت الصيفي");

/* 8) الهجري: الأيام البيض قبلها بيوم، وعرفة مساء 8 ذي الحجة؛ والتصحيح ±يوم */
const yearInput = base({
  prefs: only({ "ayyam-bid": { enabled: true }, arafah: { enabled: true }, ramadan: { enabled: true } }),
  now: Date.parse("2026-10-06T00:00:00Z"), days: 400, budget: 1000,
});
const year = planAdhkarReminders(yearInput);
const nextHijri = (at: number, off = 0) => {
  const k = localDay("Asia/Kuwait", at);
  const [y, m, d] = k.split("-").map(Number);
  return hijriOf(new Date(Date.UTC(y, m - 1, d + 1, 12)).toISOString().slice(0, 10), off)!;
};
const bid = year.filter((r) => r.categoryId === "ayyam-bid");
assert.ok(bid.length >= 36 && bid.length <= 40, `أيام بيض في سنة: ${bid.length}`);
assert.ok(bid.every((r) => [13, 14, 15].includes(nextHijri(r.at).day)));
const arafah = year.filter((r) => r.categoryId === "arafah");
assert.equal(arafah.length, 1);
assert.deepEqual([nextHijri(arafah[0].at).month, nextHijri(arafah[0].at).day], [12, 9]);
const ram = year.filter((r) => r.categoryId === "ramadan");
assert.deepEqual(ram.map((r) => nextHijri(r.at).day).sort((a, b) => a - b), [1, 21]);
const shifted = planAdhkarReminders({ ...yearInput, prefs: { ...yearInput.prefs, hijriOffset: 1 } })
  .filter((r) => r.categoryId === "arafah");
assert.equal(shifted.length, 1);
assert.equal(arafah[0].at - shifted[0].at, 86_400_000, "تصحيح +1 يقدّم التذكير يومًا");

/* 9) تغيّر الإعدادات: الإيقاف، المجموعات، الوقت المخصص، التكرار، الهدوء */
assert.equal(planAdhkarReminders(base({ groups: { adhkar: false, occasions: false } })).length, 0, "المفتاح العام/القسم");
const custom = planAdhkarReminders(base({ prefs: only({ morning: { enabled: true, mode: "time", time: "07:15" } }) }));
assert.ok(custom.every((r) => localHM("Asia/Kuwait", r.at) === "07:15"));
const every3 = planAdhkarReminders(base({ days: 1, now: Date.parse("2026-10-05T21:00:00Z"),
  prefs: only({ salawat: { enabled: true, everyMinutes: 180 } }) }));
assert.deepEqual(every3.map((r) => localHM("Asia/Kuwait", r.at)), ["09:00", "12:00", "15:00", "18:00", "21:00"]);
const quiet = planAdhkarReminders(base({ days: 1, now: Date.parse("2026-10-05T21:00:00Z"),
  prefs: only({ salawat: { enabled: true, everyMinutes: 180 }, morning: { enabled: true } }),
  quiet: { enabled: true, startHour: 20, endHour: 10 } }));
assert.ok(!quiet.some((r) => r.categoryId === "salawat" && ["09:00", "21:00"].includes(localHM("Asia/Kuwait", r.at))));
assert.ok(quiet.some((r) => r.categoryId === "morning"), "المرتبط بالصلاة معفى من الهدوء");

/* 10) بلا مواقيت لا تخمين */
assert.equal(planAdhkarReminders(base({ prayerMinutes: () => null })).filter((r) => r.categoryId === "morning").length, 0);

/* 11) النصوص: كل ذكر من البيانات بمصدر ودرجة، ورابط عميق إليه؛ الضعيف مستبعد */
for (const c of REMINDER_CATEGORIES.filter((x) => x.adhkarCategory)) {
  assert.ok(sourcedAdhkar(c.adhkarCategory!).length > 0, `أذكار موثّقة لـ ${c.id}`);
}
for (const r of full.filter((x) => REMINDER_CATEGORIES.find((c) => c.id === x.categoryId)?.adhkarCategory)) {
  const id = decodeURIComponent(r.url.split("dhikr=")[1] ?? "");
  const item = sourcedAdhkar(REMINDER_CATEGORIES.find((c) => c.id === r.categoryId)!.adhkarCategory!).find((i) => i.id === id);
  assert.ok(item, `رابط عميق لذكر موثّق: ${r.url}`);
  assert.ok(r.body.includes(item.source!) && r.body.includes(item.grade!), "المصدر والدرجة في نص الإشعار");
  assert.ok(r.title.length <= 40);
}
assert.ok(!full.some((r) => /dhikr=adh-(157|161|171)\b/.test(r.url)), "الضعيف لا يدخل الإشعارات");

/* 12) الويب: نافذة 24 ساعة بنفس الخطة */
const web = planToSmartItems(def, base().now);
assert.ok(web.length > 0 && web.every((i) => i.url?.startsWith("/")));
assert.ok(web.length < def.length);

console.log("adhkar-reminders-plan.test.ts: ok");
