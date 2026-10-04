/**
 * PR W4 — Widget Center Form Authority gate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertWidgetCenterFormAuthority } from "../widget-data/center-form-authority";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(majalis, "../..");
const view = readFileSync(resolve(majalis, "src/pages/account/ui/WidgetCenterView.tsx"), "utf8");
const report = readFileSync(resolve(repo, "docs/audit/WIDGET_CENTER_FORM_AUTHORITY.md"), "utf8");

const authority = assertWidgetCenterFormAuthority();
assert.equal(authority.rawInteractiveElementsAllowed, false);
assert.equal(authority.webDoesNotRenderWidgetKit, true);

assert.match(view, /from "@\/components\/ui\/button"/);
assert.match(view, /from "@\/components\/ui\/select"/);
assert.match(view, /from "@\/components\/ui\/input"/);
assert.match(view, /SearchInput/);
assert.match(view, /SettingsToggleRow/);
assert.match(view, /FormLabel/);
assert.match(view, /min-h-11 text-base/);

// No raw interactive elements outside component imports.
assert.doesNotMatch(view, /<input\b/);
assert.doesNotMatch(view, /<select\b/);
assert.doesNotMatch(view, /<button\b/);
assert.doesNotMatch(view, /document\.getElementById\("widget-instance"\)/);
assert.doesNotMatch(view, /document\.getElementById\("widget-content-id"\)/);

assert.match(view, /WidgetKit/);
assert.match(view, /المتصفح لا يعرض ويدجت WidgetKit|لا تستبدل WidgetKit/);
assert.match(view, /FUTURE_IOS_UPDATE_REQUIRED|تحديث تطبيق iOS|App Store/);
assert.match(view, /ليست البيانات الحية|معاينة داخل سُنّة/);

assert.match(report, /WIDGET_CENTER_FORM_AUTHORITY_PASS/);
assert.match(report, /RAW_WIDGET_CENTER_INTERACTIONS_ZERO/);
assert.match(report, /NO_MISLEADING_PLATFORM_COPY/);

const pbx = readFileSync(resolve(majalis, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
assert.match(pbx, /CURRENT_PROJECT_VERSION = 55/);

console.log("ios-widget-center-form-gate.test.ts: ok");
console.log("WIDGET_CENTER_FORM_AUTHORITY_PASS");
console.log("RAW_WIDGET_CENTER_INTERACTIONS_ZERO");
console.log("WIDGET_CENTER_PRODUCT_POLISH_PASS");
console.log("NO_MISLEADING_PLATFORM_COPY");
