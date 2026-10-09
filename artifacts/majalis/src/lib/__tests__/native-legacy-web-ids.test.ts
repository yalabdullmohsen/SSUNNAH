/**
 * يربط نطاقات LegacyWebNotifications.swift بثوابت الويب: إن تغيّر معرّف تذكير ويب
 * ولم تُحدَّث الصدفة الأصلية لبقي تذكيره بجانب نظيره الأصلي فيصل مرتين.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ADHKAR_ID_BASE, ADHKAR_SNOOZE_ID } from "../adhkar-reminders";
import { nativeDailyReminderId } from "../notifications/native-daily-reminders";
import { DHIKR_PHRASE_SLOTS, dhikrPhraseNativeId } from "../dhikr-phrase-reminders";
import { QURAN_DAILY_REMINDER_NATIVE_ID } from "../quran-daily-reminder";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const swift = readFileSync(join(root, "ios/App/SunnahPrayer/Sources/SunnahPrayer/LegacyWebNotifications.swift"), "utf8");

function range(name: string): [number, number] {
  const m = swift.match(new RegExp(`static let ${name} = (\\d+)\\.\\.\\.(\\d+)`));
  assert.ok(m, `range ${name} missing in LegacyWebNotifications.swift`);
  return [Number(m[1]), Number(m[2])];
}

assert.deepEqual(range("adhkarReminders"), [ADHKAR_ID_BASE, ADHKAR_SNOOZE_ID]);
const daily = ["adhkar-morning", "adhkar-evening", "adhkar-sleep", "adhkar-after-salah"].map(nativeDailyReminderId);
assert.deepEqual(range("dailyAdhkar"), [Math.min(...daily), Math.max(...daily)]);
assert.equal(Math.max(...daily) - Math.min(...daily) + 1, daily.length, "adhkar daily ids contiguous");
assert.deepEqual(range("dhikrPhrases"), [dhikrPhraseNativeId(0), dhikrPhraseNativeId(DHIKR_PHRASE_SLOTS.length - 1)]);
assert.deepEqual(range("quranDaily"), [QURAN_DAILY_REMINDER_NATIVE_ID, QURAN_DAILY_REMINDER_NATIVE_ID]);
// النطاق اليومي للأذكار لا يشمل flashcards ولا friday-kahf.
for (const id of ["flashcards-daily", "friday-kahf"]) {
  const n = nativeDailyReminderId(id);
  assert.ok(n < range("dailyAdhkar")[0] || n > range("dailyAdhkar")[1], `${id} outside adhkar range`);
}

console.log("native-legacy-web-ids: all checks passed");
