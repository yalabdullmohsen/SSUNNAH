/**
 * بوابة PR8: صفحة المواقيت لا تُعاد رسمها كل ثانية — العدّ في ورقة حية فقط.
 * Run: node --import tsx src/lib/__tests__/prayer-page-tick-isolation-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const page = read("src/pages/worship/ui/PrayerTimesView.tsx");
const provider = read("src/components/prayer/PrayerCountdownProvider.tsx");

assert.match(provider, /PrayerSlotContext|useSharedPrayerSlot/);
assert.match(provider, /sameSlot|deriveSlot/);
assert.match(page, /useSharedPrayerData/);
assert.match(page, /useSharedPrayerSlot/);
assert.match(page, /PrayerHeroCountdownValue/);
assert.match(page, /useSharedPrayerCountdownLive/);
assert.doesNotMatch(page, /useSharedPrayerCountdown\s*\(/);
assert.doesNotMatch(page, /subscribeSecondTick/);

console.log("prayer-page-tick-isolation-gate.test.ts: ok");
