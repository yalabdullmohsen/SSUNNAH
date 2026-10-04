/**
 * PR W5 — Widget governance completeness gate (extends existing framework).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertWidgetGovernanceCompleteness,
  WIDGET_DOMAIN_DATA_OWNERS,
  WIDGET_GOVERNANCE_REQUIREMENTS,
} from "../widget-data/governance-completeness";
import { WIDGET_CENTER_CATALOG } from "../widget-data/catalog";
import { assertWidgetCatalogProductJustified } from "../widget-data/catalog-product-justification";
import { assertCustomWidgetStrategy } from "../widget-data/custom-widget-strategy";
import { assertWidgetDataTruthContract } from "../widget-data/data-truth";
import { assertWidgetCenterFormAuthority } from "../widget-data/center-form-authority";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(majalis, "../..");
const iosApp = resolve(majalis, "ios/App");

function readIos(rel: string) {
  return readFileSync(resolve(iosApp, rel), "utf8");
}

const completeness = assertWidgetGovernanceCompleteness();
assert.equal(completeness.ok, true);
assert.equal(completeness.catalogCount, WIDGET_CENTER_CATALOG.length);
assert.ok(WIDGET_GOVERNANCE_REQUIREMENTS.includes("unique_kinds"));
assert.ok(WIDGET_GOVERNANCE_REQUIREMENTS.includes("account_switch_logout_safety"));
assert.ok(WIDGET_DOMAIN_DATA_OWNERS.prayer.includes("prayer-times"));

assertWidgetCatalogProductJustified();
assertCustomWidgetStrategy();
assertWidgetDataTruthContract();
assertWidgetCenterFormAuthority();

const bundle = readIos("PrayerWidget/PrayerWidgetBundle.swift");
const shared = readIos("Shared/SunnahSharedData.swift");
const envelope = readIos("Shared/SunnahWidgetEnvelope.swift");
const refresh = readIos("Shared/SunnahWidgetRefreshCoordinator.swift");
const previews = readIos("PrayerWidget/SunnahWidgetPreviewFixtures.swift");
const entry = readIos("PrayerWidget/PrayerWidgetEntry.swift");
const auth = readFileSync(resolve(majalis, "src/components/AuthProvider.tsx"), "utf8");
const pbx = readIos("App.xcodeproj/project.pbxproj");

assert.match(bundle, /@main/);
assert.match(bundle, /PrayerTimesWidget\(\)/);
assert.match(bundle, /CustomContentStaticWidget\(\)/);
assert.doesNotMatch(bundle, /CustomContentWidget\(\)/);

assert.match(previews, /Never written to App Group/);
assert.match(entry, /galleryPreview/);
assert.match(entry, /isSampleData/);
assert.match(entry, /liveNoData|liveStale|liveMalformed|configurationRequired|permissionRequired/);

assert.match(shared, /staleAfterSeconds/);
assert.match(shared, /classifyPrayerData/);
assert.match(shared, /permissionRequired/);
assert.match(envelope, /decodeIsolated/);
assert.match(envelope, /maxSchema/);
assert.match(refresh, /synchronize|publishEnvelope|reloadTimelines/);
assert.match(refresh, /commitEnvelope|commitPrayer/);

assert.match(auth, /republishSafeWidgetDataAfterAuthChange\("logout"\)/);
assert.match(auth, /republishSafeWidgetDataAfterAuthChange\("account-switch"\)/);

assert.match(pbx, /CURRENT_PROJECT_VERSION = 55/);
assert.doesNotMatch(pbx, /CURRENT_PROJECT_VERSION = 56/);
assert.ok(!existsSync(resolve(iosApp, "SunnahWidget")), "no parallel Widget target");
assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm\.PrayerWidget/);

assert.doesNotMatch(shared, /Adhan\.|praytimes|UmmAlQuraCalculator|quran-api/);
assert.doesNotMatch(envelope, /calculatePrayer|hijriEngine/);

const report = readFileSync(resolve(repo, "docs/audit/WIDGET_GOVERNANCE_COMPLETENESS.md"), "utf8");
assert.match(report, /WIDGET_CATALOG_COMPLETENESS_ENFORCED/);
assert.match(report, /WIDGET_DATA_OWNERSHIP_ENFORCED/);
assert.match(report, /WIDGET_PRIVACY_ENFORCED/);
assert.match(report, /WIDGET_REGISTRATION_DRIFT_PREVENTED/);
assert.match(report, /NO_PARALLEL_GOVERNANCE_ENGINE/);

const physical = readFileSync(resolve(repo, "docs/audit/WIDGET_PHYSICAL_CERTIFICATION_PACKET.md"), "utf8");
assert.match(physical, /WIDGET_PHYSICAL_CERTIFICATION_PACKET_READY/);
assert.match(physical, /DEVICE_REQUIRED/);
assert.doesNotMatch(physical, /PHYSICAL_PASS_CLAIMED/);

const release = readFileSync(resolve(repo, "docs/audit/FUTURE_IOS_RELEASE_PACKET.md"), "utf8");
assert.match(release, /FUTURE_IOS_RELEASE_PACKET_COMPLETE/);
assert.match(release, /FUTURE_IOS_UPDATE_REQUIRED = true/);
assert.match(release, /Do not create a Build/);

console.log("ios-widget-governance-completeness-gate.test.ts: ok", completeness);
console.log("WIDGET_CATALOG_COMPLETENESS_ENFORCED");
console.log("WIDGET_DATA_OWNERSHIP_ENFORCED");
console.log("WIDGET_PRIVACY_ENFORCED");
console.log("WIDGET_REGISTRATION_DRIFT_PREVENTED");
