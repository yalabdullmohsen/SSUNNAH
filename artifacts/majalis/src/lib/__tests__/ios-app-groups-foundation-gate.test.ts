/**
 * T-028 — IOS_SHARED_DATA_FOUNDATION_READY
 * تشغيل: node --import tsx src/lib/__tests__/ios-app-groups-foundation-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");
const iosApp = resolve(appRoot, "ios/App");
const APP_GROUP = "group.com.yousef.majlisilm";

const shared = readFileSync(resolve(iosApp, "Shared/SunnahSharedData.swift"), "utf8");
assert.match(shared, new RegExp(APP_GROUP.replace(/\./g, "\\.")));
assert.match(shared, /forbiddenSubstrings/);
// No auth field storage — forbid Keychain writes / token property shapes (not the deny-list literals).
assert.doesNotMatch(shared, /KeychainStore\.set|var\s+accessToken|var\s+refreshToken/);

const pluginTs = readFileSync(resolve(appRoot, "src/lib/plugins/sunnah-shared-data.ts"), "utf8");
assert.match(pluginTs, /SUNNAH_APP_GROUP_ID/);
assert.match(pluginTs, /publishSharedPrayerSnapshot/);

const scheduler = readFileSync(resolve(appRoot, "src/lib/prayer-alert-scheduler.ts"), "utf8");
assert.match(scheduler, /publishPrayerSnapshotForWidgets/);
const publishHelper = readFileSync(
  resolve(appRoot, "src/lib/plugins/sunnah-shared-prayer-publish.ts"),
  "utf8",
);
assert.match(publishHelper, /buildSharedPrayerSnapshotPayload/);
assert.match(publishHelper, /publishSharedPrayerSnapshot/);

const report = readFileSync(resolve(repo, "docs/audit/IOS_APP_GROUPS_FOUNDATION_REPORT.md"), "utf8");
assert.match(report, /IOS_SHARED_DATA_FOUNDATION_READY/);
assert.match(report, new RegExp(APP_GROUP.replace(/\./g, "\\.")));

const contract = readFileSync(resolve(repo, "docs/mobile/IOS_SHARED_DATA_CONTRACT.md"), "utf8");
assert.match(contract, /systemSmall|accessoryInline/);
assert.match(contract, /Complications/);

const arch = readFileSync(resolve(repo, "docs/mobile/IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md"), "utf8");
assert.match(arch, /group\.com\.yousef\.majlisilm|App Groups/);

// No second App Group id in entitlements
for (const ent of [
  "App/App.debug.entitlements",
  "App/App.release.entitlements",
  "PrayerLiveActivity/PrayerLiveActivity.entitlements",
]) {
  const xml = readFileSync(resolve(iosApp, ent), "utf8");
  const groups = [...xml.matchAll(/group\.[a-z0-9.]+/gi)].map((m) => m[0]);
  assert.ok(groups.includes(APP_GROUP), `${ent} missing canonical group`);
  assert.equal(
    groups.filter((g) => g !== APP_GROUP).length,
    0,
    `${ent} has unexpected App Group`,
  );
}

// T-029 may add PrayerWidget; Watch remains forbidden until a later phase.
assert.ok(!existsSync(resolve(iosApp, "SunnahWatch")), "Watch app must not be created yet");
assert.ok(
  existsSync(resolve(iosApp, "PrayerWidget")) || !existsSync(resolve(iosApp, "SunnahWidget")),
  "only PrayerWidget (or no widget) allowed — not a rogue SunnahWidget folder without PrayerWidget",
);

console.log("ios-app-groups-foundation-gate.test.ts: ok", { appGroup: APP_GROUP });
