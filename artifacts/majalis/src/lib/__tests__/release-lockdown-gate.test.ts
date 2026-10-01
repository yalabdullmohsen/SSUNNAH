/**
 * بوابة قفل إصدار iOS-only: minify، أذونات Info.plist، أصول صوت مضغوطة، بلا subset لخطوط عثماني.
 * Android tree retired — لا Gradle/R8.
 * تشغيل: node --import tsx src/lib/__tests__/release-lockdown-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(appRoot, p), "utf8");

assert.equal(existsSync(resolve(appRoot, "android")), false, "android/ retired");

const vite = read("vite.config.ts");
assert.match(vite, /minify:\s*["']esbuild["']/, "Vite production minify عبر esbuild");
assert.match(vite, /drop:.*console/, "إسقاط console في الإنتاج");

const plist = read("ios/App/App/Info.plist");
assert.match(plist, /UIBackgroundModes/, "خلفية");
assert.match(plist, /<string>audio<\/string>/, "خلفية صوت");
assert.match(plist, /NSLocationWhenInUseUsageDescription/, "موقع الصلاة/قبلة");
assert.match(plist, /NSUserNotificationsUsageDescription/, "إشعارات");

const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm;/);

/** أصول الأذان: m4a/mp3/caf فقط — بلا wav غير مضغوط في الحزمة العامة */
function assertNoUncompressedAudio(dir: string): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      assertNoUncompressedAudio(full);
      continue;
    }
    assert.doesNotMatch(name, /\.(wav|aiff|flac)$/i, `أصل غير مضغوط مرفوض: ${full}`);
  }
}
assertNoUncompressedAudio(resolve(appRoot, "public/sounds"));
assertNoUncompressedAudio(resolve(appRoot, "public/audio"));

assert.ok(existsSync(resolve(appRoot, "public/fonts/qpc-v2")), "خطوط QPC موجودة كما هي");
assert.ok(existsSync(resolve(appRoot, "ios/App/App/PrivacyInfo.xcprivacy")), "PrivacyInfo");

const power = read("src/lib/power-saver-engine.ts");
assert.match(power, /ensureLowPowerHints/, "تلميحات بطارية/توفير");
assert.match(power, /getBattery/, "Battery API");

console.log("release-lockdown-gate.test.ts: ok (iOS-only)");
