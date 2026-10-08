/**
 * PR W3 — Widget data truth hardening gate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertWidgetDataTruthContract,
  WIDGET_AUTH_PUBLICATION_REASONS,
  WIDGET_AUTH_SAFE_DOMAINS,
  authPublicationReason,
} from "../widget-data/data-truth";
import { buildSunnahWidgetEnvelope } from "../plugins/sunnah-widget-envelope-publish";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(majalis, "../..");

function readApp(rel: string) {
  return readFileSync(resolve(majalis, rel), "utf8");
}
function readIos(rel: string) {
  return readFileSync(resolve(majalis, "ios/App", rel), "utf8");
}

const contract = assertWidgetDataTruthContract();
assert.equal(contract.logoutClearsAccountLinkedSnapshots, true);
assert.equal(contract.accountSwitchRepublishesSafeData, true);
assert.equal(contract.schemaForwardFailureIsolated, true);
assert.equal(contract.staleCountdownDisabled, true);
assert.equal(contract.revokedPermissionActionable, true);
assert.equal(authPublicationReason("logout"), "logout-safe-republish");
assert.equal(authPublicationReason("account-switch"), "account-switch-safe-republish");
assert.ok(WIDGET_AUTH_PUBLICATION_REASONS.includes("logout-safe-republish"));
assert.ok(WIDGET_AUTH_SAFE_DOMAINS.includes("prayer"));

const auth = readApp("src/components/AuthProvider.tsx");
assert.match(auth, /republishSafeWidgetDataAfterAuthChange\("logout"\)/);
assert.match(auth, /republishSafeWidgetDataAfterAuthChange\("account-switch"\)/);
assert.match(auth, /widget-data\/data-truth/);

const dataTruth = readApp("src/lib/widget-data/data-truth.ts");
assert.match(dataTruth, /publishSharedProgressSnapshot/);
assert.match(dataTruth, /REQUIRES_CONFIGURATION/);
assert.match(dataTruth, /assertPublicSafeWidgetJson/);

const publish = readApp("src/lib/plugins/sunnah-widget-envelope-publish.ts");
assert.match(publish, /publicationReason/);
assert.match(publish, /REQUIRES_CONFIGURATION/);
assert.match(publish, /bookmarkMissing/);

const shared = readIos("Shared/SunnahSharedData.swift");
assert.match(shared, /case permissionRequired/);
assert.match(shared, /schemaVersion > SharedPrayerSnapshot\.currentSchema/);
assert.match(shared, /requires_permission|REQUIRES_PERMISSION|denied/);

const envelope = readIos("Shared/SunnahWidgetEnvelope.swift");
assert.match(envelope, /maxSchema/);
assert.match(envelope, /sv > maxSchema/);

const entry = readIos("PrayerWidget/PrayerWidgetEntry.swift");
assert.match(entry, /case \.permissionRequired: return \.permissionRequired/);
assert.match(entry, /allowsLiveCountdown && !isPreview && state == \.validData/);

const views = readIos("PrayerWidget/PrayerWidgetViews.swift");
assert.match(views, /فعّل الموقع/);

const adapters = readIos("PrayerWidget/SunnahWidgetAdapters.swift");
assert.match(adapters, /configurationRequired/);
assert.match(adapters, /presentation\(forSelectedId/);

const plugin = readIos("App/SunnahSharedDataPlugin.swift");
assert.match(plugin, /permissionState/);
assert.match(plugin, /initializationState/);

const pbx = readIos("App.xcodeproj/project.pbxproj");
assert.match(pbx, /CURRENT_PROJECT_VERSION = 55/);
assert.doesNotMatch(pbx, /CURRENT_PROJECT_VERSION = 56/);

const env = buildSunnahWidgetEnvelope(new Date("2026-06-15T11:00:00+03:00"), null, {
  publicationReason: "logout-safe-republish",
});
assert.equal((env as { publicationReason?: string }).publicationReason, "logout-safe-republish");

const report = readFileSync(resolve(repo, "docs/audit/WIDGET_DATA_TRUTH_HARDENING.md"), "utf8");
assert.match(report, /ACCOUNT_SWITCH_WIDGET_SAFE/);
assert.match(report, /LOGOUT_WIDGET_SAFE/);
assert.match(report, /STALE_WIDGET_DATA_SAFE/);
assert.match(report, /SCHEMA_FORWARD_FAILURE_ISOLATED/);
assert.match(report, /PERMISSION_REVOCATION_ACTIONABLE/);

console.log("ios-widget-data-truth-gate.test.ts: ok");
console.log("ACCOUNT_SWITCH_WIDGET_SAFE");
console.log("LOGOUT_WIDGET_SAFE");
console.log("STALE_WIDGET_DATA_SAFE");
console.log("SCHEMA_FORWARD_FAILURE_ISOLATED");
console.log("PERMISSION_REVOCATION_ACTIONABLE");
