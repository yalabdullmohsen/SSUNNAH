/**
 * T-048 — App Store Readiness exit gate.
 * Run: node --import tsx src/lib/__tests__/app-store-readiness-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const reportPath = "docs/audit/APP_STORE_READINESS_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)));
const report = readRepo(reportPath);
for (const section of [
  "Metadata Review",
  "Privacy Review",
  "Screenshot Inventory",
  "Reviewer Information",
  "Export Compliance",
  "Owner Actions",
  "Final Status",
  "Exit Decision",
  "APP_STORE_READINESS_COMPLETE",
]) {
  assert.match(report, new RegExp(section));
}

assert.ok(existsSync(resolve(repoRoot, "docs/audit/STORE_RELEASE_CONTENT_CLEARANCE_REPORT.md")));
assert.match(
  readRepo("docs/audit/STORE_RELEASE_CONTENT_CLEARANCE_REPORT.md"),
  /STORE_RELEASE_CONTENT_CLEARED/,
);
assert.ok(existsSync(resolve(repoRoot, "docs/mobile/IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md")));
assert.match(
  readRepo("docs/mobile/IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md"),
  /IOS_NATIVE_ARCHITECTURE_CERTIFIED/,
);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t048-app-store-readiness");
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
const checklist = JSON.parse(readFileSync(resolve(evidenceDir, "checklist.json"), "utf8"));

assert.equal(summary.exit, "APP_STORE_READINESS_COMPLETE");
assert.equal(summary.exitCode, "APP_STORE_READINESS_COMPLETE");
assert.equal(summary.unknown, 0);
assert.equal(summary.fail, 0);
assert.ok(summary.ownerAction >= 1);
assert.ok(summary.pass >= 1);

const allowed = new Set(["PASS", "FAIL", "OWNER_ACTION"]);
assert.ok(Array.isArray(checklist.items));
assert.equal(checklist.items.length, summary.totalItems);
for (const item of checklist.items) {
  assert.ok(allowed.has(item.status), `${item.id} bad status ${item.status}`);
  assert.notEqual(item.status, "UNKNOWN");
  assert.ok(typeof item.evidence === "string" && item.evidence.length > 3, item.id);
}
assert.equal(checklist.items.filter((i: { status: string }) => i.status === "FAIL").length, 0);

assert.equal(summary.screenshots.iPhone.status, "MISSING");
assert.equal(summary.screenshots.iPhoneMax.status, "MISSING");
assert.equal(summary.screenshots.iPad.status, "MISSING");

assert.ok(existsSync(resolve(repoRoot, "docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md")));
assert.ok(existsSync(resolve(majalisRoot, "ios/App/App/PrivacyInfo.xcprivacy")));
const privacy = readMaj("ios/App/App/PrivacyInfo.xcprivacy");
assert.match(privacy, /NSPrivacyTracking/);
assert.match(privacy, /NSPrivacyCollectedDataTypeEmailAddress/);
// الجرد الكامل: النوع → [مرتبط بالهوية؟]. الموقع يُحسب على الجهاز ولا يُرسل → غير مجموع.
assert.doesNotMatch(privacy, /NSPrivacyCollectedDataTypeCoarseLocation|NSPrivacyCollectedDataTypePreciseLocation/);
const declared: Record<string, boolean> = {
  EmailAddress: true, Name: true, PhoneNumber: true, UserID: true, DeviceID: true,
  OtherUserContent: true, ProductInteraction: true, SearchHistory: true,
  CrashData: false, PerformanceData: false,
};
for (const [t, linked] of Object.entries(declared)) {
  assert.match(
    privacy,
    new RegExp(`NSPrivacyCollectedDataType${t}</string>\\s*<key>NSPrivacyCollectedDataTypeLinked</key>\\s*<${linked}/>\\s*<key>NSPrivacyCollectedDataTypeTracking</key>\\s*<false/>`),
    `PrivacyInfo: ${t} linked=${linked}, tracking=false`,
  );
}
assert.equal(
  (privacy.match(/<string>NSPrivacyCollectedDataType[A-Za-z]+<\/string>/g) ?? []).filter((x) => !/Purpose/.test(x)).length,
  Object.keys(declared).length + 1,
  "عدد الأنواع المعلنة = الجرد + AudioData",
);
// اختبار التلاوة يرسل الصوت إلى Groq بعد موافقة: AudioData مجموع، غير مرتبط، بلا تتبع، وظيفة التطبيق
assert.match(
  privacy,
  /NSPrivacyCollectedDataTypeAudioData<\/string>\s*<key>NSPrivacyCollectedDataTypeLinked<\/key>\s*<false\/>\s*<key>NSPrivacyCollectedDataTypeTracking<\/key>\s*<false\/>\s*<key>NSPrivacyCollectedDataTypePurposes<\/key>\s*<array>\s*<string>NSPrivacyCollectedDataTypePurposeAppFunctionality<\/string>/,
);

const info = readMaj("ios/App/App/Info.plist");
assert.match(info, /CFBundleDisplayName/);
assert.match(info, /سُنّة/);
assert.match(info, /ITSAppUsesNonExemptEncryption/);
assert.match(info, /<false\/>/);
assert.match(info, /NSUserNotificationsUsageDescription/);

assert.ok(existsSync(resolve(majalisRoot, "store/app-store/listing.md")));
assert.match(readMaj("store/app-store/listing.md"), /سُنّة/);
assert.match(readMaj("store/app-store/listing.md"), /ssunnah\.com\/privacy/);
assert.ok(existsSync(resolve(majalisRoot, "store/app-store/review-notes.md")));
assert.ok(existsSync(resolve(majalisRoot, "src/pages/account/ui/AccountDeletionView.tsx")));
assert.ok(existsSync(resolve(majalisRoot, "src/views/PrivacyCenterPage.tsx")));

assert.match(readMaj("store/app-store/age-rating.md"), /OWNER_ACTION/);
assert.match(readMaj("store/app-store/age-rating.md"), /competitions|مسابقات/);

console.log(
  `app-store-readiness-gate: ok (pass=${summary.pass}, owner=${summary.ownerAction}, fail=0, unknown=0, exit=${summary.exit})`,
);
