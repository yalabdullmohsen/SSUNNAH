/**
 * PR W2 — Custom Widget AppIntent strategy gate (OPTION C).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertCustomWidgetStrategy,
  CUSTOM_WIDGET_KIND,
  CUSTOM_WIDGET_STRATEGY,
} from "../widget-data/custom-widget-strategy";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const bundle = readFileSync(resolve(majalis, "ios/App/PrayerWidget/PrayerWidgetBundle.swift"), "utf8");
const custom = readFileSync(resolve(majalis, "ios/App/PrayerWidget/SunnahCustomWidgetCatalog.swift"), "utf8");
const report = readFileSync(
  resolve(majalis, "../../docs/audit/CUSTOM_WIDGET_CONFIGURATION_STRATEGY.md"),
  "utf8",
);

const strategy = assertCustomWidgetStrategy();
assert.equal(strategy.option, "REMOVED");
assert.equal(CUSTOM_WIDGET_KIND, "sunnah.widget.custom");
assert.equal(CUSTOM_WIDGET_STRATEGY.canonicalOwner, null);

assert.doesNotMatch(bundle, /CustomContent/);
assert.doesNotMatch(custom, /struct CustomContent/);

assert.match(report, /CUSTOM_WIDGET_CONFIGURATION_CANONICAL/);
assert.match(report, /DUPLICATE_CUSTOM_KIND_ZERO/);


console.log("ios-widget-custom-strategy-gate.test.ts: ok");
console.log("CUSTOM_WIDGET_CONFIGURATION_CANONICAL");
console.log("DUPLICATE_CUSTOM_KIND_ZERO");
console.log("OLDER_IOS_COMPATIBILITY_EXPLICIT");
console.log("MULTIPLE_INSTANCES_SAFE");
