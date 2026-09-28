/**
 * بوابة RCA: انقطاع الأذان المبكر — لا تُلغَ مقاطع adhanSegment عند cancelExcept،
 * ولا يُستدعى إلغاء السلسلة عند foreground بلا سياق استئناف.
 * Run: node --import tsx src/lib/__tests__/adhan-early-stop-rca-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(join(appRoot, rel), "utf8");
}

const localNotif = read("src/lib/prayer-local-notifications.ts");
const app = read("src/App.tsx");
const diag = read("src/lib/adhan-diagnostics.ts");
const pipelineMap = readFileSync(
  resolve(appRoot, "../../docs/performance/ADHAN_PIPELINE_MAP.md"),
  "utf8",
);

// cancelExcept must skip adhanSegment (owned by segment scheduler / smart-cancel)
{
  const fnStart = localNotif.indexOf("export async function cancelPrayerNativeNotificationsExcept");
  assert.ok(fnStart >= 0, "cancelPrayerNativeNotificationsExcept missing");
  const slice = localNotif.slice(fnStart, fnStart + 1800);
  assert.match(slice, /if\s*\(\s*extra\.adhanSegment\s*===\s*true\s*\)\s*continue/);
  assert.doesNotMatch(
    slice,
    /const isPrayer\s*=\s*[\s\S]*extra\.adhanSegment\s*===\s*true/,
    "adhanSegment must not be treated as cancelable prayer notif inside Except",
  );
}

// cancelAll may still cancel adhanSegment (alerts off / reset)
assert.match(
  localNotif,
  /export async function cancelAllPrayerNativeNotifications[\s\S]*extra\.adhanSegment\s*===\s*true/,
);

// App foreground: cancel chain only when resume context exists
{
  const boot = app.indexOf("function PrayerAlertSchedulerBootstrap");
  assert.ok(boot >= 0);
  const slice = app.slice(boot, boot + 6500);
  assert.match(slice, /const ctx = getAdhanResumeContext\(\)/);
  assert.match(slice, /if\s*\(\s*!ctx\s*\)\s*return/);
  assert.match(slice, /resumeInternal:\s*true/);
  assert.doesNotMatch(
    slice,
    /cancelAdhanNotificationChain\(\{\s*resumeInternal:\s*Boolean\(getAdhanResumeContext\(\)\)/,
  );
}

// Diagnostics tags present
for (const tag of [
  "ADHAN_START",
  "SEGMENT_START",
  "ADHAN_STOP",
  "APP_BACKGROUND",
  "APP_FOREGROUND",
  "NOTIFICATION_DISMISSED",
  "ADHAN_COMPLETE",
]) {
  assert.match(diag, new RegExp(tag));
}

assert.match(pipelineMap, /DUPLICATE_SCHEDULER_INTERFERENCE/);
assert.match(pipelineMap, /cancelPrayerNativeNotificationsExcept/);

console.log("adhan-early-stop-rca-gate: PASS");
