/**
 * Android retired — يثبت غياب شجرة android وأن جسر TS يبقى no-op على iOS/web.
 * Run: node --import tsx src/lib/__tests__/adhan-android-alarm.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(appRoot, "../..");

assert.equal(
  existsSync(resolve(appRoot, "android")),
  false,
  "artifacts/majalis/android must not exist (ANDROID_PRODUCT_RETIRED)",
);

const bridge = readFileSync(resolve(appRoot, "src/lib/adhan-android-alarm.ts"), "utf8");
assert.match(bridge, /isAdhanAndroidAlarmAvailable|isAndroid/);
assert.ok(existsSync(resolve(repoRoot, "docs/mobile/ANDROID_RETIREMENT_INVENTORY.md")));

console.log("adhan-android-alarm.test.ts: ok (Android retired · bridge kept as no-op)");
