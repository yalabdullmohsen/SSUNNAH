/**
 * بوابة امتثال أصوات iOS: CAF ≤29ث، سطر ترخيص لكل ملف، timeSensitive للأذان فقط، الإذن، أزرار الإشعار.
 * node --import tsx src/lib/__tests__/ios-sound-compliance-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const soundsDir = resolve(root, "ios/App/App/Sounds");
const MAX_SECONDS = 29;

function cafInfo(buf: Buffer): { format: string; seconds: number } {
  assert.equal(buf.toString("ascii", 0, 4), "caff", "ليس CAF");
  let off = 8;
  let rate = 0, fmt = "", bpp = 0, validFrames = -1, dataBytes = 0;
  while (off + 12 <= buf.length) {
    const type = buf.toString("ascii", off, off + 4);
    const size = Number(buf.readBigInt64BE(off + 4));
    const body = off + 12;
    if (type === "desc") {
      rate = buf.readDoubleBE(body);
      fmt = buf.toString("ascii", body + 8, body + 12);
      bpp = buf.readUInt32BE(body + 20);
    } else if (type === "pakt") {
      validFrames = Number(buf.readBigInt64BE(body + 8));
    } else if (type === "data") {
      dataBytes = size < 0 ? buf.length - body : size;
    }
    if (size < 0) break;
    off = body + size;
  }
  assert.ok(rate > 0, "desc مفقود");
  const frames = validFrames >= 0 ? validFrames : bpp > 0 ? (dataBytes - 4) / bpp : 0;
  return { format: fmt, seconds: frames / rate };
}

const files = readdirSync(soundsDir).filter((f) => f.endsWith(".caf"));
assert.ok(files.length > 0);
const licenses = read("ios/App/App/Sounds/LICENSES.md");

for (const f of files) {
  const info = cafInfo(readFileSync(resolve(soundsDir, f)));
  assert.ok(info.seconds > 0 && info.seconds <= MAX_SECONDS, `${f}: ${info.seconds.toFixed(1)}ث تتجاوز ${MAX_SECONDS}ث`);
  assert.ok(["ima4", "lpcm"].includes(info.format), `${f}: صيغة ${info.format} غير مدعومة للإشعار`);
  const stem = f.replace(/\.caf$/, "");
  const prefix = stem.replace(/[-_]\d+$/, "").replace(/-0?1$/, "");
  const hit = licenses.split("\n").some((l) => l.startsWith("|") && (l.includes(f) || l.includes(stem) || l.includes(prefix.replace(/_(aqsa|clear|default|egypt|makkah|quiet|soft|takbeerat)$/, "_*")) || l.includes(prefix + "-01")));
  assert.ok(hit, `${f}: لا سطر ترخيص في Sounds/LICENSES.md`);
}

// timeSensitive: الأذان (دخول الوقت) فقط
const prayer = read("src/lib/prayer-local-notifications.ts");
assert.equal((prayer.match(/interruptionLevel: "timeSensitive",/g) ?? []).length, 1, "timeSensitive لإشعار دخول الوقت فقط");
assert.match(prayer, /interruptionLevel: "timeSensitive",\s*actionTypeId: ADHAN_ACTION_TYPE/);
assert.doesNotMatch(read("src/lib/quran-daily-reminder.ts"), /timeSensitive/);
assert.doesNotMatch(read("src/lib/adhkar-reminders/index.ts"), /"timeSensitive"/);
assert.doesNotMatch(read("src/data/adhkar-reminder-categories.json"), /timeSensitive/);

// الإذن في ملفات entitlements الثلاثة
for (const e of ["App", "App.debug", "App.release"]) {
  assert.match(read(`ios/App/App/${e}.entitlements`), /com\.apple\.developer\.usernotifications\.time-sensitive<\/key>\s*<true\/>/, e);
}

// أزرار إشعار الأذان
const actions = read("src/lib/adhan-notification-actions.ts");
assert.match(actions, /إيقاف الصوت/);
assert.match(actions, /ذكّرني بعد 5 دقائق/);
assert.match(read("src/lib/notifications/native-bootstrap.ts"), /handleAdhanAction/);

console.log(`ios-sound-compliance-gate: OK (${files.length} ملف صوت)`);
