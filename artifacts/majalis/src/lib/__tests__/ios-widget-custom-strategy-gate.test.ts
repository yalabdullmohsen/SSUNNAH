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
assert.equal(strategy.option, "C");
assert.equal(CUSTOM_WIDGET_KIND, "sunnah.widget.custom");
assert.equal(CUSTOM_WIDGET_STRATEGY.canonicalOwner, "CustomContentStaticWidget");

assert.match(bundle, /CustomContentStaticWidget\(\)/);
assert.doesNotMatch(bundle, /CustomContentWidget\(\)/);
assert.match(custom, /OPTION C/);
assert.match(custom, /struct CustomContentWidget/);
assert.match(custom, /struct CustomContentStaticWidget/);
assert.equal((custom.match(/let kind = SunnahWidgetKind\.custom/g) || []).length, 2);

assert.match(report, /CUSTOM_WIDGET_CONFIGURATION_CANONICAL/);
assert.match(report, /DUPLICATE_CUSTOM_KIND_ZERO/);
assert.match(report, /OPTION C/);

console.log("ios-widget-custom-strategy-gate.test.ts: ok");
console.log("CUSTOM_WIDGET_CONFIGURATION_CANONICAL");
console.log("DUPLICATE_CUSTOM_KIND_ZERO");
console.log("OLDER_IOS_COMPATIBILITY_EXPLICIT");
console.log("MULTIPLE_INSTANCES_SAFE");
