/**
 * PR W1 — Widget catalog product justification gate.
 * Run: node --import tsx src/lib/__tests__/ios-widget-catalog-product-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WIDGET_CENTER_CATALOG } from "../widget-data/catalog";
import {
  assertWidgetCatalogProductJustified,
  WIDGET_CATALOG_PRODUCT_JUSTIFICATION,
  WIDGET_DEFERRED_UNREGISTERED,
} from "../widget-data/catalog-product-justification";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(majalis, "../..");
const bundle = readFileSync(
  resolve(majalis, "ios/App/PrayerWidget/PrayerWidgetBundle.swift"),
  "utf8",
);
const customCat = readFileSync(
  resolve(majalis, "ios/App/PrayerWidget/SunnahCustomWidgetCatalog.swift"),
  "utf8",
);

assert.equal(WIDGET_CENTER_CATALOG.length, 32);
assert.equal(WIDGET_CATALOG_PRODUCT_JUSTIFICATION.length, 32);

const counts = assertWidgetCatalogProductJustified();
assert.equal(counts.build55, 1);
assert.equal(counts.keptSeparate, 31);
assert.equal(counts.mergeConfig, 0);
assert.equal(counts.removed, 0);
assert.equal(counts.deferred, 1);

assert.match(bundle, /CustomContentStaticWidget\(\)/);
assert.doesNotMatch(bundle, /CustomContentWidget\(\)/);
assert.match(customCat, /struct CustomContentWidget/);
assert.match(customCat, /struct CustomContentStaticWidget/);
assert.equal(WIDGET_DEFERRED_UNREGISTERED[0]?.struct, "CustomContentWidget");

const report = resolve(repo, "docs/audit/WIDGET_CATALOG_PRODUCT_JUSTIFICATION.md");
assert.ok(existsSync(report));
assert.match(readFileSync(report, "utf8"), /WIDGET_CATALOG_PRODUCT_JUSTIFIED/);
assert.match(readFileSync(report, "utf8"), /DUPLICATE_GALLERY_EXPERIENCES_ZERO/);

console.log("ios-widget-catalog-product-gate.test.ts: ok", counts);
console.log("WIDGET_CATALOG_PRODUCT_JUSTIFIED");
console.log("DUPLICATE_GALLERY_EXPERIENCES_ZERO");
console.log("TIMELINE_COST_CLASSIFIED");
