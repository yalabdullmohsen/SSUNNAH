/**
 * نص شريط الصلاة — نافذة «حان وقت» والعدّ المدمج.
 * تشغيل: node --import tsx src/lib/__tests__/prayer-ticker-copy.test.ts
 */
import assert from "node:assert/strict";
import {
  buildPrayerChipCopy,
  buildPrayerTickerCopy,
  formatAdhanRemainingPhrase,
  formatChipDuration,
  PRAYER_CHIP_NOW_WINDOW_SEC,
} from "../prayer-ticker-copy";

{
  const now = buildPrayerTickerCopy({
    prayerName: "الظهر",
    remainingHms: "٠٠:٠٠:٠٠",
    sinceSeconds: 12,
    sinceHms: "٠٠:٠٠:١٢",
  });
  assert.equal(now.isNow, true);
  assert.match(now.text, /حان وقت الظهر/);
}

{
  const since = buildPrayerTickerCopy({
    prayerName: "العصر",
    remainingHms: "٠٠:٠٠:٠٠",
    sinceSeconds: PRAYER_CHIP_NOW_WINDOW_SEC,
    sinceHms: "٠٠:٠٢:٠٠",
  });
  assert.equal(since.isNow, false);
  assert.match(since.label, /مضى على أذان العصر/);
  assert.equal(since.text, "٠٠:٠٢:٠٠");
}

{
  const rem = buildPrayerTickerCopy({
    prayerName: "المغرب",
    remainingHms: "٠١:٠٢:٠٣",
    sinceSeconds: null,
    sinceHms: null,
  });
  assert.equal(rem.isNow, false);
  assert.equal(rem.label, "المغرب");
  assert.equal(rem.text, "٠١:٠٢:٠٣");
}

{
  assert.equal(formatAdhanRemainingPhrase(27 * 60), "٢٧ دقيقة");
  assert.equal(formatAdhanRemainingPhrase(72 * 60), "ساعة و١٢ دقيقة");
  assert.equal(formatChipDuration(4500), "ساعة و١٥ دقيقة");
  const chip = buildPrayerChipCopy({
    prayerName: "المغرب",
    remainingSeconds: 27 * 60,
    sinceSeconds: null,
  });
  assert.equal(chip.text, "متبقي على المغرب: ٢٧ دقيقة");
  assert.equal(chip.urgent, false);
}

{
  const atAdhan = buildPrayerChipCopy({ prayerName: "المغرب", remainingSeconds: 0, sinceSeconds: 0 });
  assert.equal(atAdhan.text, "مضى أقل من دقيقة على أذان المغرب");
  const after = buildPrayerChipCopy({ prayerName: "المغرب", remainingSeconds: 0, sinceSeconds: 12 * 60 + 40 });
  assert.equal(after.text, "مضى ١٢ دقيقة على أذان المغرب", "دقائق مكتملة بلا تقريب لأعلى");
  assert.equal(/[0-9]/.test(after.text), false);
  assert.doesNotMatch(after.text, /\d{1,2}:\d{2}/);
  assert.equal(
    buildPrayerChipCopy({ prayerName: "العشاء", remainingSeconds: 0, sinceSeconds: 90 * 60 }).text,
    "مضى ساعة و٣٠ دقيقة على أذان العشاء",
  );
}

{
  const isha = buildPrayerChipCopy({
    prayerName: "العشاء",
    remainingSeconds: 9,
    sinceSeconds: null,
  });
  assert.match(isha.text, /متبقي على العشاء: دقيقة/);
  assert.equal(/[0-9]/.test(isha.text), false);
}

console.log("prayer-ticker-copy.test.ts: ok");
