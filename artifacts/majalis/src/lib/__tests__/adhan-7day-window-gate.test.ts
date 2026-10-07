/**
 * نافذة 7 أيام لمقاطع الأذان (iOS) + ميزانية الإشعارات المشتركة (حد 64، حصة الصلاة 40).
 * node --import tsx src/lib/__tests__/adhan-7day-window-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADHAN_SEGMENT_ID_BASE,
  ADHAN_SEGMENT_ID_SPAN,
  assignAdhanChainIdBases,
  FULL_ADHAN_CHAIN_SLOTS,
  IOS_PENDING_LIMIT,
  NATIVE_WINDOW_DAYS,
  plannedNativeCount,
  planPrayerNativeWindow,
  PRAYER_NATIVE_SHARE,
  type WindowSlotInput,
} from "../prayer-native-budget";
import { calendarNoonInZone, epochAtZoneMinutes } from "../prayer-times";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const slots = (n: number, s: Partial<WindowSlotInput>): WindowSlotInput[] =>
  Array.from({ length: n }, () => ({ alertCount: 0, iosFullAdhan: false, chainLength: 4, ...s }));

console.log("=== الميزانية: 64 = 40 صلاة + 24 أذكار ===");
assert.equal(IOS_PENDING_LIMIT, 64);
assert.equal(PRAYER_NATIVE_SHARE, 40);
assert.equal(NATIVE_WINDOW_DAYS, 7);
assert.equal(IOS_PENDING_LIMIT - PRAYER_NATIVE_SHARE, 24, "حصة الأذكار محفوظة");
assert.match(read("src/lib/prayer-local-notifications.ts"), /MAX_NATIVE_PRAYER_NOTIFS = 40;/);

console.log("=== 7 أيام كاملة بأذان iOS (35 صلاة) ===");
{
  const plan = planPrayerNativeWindow(slots(35, { iosFullAdhan: true }));
  assert.equal(plan.filter((p) => p.include).length, 35, "كل صلوات 7 أيام مشمولة");
  assert.ok(plannedNativeCount(plan) <= PRAYER_NATIVE_SHARE, "لا تتجاوز حصة الصلاة");
  assert.ok(plan.every((p) => p.segmentMode !== "none"));
  assert.equal(plan[0].segmentMode, "full", "أقرب صلاة تأخذ المتبقي كأذان كامل");
  assert.equal(plan[34].segmentMode, "short", "الأبعد بمقطع قصير");
}

console.log("=== لا يتجاوز 40 أبدًا، ولا فجوات في المنتصف ===");
for (const alertCount of [0, 1, 2, 3, 4]) {
  for (const iosFullAdhan of [false, true]) {
    for (const chainLength of [1, 2, 4]) {
      const plan = planPrayerNativeWindow(slots(35, { alertCount, iosFullAdhan, chainLength }));
      assert.ok(plannedNativeCount(plan) <= PRAYER_NATIVE_SHARE, `${alertCount}/${iosFullAdhan}/${chainLength}`);
      const firstOut = plan.findIndex((p) => !p.include);
      if (firstOut >= 0) assert.ok(plan.slice(firstOut).every((p) => !p.include), "تقطيع متصل");
      assert.ok(plan.filter((p) => p.segmentMode === "full").length <= FULL_ADHAN_CHAIN_SLOTS);
    }
  }
}

console.log("=== التنبيهات المفعّلة تُقصّر النافذة بدل أن تجور على الأذكار ===");
{
  const plan = planPrayerNativeWindow(slots(35, { alertCount: 3, iosFullAdhan: true }));
  const included = plan.filter((p) => p.include).length;
  assert.ok(included >= 8 && included < 35, `نافذة مقصوصة (${included})`);
  assert.ok(plannedNativeCount(plan) <= PRAYER_NATIVE_SHARE);
}

console.log("=== معرّفات مقاطع الأذان: فريدة وحتمية وضمن النطاق (لا تكرار للإشعار) ===");
{
  const keys: string[] = [];
  for (let d = 0; d < 7; d++) for (const p of ["fajr", "dhuhr", "asr", "maghrib", "isha"]) keys.push(`${p}:2026-10-${String(8 + d).padStart(2, "0")}`);
  const a = assignAdhanChainIdBases(keys);
  const b = assignAdhanChainIdBases([...keys].reverse());
  assert.equal(a.size, 35);
  const used = new Set<number>();
  for (const base of a.values()) {
    for (let i = 0; i < 4; i++) {
      assert.ok(!used.has(base + i), "لا معرّف مكرر");
      used.add(base + i);
    }
    assert.ok(base >= ADHAN_SEGMENT_ID_BASE && base + 3 < ADHAN_SEGMENT_ID_BASE + ADHAN_SEGMENT_ID_SPAN);
  }
  // الحتمية لا تعتمد على الترتيب إلا عند التصادم؛ نفس المفتاح غالبًا نفس المعرّف بين الجلسات
  let same = 0;
  for (const k of keys) if (a.get(k) === b.get(k)) same++;
  assert.ok(same >= 30, `استقرار المعرّفات بين الجلسات (${same}/35)`);
}

console.log("=== DST وتغيّر المنطقة: أوقات كل يوم بمواقيت محلية صحيحة ===");
{
  const localMinutes = (tz: string, epoch: number) => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(epoch));
    return Number(p.find((x) => x.type === "hour")!.value) * 60 + Number(p.find((x) => x.type === "minute")!.value);
  };
  const cases: Array<[string, string, number]> = [
    ["America/New_York", "2026-03-05T12:00:00Z", 5 * 60 + 30],
    ["Europe/London", "2026-03-26T12:00:00Z", 4 * 60 + 40],
    ["America/New_York", "2026-11-01T12:00:00Z", 18 * 60 + 5],
    ["Asia/Kuwait", "2026-10-08T12:00:00Z", 4 * 60 + 15],
  ];
  for (const [tz, start, minutes] of cases) {
    let prev = 0;
    for (let d = 0; d < 7; d++) {
      const noon = calendarNoonInZone(tz, new Date(new Date(start).getTime() + d * 24 * 3600_000));
      const epoch = epochAtZoneMinutes(tz, minutes, noon);
      assert.equal(localMinutes(tz, epoch), minutes, `${tz} يوم ${d}: الدقيقة المحلية ثابتة عبر DST`);
      if (prev) {
        const gapH = (epoch - prev) / 3600_000;
        assert.ok(gapH >= 22.9 && gapH <= 25.1, `${tz} يوم ${d}: فاصل ${gapH}h`);
      }
      prev = epoch;
    }
  }
  // تغيّر المنطقة: لحظة الصلاة نفسها تختلف بين منطقتين (لا يُعاد استعمال epoch قديم)
  const kw = epochAtZoneMinutes("Asia/Kuwait", 300, calendarNoonInZone("Asia/Kuwait", new Date("2026-10-08T12:00:00Z")));
  const ny = epochAtZoneMinutes("America/New_York", 300, calendarNoonInZone("America/New_York", new Date("2026-10-08T12:00:00Z")));
  assert.notEqual(kw, ny, "تغيّر المنطقة يغيّر اللحظات");
}

console.log("=== التوصيل: نافذة واحدة مشتركة، إعادة جدولة عند الفتح/اليوم/المنطقة/الإعدادات ===");
{
  const sched = read("src/lib/adhan-scheduler.ts");
  assert.match(sched, /async function scheduleIosAdhanWindow/);
  assert.match(sched, /listNativePrayerScheduleSlotsAhead/);
  assert.match(sched, /planNativePrayerWindow/);
  assert.match(sched, /assignAdhanChainIdBases/);
  assert.match(sched, /cancelStaleAdhanSegments/);
  assert.doesNotMatch(sched, /upcomingPrayerEpochs/, "لا نافذة يومين قديمة");
  const alerts = read("src/lib/prayer-alert-scheduler.ts");
  assert.match(alerts, /planNativePrayerWindow\(slots, prefs\)/);
  assert.match(alerts, /for \(const \{ slot, epoch, dateISO \} of planned\)/, "التنبيهات تلتزم بالخطة المشتركة");
  const seg = read("src/lib/adhan-ios-segments.ts");
  assert.match(seg, /idBase\?: number/);
  assert.match(seg, /dayKey\?: string/);
  assert.match(seg, /extra\?\.adhanSegment === true && !keepIds\.has/, "تنظيف المقاطع اليتيمة");
  const app = read("src/App.tsx");
  assert.equal((app.match(/majalis:boot-adhan-reschedule/g) ?? []).length >= 3, true, "فتح + عودة + يوم/منطقة");
  assert.match(app, /majalis:adhan-prefs-changed/, "تغيّر الإعدادات");
  assert.match(read("src/lib/sovereign/prayer-geo-silent.ts"), /startAdhanScheduler/, "تغيّر الموقع");
}

console.log("adhan-7day-window-gate: ok");
