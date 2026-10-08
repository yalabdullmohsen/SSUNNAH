/**
 * يمنع رجوع Version/Build عن 1.1.0 / 55 ويوحّد App + Widget + Live Activity.
 * Run: node --import tsx src/lib/__tests__/ios-build-version-traceability-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const pbx = readFileSync(resolve(majalisRoot, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");

const MARKETING_MIN = "1.1.0";
const BUILD_MIN = 55;

const marketing = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
const builds = [...pbx.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) => Number(m[1].trim()));

assert.ok(marketing.length >= 3, "expected MARKETING_VERSION on App + extensions");
assert.ok(builds.length >= 3, "expected CURRENT_PROJECT_VERSION on App + extensions");

for (const v of marketing) {
  assert.equal(v, MARKETING_MIN, `MARKETING_VERSION must be ${MARKETING_MIN}, got ${v}`);
}
for (const b of builds) {
  assert.ok(Number.isFinite(b), "build must be numeric");
  assert.ok(b >= BUILD_MIN, `CURRENT_PROJECT_VERSION ${b} < ${BUILD_MIN}`);
  assert.equal(b, builds[0], "App/Widget/Live Activity builds must match");
}

assert.doesNotMatch(pbx, /MARKETING_VERSION = 1\.0;/);
assert.doesNotMatch(pbx, /MARKETING_VERSION = 1\.0\.1;/); // قناة 1.0.1 أغلقتها Apple (90186)
assert.doesNotMatch(pbx, /CURRENT_PROJECT_VERSION = 54;/);

const tracePath = resolve(majalisRoot, "../../docs/store-release/BUILD_55_TRACEABILITY.md");
const trace = readFileSync(tracePath, "utf8");
assert.match(trace, /BUILT_FROM_MAIN_PLUS_VERSION_PIN/);
assert.match(trace, /1\.0\.1/);
assert.match(trace, /\b55\b/);
assert.match(trace, /CURRENT_APP_STORE_RELEASE/);
assert.match(trace, /NEXT_TESTFLIGHT_RELEASE/);
assert.match(trace, /CURRENT_RELEASE_LIVE|READY_FOR_SALE/);
assert.match(trace, /IOS_AUTH_REPOSITORY_HARDENED/);
assert.match(trace, /DEVICE_RECERTIFICATION_REQUIRED/);
assert.match(trace, /BUILD_55_DEVICE_CERTIFICATION_MISSING/);
// Must not claim device auth certification as achieved
assert.doesNotMatch(trace, /Status[^|\n]*IOS_AUTH_CERTIFIED|Exit[^|\n]*IOS_AUTH_CERTIFIED|`IOS_AUTH_CERTIFIED`\s*=\s*true/i);

console.log("ios-build-version-traceability-gate.test.ts: ok");
