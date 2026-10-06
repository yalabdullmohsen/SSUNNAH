/**
 * نافذة تنبيهات الصلاة الأصلية متعددة الأيام: كانت اليوم + الغد بدقائق اليوم ⇒ تتوقف إن لم يُفتح التطبيق يومين.
 * الآن حتى 7 أيام بمواقيت كل يوم من المحرك نفسه، مقصوصة بحصة 40 من حد iOS (64).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listNativePrayerScheduleSlotsAhead, NATIVE_PRAYER_WINDOW_DAYS } from "../prayer-alert-scheduler";
import { epochAtZoneMinutes, getPrayerTimes } from "../prayer-times";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tz = "Asia/Kuwait";
const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
const today = await getPrayerTimes(key(new Date()), { lat: 29.37, lon: 47.98, label: "الكويت", timeZone: tz });
const slots = await listNativePrayerScheduleSlotsAhead(today.prayers, tz);

const days = [...new Set(slots.map((s) => s.dateISO))];
assert.ok(days.length >= NATIVE_PRAYER_WINDOW_DAYS - 1, `أيام النافذة: ${days.length}`);
assert.ok(slots.every((s, i) => i === 0 || slots[i - 1].epoch <= s.epoch), "مرتبة زمنيًا");
assert.ok(slots.every((s) => s.epoch > Date.now()), "لا شيء في الماضي");
assert.ok(slots.every((s) => s.slot.obligatory), "الفروض فقط");
const ids = slots.map((s) => `${s.slot.key}@${s.dateISO}`);
assert.equal(new Set(ids).size, ids.length, "لا تكرار");
// كل يوم بمواقيته من المحرك — لا إعادة استعمال دقائق اليوم
for (const d of days.slice(1)) {
  const real = await getPrayerTimes(d, { lat: 29.37, lon: 47.98, label: "الكويت", timeZone: tz });
  for (const s of slots.filter((x) => x.dateISO === d)) {
    const r = real.prayers.find((p) => p.key === s.slot.key)!;
    assert.equal(s.slot.minutes, r.minutes, `${d} ${s.slot.key}`);
    assert.equal(s.epoch, epochAtZoneMinutes(tz, r.minutes!, new Date(Date.parse(`${d}T09:00:00Z`))));
  }
}
assert.match(readFileSync(resolve(root, "src/lib/prayer-local-notifications.ts"), "utf8"), /MAX_NATIVE_PRAYER_NOTIFS = 40;/, "حصة الصلاة 40 من 64");
assert.match(readFileSync(resolve(root, "src/lib/prayer-alert-scheduler.ts"), "utf8"), /await listNativePrayerScheduleSlotsAhead\(payload\.prayers, tz\)/);
console.log("prayer-alerts-multiday.test.ts: ok");
