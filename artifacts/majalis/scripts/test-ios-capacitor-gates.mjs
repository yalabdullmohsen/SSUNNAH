#!/usr/bin/env node
/**
 * Static iOS/Capacitor gates — runnable on Linux CI without Xcode.
 * Does NOT archive or publish to TestFlight.
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iosApp = join(root, "ios", "App");

let failed = 0;
function ok(cond, msg) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

console.log("=== iOS Capacitor static gates ===\n");

const plist = readFileSync(join(iosApp, "App", "Info.plist"), "utf8");
ok(plist.includes("<key>CFBundleURLTypes</key>"), "CFBundleURLTypes present");
ok(plist.includes("<string>majlisilm</string>"), "CFBundleURLSchemes includes majlisilm");
ok(plist.includes("UIBackgroundModes"), "UIBackgroundModes declared");
ok(plist.includes("<string>audio</string>"), "background audio mode");
ok(
  plist.includes("NSAllowsArbitraryLoads") && /NSAllowsArbitraryLoads<\/key>\s*<false\/>/s.test(plist),
  "ATS NSAllowsArbitraryLoads=false",
);

const pbx = readFileSync(join(iosApp, "App.xcodeproj", "project.pbxproj"), "utf8");
const privacyBuildFiles = (pbx.match(/\/\* PrivacyInfo\.xcprivacy in Resources \*\/ = \{isa = PBXBuildFile/g) || []).length;
ok(privacyBuildFiles === 1, `PrivacyInfo.xcprivacy PBXBuildFile exactly once (got ${privacyBuildFiles})`);
const playbackBuildFiles = (pbx.match(/\/\* MajlisPlaybackAudioPlugin\.swift in Sources \*\/ = \{isa = PBXBuildFile/g) || []).length;
ok(playbackBuildFiles === 1, `MajlisPlaybackAudioPlugin.swift PBXBuildFile exactly once (got ${playbackBuildFiles})`);
ok(
  /504EC3001FED79650016851F \/\* Sources \*\/ = \{[\s\S]*MajlisPlaybackAudioPlugin\.swift in Sources[\s\S]*?\};/.test(pbx),
  "MajlisPlaybackAudioPlugin listed under App target Sources",
);
ok(
  /504EC3021FED79650016851F \/\* Resources \*\/ = \{[\s\S]*PrivacyInfo\.xcprivacy in Resources[\s\S]*?\};/.test(pbx),
  "PrivacyInfo listed under App target Resources",
);

const deployTargets = [...pbx.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = ([0-9.]+);/g)].map((m) => m[1]);
ok(deployTargets.length > 0, "deployment targets present");
ok(
  deployTargets.every((t) => t === "16.2"),
  `all deployment targets are 16.2 (got ${[...new Set(deployTargets)].join(",")})`,
);

ok(existsSync(join(iosApp, "App", "PrivacyInfo.xcprivacy")), "PrivacyInfo.xcprivacy file exists");
ok(existsSync(join(iosApp, "App", "MajlisPlaybackAudioPlugin.swift")), "MajlisPlaybackAudioPlugin.swift exists");

const pluginSwift = readFileSync(join(iosApp, "App", "MajlisPlaybackAudioPlugin.swift"), "utf8");
ok(pluginSwift.includes("CAPBridgedPlugin"), "plugin conforms to CAPBridgedPlugin");
ok(pluginSwift.includes('jsName = "MajlisPlaybackAudio"'), "plugin jsName MajlisPlaybackAudio");
ok(pluginSwift.includes("enablePlayback"), "enablePlayback method");
ok(pluginSwift.includes("enableRecording"), "enableRecording method");
ok(pluginSwift.includes("deactivate"), "deactivate method");
ok(pluginSwift.includes("MPNowPlayingInfoCenter"), "Now Playing metadata center");
ok(pluginSwift.includes("MPRemoteCommandCenter"), "remote transport commands");
ok(pluginSwift.includes("reassertPlaybackIfNeeded"), "background session reassert");
ok(pluginSwift.includes("interruptionNotification"), "handles audio interruptions");
ok(pluginSwift.includes("routeChangeNotification"), "handles route changes");
ok(!/try\?/.test(pluginSwift), "plugin does not swallow errors with try?");
ok(!/call\.resolve\(\[\]\)/.test(pluginSwift), "plugin does not resolve empty on failure");
ok(pluginSwift.includes("AUDIO_SESSION_FAILED"), "playback rejects with AUDIO_SESSION_FAILED code");
ok(pluginSwift.includes("mediaServicesWereResetNotification"), "playback observes media services reset");
ok(
  /setCategory\(\s*\.playback[\s\S]*?options:\s*\[\s*\.allowAirPlay,\s*\.allowBluetoothA2DP\s*\]/.test(pluginSwift),
  "playback category without duckOthers (continuous media)",
);

// حذف تام لميزة التسميع بالذكاء الاصطناعي — افحص الإزالة، لا تقرأ ملفات محذوفة
ok(!existsSync(join(iosApp, "App", "MajlisSpeechRecognitionPlugin.swift")), "speech recognition plugin removed");
ok(!existsSync(join(iosApp, "App", "RecitationAudioCapturePlugin.swift")), "recitation capture plugin removed");
ok(
  !existsSync(join(root, "src", "lib", "plugins", "speech-recognition.ts")),
  "JS speech-recognition bridge removed",
);
ok(!existsSync(join(root, "android")), "Android product tree retired (no artifacts/majalis/android)");
ok(!plist.includes("NSSpeechRecognitionUsageDescription"), "Info.plist has no speech recognition usage");
// نص إذن الميكروفون موحَّد حرفيًا (scripts/mic-usage-description.txt): وضع التسميع على الجهاز فقط، لا يُرسل ولا يُحفظ.
// أي تغيير يلزم تعديل الملف الموحَّد معًا مع Info.plist وصفحة الخصوصية. التعرّف الصوتي الأصلي (Speech) يبقى محظورًا.
{
  const canonical = readFileSync(join(root, "scripts/mic-usage-description.txt"), "utf8").trim();
  const m = plist.match(/<key>NSMicrophoneUsageDescription<\/key>\s*<string>([^<]*)<\/string>/);
  ok(m !== null && m[1] === canonical, "Info.plist NSMicrophoneUsageDescription equals the unified text exactly");
}
ok(!pbx.includes("MajlisSpeechRecognitionPlugin.swift"), "pbxproj has no speech plugin");
ok(!pbx.includes("RecitationAudioCapturePlugin.swift"), "pbxproj has no capture plugin");
ok(!pbx.includes("MajlisSpeechRecognition"), "pbxproj has no MajlisSpeechRecognition symbol");

// منع تكرار خلل f9995028: حذف التعريف مع بقاء استخدام المتغير
{
  const gateSrc = readFileSync(fileURLToPath(import.meta.url), "utf8");
  // ابْنِ النمط دون كتابة المعرّف متبوعًا بـ .includes في المصدر (حتى لا يطابق الفحص نفسه)
  const usesVarMethod = (name) => new RegExp(String.raw`\b${name}\s*\.\s*includes\b`).test(gateSrc);
  ok(!/\bconst\s+speechSwift\b/.test(gateSrc), "gate must not declare speechSwift");
  ok(!usesVarMethod("speechSwift"), "gate must not call methods on speechSwift");
  ok(!/\bconst\s+captureSwift\b/.test(gateSrc), "gate must not declare captureSwift");
  ok(!usesVarMethod("captureSwift"), "gate must not call methods on captureSwift");
  ok(!/\bconst\s+speechJs\b/.test(gateSrc), "gate must not declare speechJs");
  ok(
    !/readFileSync\([^\n]*MajlisSpeechRecognitionPlugin\.swift/.test(gateSrc),
    "gate must not readFileSync deleted speech plugin",
  );
  ok(
    !/readFileSync\([^\n]*RecitationAudioCapturePlugin\.swift/.test(gateSrc),
    "gate must not readFileSync deleted capture plugin",
  );
  ok(
    !/readFileSync\([^\n]*speech-recognition\.ts/.test(gateSrc),
    "gate must not readFileSync deleted JS speech bridge",
  );
}

const privacy = readFileSync(join(iosApp, "App", "PrivacyInfo.xcprivacy"), "utf8");
ok(privacy.includes("NSPrivacyTracking"), "PrivacyInfo declares tracking key");
ok(/NSPrivacyTracking<\/key>\s*<false\/>/s.test(privacy), "PrivacyInfo tracking=false");
ok(privacy.includes("NSPrivacyAccessedAPICategoryUserDefaults"), "PrivacyInfo declares UserDefaults API reason");
ok(
  !privacy.includes("NSPrivacyAccessedAPICategoryDiskSpace") &&
    !privacy.includes("NSPrivacyAccessedAPICategorySystemBootTime"),
  "PrivacyInfo does not invent unused Required Reason APIs",
);
ok(!privacy.includes("NSPrivacyCollectedDataTypeAudioData"), "PrivacyInfo: no AudioData (tasmee is on-device only)");
for (const t of ["EmailAddress", "Name", "PhoneNumber", "UserID", "DeviceID", "OtherUserContent", "ProductInteraction", "SearchHistory"]) {
  ok(
    new RegExp(`NSPrivacyCollectedDataType${t}</string>\\s*<key>NSPrivacyCollectedDataTypeLinked</key>\\s*<true/>`, "s").test(privacy),
    `PrivacyInfo declares ${t} (linked)`,
  );
}
for (const t of ["CrashData", "PerformanceData"]) {
  ok(
    new RegExp(`NSPrivacyCollectedDataType${t}</string>\\s*<key>NSPrivacyCollectedDataTypeLinked</key>\\s*<false/>`, "s").test(privacy),
    `PrivacyInfo declares ${t} (not linked)`,
  );
}
ok(!privacy.includes("NSPrivacyCollectedDataTypeCoarseLocation"), "PrivacyInfo: no Location (stays on device)");

const live = readFileSync(
  join(iosApp, "PrayerLiveActivity", "PrayerLiveActivityLiveActivity.swift"),
  "utf8",
);
const prayerDeepLink = readFileSync(join(iosApp, "Shared", "SunnahPrayerDeepLink.swift"), "utf8");
ok(
  prayerDeepLink.includes("https://www.ssunnah.com/prayer-times"),
  "shared SunnahPrayerDeepLink uses https universal link on www.ssunnah.com",
);
ok(
  live.includes("SunnahPrayerDeepLink.prayerTimes") || live.includes("https://www.ssunnah.com/prayer-times"),
  "Live Activity widgetURL uses https universal link on www.ssunnah.com",
);

const entitlements = readFileSync(join(iosApp, "App", "App.entitlements"), "utf8");
ok(entitlements.includes("applinks:majlisilm.com"), "associated domains applinks");
ok(entitlements.includes("applinks:www.ssunnah.com"), "associated domains include production host");
ok(entitlements.includes("applinks:ssunnah.com"), "associated domains include ssunnah apex");

const deepLink = readFileSync(join(root, "src", "lib", "native-deep-link.ts"), "utf8");
ok(deepLink.includes("majlisilm"), "native-deep-link handles custom scheme");
ok(deepLink.includes("TRUSTED_HTTPS_HOSTS"), "native-deep-link trusts only majlisilm hosts");

const mainTsx = readFileSync(join(root, "src", "main.tsx"), "utf8");
ok(mainTsx.includes("mapShareOrDeepLink"), "main.tsx wires deep-link map (blocks staging/open-redirect)");
ok(mainTsx.includes("shouldNavigateNativeDeepLink"), "main.tsx guards deep-link navigation");
const deepLinkMap = readFileSync(join(root, "src", "lib", "sync-engine", "deep-link-map.ts"), "utf8");
ok(deepLinkMap.includes("resolveNativeDeepLinkPath"), "deep-link-map delegates HTTPS/custom scheme to native resolver");
ok(
  !/ensureNativePlaybackAudioSession\(\)/.test(mainTsx),
  "main.tsx does not activate AVAudioSession at launch",
);

const playbackTs = readFileSync(join(root, "src", "lib", "native-playback-audio.ts"), "utf8");
ok(playbackTs.includes("ensureNativeRecordingAudioSession"), "JS bridge exposes recording mode");
ok(playbackTs.includes("deactivateNativeAudioSession"), "JS bridge exposes deactivate");

const audioEngine = readFileSync(join(root, "src", "core", "audio", "AudioEngine.ts"), "utf8");
ok(audioEngine.includes("activatePlaybackSession"), "AudioEngine activates session before play");
ok(audioEngine.includes("releasePlaybackSession"), "AudioEngine releases session on stop");

const ayahPlayer = readFileSync(join(root, "src", "hooks", "useAyahPlayer.ts"), "utf8");
ok(ayahPlayer.includes("ensureNativePlaybackAudioSession"), "useAyahPlayer activates native playback session");
ok(ayahPlayer.includes("deactivateNativeAudioSession"), "useAyahPlayer deactivates native session on stop");

// UUID sanity: PBX ids are 24 hex chars
const idRe = /\b([0-9A-Fa-f]{24})\b/g;
const ids = [...pbx.matchAll(idRe)].map((m) => m[1]);
ok(ids.length > 20, "pbxproj contains 24-char hex IDs");

// Stronger check: BuildFile IDs must be unique among BuildFile entries
const buildFileIds = [...pbx.matchAll(/^\s+([0-9A-Fa-f]{24}) \/\*.* in (Sources|Resources) \*\/ = \{isa = PBXBuildFile/gm)].map(
  (m) => m[1],
);
const bfSet = new Set(buildFileIds);
ok(bfSet.size === buildFileIds.length, "no duplicate PBXBuildFile IDs");

// كل مرجع «X in Resources» داخل مرحلة Resources يجب أن يملك PBXBuildFile معرّفًا
const resourcePhaseRefs = [
  ...pbx.matchAll(
    /504EC3021FED79650016851F \/\* Resources \*\/ = \{[\s\S]*?files = \(([\s\S]*?)\);/g,
  ),
];
ok(resourcePhaseRefs.length === 1, "App Resources build phase found once");
const resourceIds = [...resourcePhaseRefs[0][1].matchAll(/^\s+([0-9A-Fa-f]{24}) \/\*/gm)].map((m) => m[1]);
const missingBf = resourceIds.filter(
  (id) => !new RegExp(`${id} \\/\\*[^*]+\\*\\/ = \\{isa = PBXBuildFile`).test(pbx),
);
ok(
  missingBf.length === 0,
  `every Resources entry has PBXBuildFile (missing=${missingBf.join(",") || "none"})`,
);
ok(
  pbx.includes(
    "AD11BF09A1B2C3D4E5F6071890 /* adhan-seq-makkah-04.caf in Resources */ = {isa = PBXBuildFile",
  ),
  "adhan-seq-makkah-04.caf has PBXBuildFile (not dangling Resources ref)",
);

ok(
  /CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/s.test(plist),
  "App Info.plist CFBundleVersion uses $(CURRENT_PROJECT_VERSION)",
);
const livePlist = readFileSync(join(iosApp, "PrayerLiveActivity", "Info.plist"), "utf8");
ok(
  /CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/s.test(livePlist),
  "PrayerLiveActivity CFBundleVersion uses $(CURRENT_PROJECT_VERSION)",
);
ok(
  /ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/s.test(plist),
  "Info.plist declares ITSAppUsesNonExemptEncryption=false (export compliance)",
);

const secretPatterns = [
  /service_role/i,
  /BEGIN (RSA |EC )?PRIVATE KEY/,
  /sk_live_[A-Za-z0-9]+/,
  /SUPABASE_SERVICE_ROLE/,
];
function scanTree(relPaths) {
  for (const rel of relPaths) {
    const full = join(root, rel);
    if (!existsSync(full)) continue;
    const body = readFileSync(full, "utf8");
    for (const re of secretPatterns) {
      ok(!re.test(body), `no secret pattern ${re} in ${rel}`);
    }
  }
}
scanTree([
  "ios/App/App/AppDelegate.swift",
  "ios/App/App/Info.plist",
  "ios/App/App/MajlisPlaybackAudioPlugin.swift",
  "ios/App/App/PrayerLiveActivityPlugin.swift",
  "capacitor.config.ts",
]);

const bundleIdMatches = [...pbx.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map((m) => m[1]);
ok(
  bundleIdMatches.every(
    (id) =>
      id === "com.yousef.majlisilm" ||
      id.includes("PrayerLiveActivity") ||
      id.includes("PrayerWidget"),
  ),
  "bundle identifiers App + PrayerLiveActivity + PrayerWidget only",
);
ok(
  /DEVELOPMENT_TEAM = 5D8TX37HTS;/.test(pbx),
  "DEVELOPMENT_TEAM unchanged",
);

// Capacitor auto-discovers CAPBridgedPlugin — AppDelegate must not manually register a conflicting name
const appDelegate = readFileSync(join(iosApp, "App", "AppDelegate.swift"), "utf8");
ok(!appDelegate.includes("MajlisPlaybackAudio"), "AppDelegate does not manually register playback plugin (CAPBridgedPlugin auto-discovery)");
ok(!appDelegate.includes("MajlisSpeechRecognition"), "AppDelegate has no speech recognition plugin");
ok(!appDelegate.includes("RecitationAudioCapture"), "AppDelegate has no recitation capture plugin");
ok(appDelegate.includes("import WebKit"), "AppDelegate imports WebKit for cache purge");
ok(
  appDelegate.includes("WKWebsiteDataStore.default().removeData")
    || /WKWebsiteDataStore\.default\(\)\s*\.removeData/.test(appDelegate),
  "AppDelegate clears WKWebsiteDataStore after an app update (live URL freshness)",
);
ok(appDelegate.includes("WKWebsiteDataTypeDiskCache"), "AppDelegate purges disk cache");
ok(appDelegate.includes("WKWebsiteDataTypeMemoryCache"), "AppDelegate purges memory cache");
ok(appDelegate.includes("WKWebsiteDataTypeServiceWorkerRegistrations"), "AppDelegate unregisters service workers");
ok(!appDelegate.includes("allWebsiteDataTypes"), "AppDelegate does not wipe localStorage/cookies");
ok(
  /CFBundleVersion[\s\S]*mj\.webCachePurgedForBuild[\s\S]*removeData/.test(appDelegate),
  "AppDelegate purges web caches once per app build (not every launch — keeps WKWebView cache warm)",
);

const capJsonPath = join(iosApp, "App", "capacitor.config.json");
ok(existsSync(capJsonPath), "ios capacitor.config.json exists");
const capJson = JSON.parse(readFileSync(capJsonPath, "utf8"));
const capTs = readFileSync(join(root, "capacitor.config.ts"), "utf8");

// Production يحمّل الـ canonical الحي مباشرة (بلا 308 عبر majlisilm/apex).
ok(
  capJson?.server?.url === "https://www.ssunnah.com",
  "capacitor.config.json server.url = https://www.ssunnah.com",
);
ok(
  /\burl:\s*"https:\/\/www\.ssunnah\.com"/.test(capTs),
  "capacitor.config.ts server.url = https://www.ssunnah.com",
);
ok(
  !/\burl:\s*"https:\/\/(www\.)?majlisilm\.com"/.test(capTs),
  "capacitor.config.ts must not use majlisilm.com as server.url",
);
ok(
  !/\burl:\s*"https:\/\/ssunnah\.com"/.test(capTs),
  "capacitor.config.ts must not use apex ssunnah.com (308) as server.url",
);
ok(
  /errorPath:\s*["']native-load-error\.html["']/.test(capTs),
  "capacitor.config.ts errorPath = native-load-error.html",
);
ok(
  /allowNavigation:\s*\[/.test(capTs) || Array.isArray(capJson?.server?.allowNavigation),
  "allowNavigation kept for first-party hosts",
);
// HTTPS-only: cleartext must stay false (http cleartext unused).
ok(capJson?.server?.cleartext === false, "capacitor.config.json cleartext false (https-only)");
ok(capJson?.webDir === "dist", "capacitor.config.json webDir is dist");
ok(!/\bandroid\s*:/.test(capTs), "capacitor.config.ts has no android block (iOS-only)");
ok(capJson.android === undefined, "capacitor.config.json has no android block");

const aasaPath = join(root, "public", ".well-known", "apple-app-site-association");
ok(existsSync(aasaPath), "AASA file exists");
const aasa = JSON.parse(readFileSync(aasaPath, "utf8"));
const aasaComponents = aasa?.applinks?.details?.[0]?.components || [];
ok(
  aasaComponents.some((c) => c["/"] === "/" && c.exclude === true),
  "AASA excludes homepage so Safari browsing does not force-open the app",
);
ok(
  !aasaComponents.some((c) => c["/"] === "*" && !c.exclude),
  "AASA must not claim all paths with /* wildcard",
);
ok(
  entitlements.includes("applinks:www.ssunnah.com"),
  "associated domains include www.ssunnah.com",
);
ok(entitlements.includes("applinks:ssunnah.com"), "associated domains include ssunnah.com");
ok(entitlements.includes("applinks:majlisilm.com"), "associated domains applinks majlisilm");

// Build Number must match between App target and PrayerLiveActivity extension.
const projectVersions = [...pbx.matchAll(/CURRENT_PROJECT_VERSION = ([0-9]+);/g)].map((m) => m[1]);
const uniqueProjectVersions = [...new Set(projectVersions)];
ok(projectVersions.length >= 2, "CURRENT_PROJECT_VERSION present for App and extension");
ok(
  uniqueProjectVersions.length === 1,
  `App and PrayerLiveActivityExtension share CURRENT_PROJECT_VERSION (got ${uniqueProjectVersions.join(",")})`,
);
const marketingVersions = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
const uniqueMarketing = [...new Set(marketingVersions)];
ok(
  uniqueMarketing.length === 1,
  `App and PrayerLiveActivityExtension share MARKETING_VERSION (got ${uniqueMarketing.join(",")})`,
);

// Live-update freshness: JS purge + prepare-ios main guard
const freshnessPath = join(root, "src", "lib", "native-cache-freshness.ts");
ok(existsSync(freshnessPath), "native-cache-freshness.ts exists");
const freshnessSrc = readFileSync(freshnessPath, "utf8");
ok(/\bisNative\b/.test(freshnessSrc), "native-cache-freshness.ts uses isNative");
ok(
  freshnessSrc.includes("navigator.serviceWorker.getRegistrations"),
  "native-cache-freshness.ts uses navigator.serviceWorker.getRegistrations",
);
ok(freshnessSrc.includes("caches.keys"), "native-cache-freshness.ts uses caches.keys");
ok(
  /export\s+async\s+function\s+purgeNativeWebRuntimeCaches/.test(freshnessSrc),
  "native-cache-freshness.ts exports purgeNativeWebRuntimeCaches",
);

ok(
  mainTsx.includes("purgeNativeWebRuntimeCaches"),
  "main.tsx imports/calls purgeNativeWebRuntimeCaches",
);
// لا await قبل createRoot — الانتظار كان يعلّق شاشة بيضاء على Capacitor.
ok(
  /void\s+purgeNativeWebRuntimeCaches\s*\(/.test(mainTsx) ||
    /purgeNativeWebRuntimeCaches\s*\([^)]*\)\s*\.catch\s*\(/.test(mainTsx),
  "main.tsx runs purgeNativeWebRuntimeCaches non-blocking (no await before mount)",
);
ok(
  !/await\s+purgeNativeWebRuntimeCaches\s*\(/.test(mainTsx),
  "main.tsx must not await purgeNativeWebRuntimeCaches before mount",
);

const prepareIos = readFileSync(join(root, "scripts", "prepare-ios.sh"), "utf8");
ok(
  prepareIos.includes("origin/main") && prepareIos.includes("rev-parse"),
  "prepare-ios.sh verifies origin/main",
);
ok(
  prepareIos.includes("ALLOW_IOS_NON_MAIN_BUILD"),
  "prepare-ios.sh contains ALLOW_IOS_NON_MAIN_BUILD override",
);
ok(
  prepareIos.includes("هذا المجلد ليس على آخر origin/main"),
  "prepare-ios.sh fails with clear stale-tree Arabic message",
);

// Auth tokens must live in Keychain — never UserDefaults
const networkServicePath = join(iosApp, "App", "Services", "NetworkService.swift");
const keychainPath = join(iosApp, "App", "Services", "KeychainStore.swift");
ok(existsSync(keychainPath), "KeychainStore.swift exists");
ok(existsSync(networkServicePath), "NetworkService.swift exists");
if (existsSync(networkServicePath)) {
  const networkService = readFileSync(networkServicePath, "utf8");
  ok(networkService.includes("KeychainStore"), "NetworkService uses KeychainStore");
  ok(
    !/UserDefaults\.standard\.(set|data|string|object)\s*\([^)]*(accessToken|refreshToken|auth\.session|sessionTokens)/i.test(
      networkService,
    ),
    "NetworkService does not persist access/refresh tokens via UserDefaults setters",
  );
  ok(
    !/UserDefaults\.standard\.set\s*\(\s*data\s*,/.test(networkService),
    "NetworkService does not UserDefaults.set(data) for session blobs",
  );
  const persistBlock = networkService.match(/private func persistSession[\s\S]*?\n {4}\}/);
  ok(Boolean(persistBlock), "persistSession function present");
  if (persistBlock) {
    ok(!persistBlock[0].includes("UserDefaults"), "persistSession does not touch UserDefaults");
    ok(persistBlock[0].includes("KeychainStore"), "persistSession writes via KeychainStore");
  }
}
ok(
  /KeychainStore\.swift in Sources/.test(pbx),
  "KeychainStore.swift listed under App target Sources",
);

// T-028/T-029 — App Group foundation + Prayer Widget Extension
const APP_GROUP = "group.com.yousef.majlisilm";
const sharedSwift = join(iosApp, "Shared", "SunnahSharedData.swift");
const sharedPlugin = join(iosApp, "App", "SunnahSharedDataPlugin.swift");
const plaEnt = join(iosApp, "PrayerLiveActivity", "PrayerLiveActivity.entitlements");
const widgetEnt = join(iosApp, "PrayerWidget", "PrayerWidget.entitlements");
const widgetMain = join(iosApp, "PrayerWidget", "PrayerTimesWidget.swift");
ok(existsSync(sharedSwift), "Shared/SunnahSharedData.swift exists");
ok(existsSync(sharedPlugin), "SunnahSharedDataPlugin.swift exists");
ok(existsSync(plaEnt), "PrayerLiveActivity.entitlements exists");
ok(existsSync(widgetEnt), "PrayerWidget.entitlements exists");
ok(existsSync(widgetMain), "PrayerTimesWidget.swift exists");
if (existsSync(sharedSwift)) {
  const shared = readFileSync(sharedSwift, "utf8");
  ok(shared.includes(APP_GROUP), "shared store uses group.com.yousef.majlisilm");
  ok(shared.includes("forbiddenSubstrings"), "shared store forbids secret key patterns");
  ok(shared.includes("SharedPrayerSnapshot"), "SharedPrayerSnapshot model present");
  ok(shared.includes("SharedProgressSnapshot"), "SharedProgressSnapshot model present");
  ok(
    !/KeychainStore\.set|var\s+accessToken|var\s+refreshToken/i.test(shared),
    "shared store does not write auth tokens",
  );
}
for (const entName of ["App.debug.entitlements", "App.release.entitlements", "App.entitlements"]) {
  const entPath = join(iosApp, "App", entName);
  ok(existsSync(entPath), `${entName} exists`);
  if (existsSync(entPath)) {
    const ent = readFileSync(entPath, "utf8");
    ok(
      ent.includes("com.apple.security.application-groups") && ent.includes(APP_GROUP),
      `${entName} declares ${APP_GROUP}`,
    );
  }
}
if (existsSync(plaEnt)) {
  const pla = readFileSync(plaEnt, "utf8");
  ok(pla.includes(APP_GROUP), "LA entitlements declare App Group");
}
if (existsSync(widgetEnt)) {
  const we = readFileSync(widgetEnt, "utf8");
  ok(we.includes(APP_GROUP), "Widget entitlements declare App Group");
}
ok(/SunnahSharedData\.swift in Sources/.test(pbx), "SunnahSharedData.swift in pbx Sources");
ok(/SunnahSharedDataPlugin\.swift in Sources/.test(pbx), "SunnahSharedDataPlugin.swift in App Sources");
ok(
  pbx.includes("CODE_SIGN_ENTITLEMENTS = PrayerLiveActivity/PrayerLiveActivity.entitlements"),
  "LA target CODE_SIGN_ENTITLEMENTS set",
);
ok(
  pbx.includes("PRODUCT_BUNDLE_IDENTIFIER = com.yousef.majlisilm.PrayerWidget"),
  "PrayerWidget extension target present (T-029)",
);
ok(
  pbx.includes("CODE_SIGN_ENTITLEMENTS = PrayerWidget/PrayerWidget.entitlements"),
  "Widget target CODE_SIGN_ENTITLEMENTS set",
);
ok(/PrayerWidgetExtension\.appex in Embed Foundation Extensions/.test(pbx), "Widget appex embedded in App");
ok(!/watchos|WatchKit/i.test(pbx), "no Watch app target yet");
const otherGroups = [...pbx.matchAll(/group\.com\.[a-z0-9.]+/gi)].map((m) => m[0]);
const unexpected = otherGroups.filter((g) => g !== APP_GROUP);
ok(unexpected.length === 0, `no conflicting App Group ids in pbx (found ${unexpected.join(",") || "none"})`);
const livePlugin = readFileSync(join(iosApp, "App", "PrayerLiveActivityPlugin.swift"), "utf8");
ok(
  livePlugin.includes("SunnahSharedStore.publishLiveActivityState"),
  "PrayerLiveActivityPlugin mirrors state into App Group",
);
ok(livePlugin.includes("syncFromSharedSnapshot"), "LA plugin can sync from App Group snapshot");
ok(!/URLSession/i.test(livePlugin), "LA plugin has no network requests");
const liveUi = readFileSync(join(iosApp, "PrayerLiveActivity", "PrayerLiveActivityLiveActivity.swift"), "utf8");
ok(/compactLeading/.test(liveUi) && /compactTrailing/.test(liveUi), "Dynamic Island compact regions present");
ok(/minimal:/.test(liveUi), "Dynamic Island minimal present");
ok(liveUi.includes("SunnahPrayerDeepLink.prayerTimes"), "LA uses shared prayer deep link");
ok(liveUi.includes("widgetURL"), "LA attaches widgetURL");
const liveAttrs = readFileSync(join(iosApp, "App", "PrayerActivityAttributes.swift"), "utf8");
ok(
  /case upcoming/.test(liveAttrs) &&
    /case active/.test(liveAttrs) &&
    /case completed/.test(liveAttrs) &&
    /case appLaunch/.test(liveAttrs),
  "LA ContentState phases upcoming/active/completed/appLaunch",
);
if (existsSync(widgetMain)) {
  const w = readFileSync(widgetMain, "utf8");
  ok(w.includes("systemSmall") && w.includes("accessoryInline"), "widget supports home + lock families");
  ok(w.includes("accessoryCircular") && w.includes("accessoryRectangular"), "lock circular/rectangular families");
  const entryPath = join(iosApp, "PrayerWidget", "PrayerWidgetEntry.swift");
  const entry = readFileSync(entryPath, "utf8");
  ok(entry.includes("SunnahSharedStore.loadPrayer"), "widget timeline reads App Group prayer snapshot");
  ok(!/URLSession|http:\/\/|https:\/\/api/i.test(entry), "widget timeline has no API calls");
  ok(
    entry.includes("SunnahPrayerDeepLink") || entry.includes("www.ssunnah.com/prayer-times"),
    "widget deep link to prayer screen",
  );
  const views = readFileSync(join(iosApp, "PrayerWidget", "PrayerWidgetViews.swift"), "utf8");
  ok(views.includes("widgetURL"), "views attach widgetURL");
  ok(views.includes("accessibilityLabel"), "VoiceOver labels present");
  ok(views.includes("layoutDirection"), "RTL layoutDirection set");
  ok(
    !/Quran|QPC|Hisn|Fatwa|recitation/i.test(views + w + entry),
    "no blocked corpus content in widget",
  );
}

// package.json / prepare-ios: لا تستخدم npx cap — من جذر الـ monorepo يحلّ npm حزمة
// cap@0.2.1 (بلا bin) → "could not determine executable to run". استخدم ثنائي .bin المحلي.
// Product scope: iOS-only — mobile:android must remain a hard-fail retired stub.
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const iosMobileScripts = ["mobile:sync", "mobile:ios"];
for (const name of iosMobileScripts) {
  const cmd = pkg.scripts?.[name] || "";
  ok(Boolean(cmd), `package.json has script ${name}`);
  ok(!/\bnpx\b/.test(cmd), `${name}: must not use npx (resolves wrong npm package "cap")`);
  ok(!/\bnpm\s+exec\b/.test(cmd), `${name}: must not use npm exec`);
  ok(!/(?:^|[;&|]|&&|\|\|)\s*pnpm\s+exec\s*(?:$|[;&|])/.test(cmd), `${name}: no empty pnpm exec`);
  ok(!/\bcap\s+sync\s*(?:$|[;&|])/.test(cmd), `${name}: bare cap sync forbidden (must target ios)`);
  ok(!/\bcap\s+sync\s+android\b/.test(cmd), `${name}: must not sync android (product retired)`);
}
ok(
  /\bcap\s+sync\s+ios\b/.test(pkg.scripts?.["mobile:sync"] || ""),
  "mobile:sync runs cap sync ios explicitly",
);
const mobileAndroid = pkg.scripts?.["mobile:android"] || "";
ok(Boolean(mobileAndroid), "package.json keeps mobile:android as retired stub");
ok(
  !/\bcap\s+sync\s+android\b/.test(mobileAndroid) &&
    /Android retired/i.test(mobileAndroid) &&
    /process\.exit\(1\)/.test(mobileAndroid),
  "mobile:android is hard-fail retired stub (no cap sync android)",
);
ok(
  /\bcap\s+open\s+ios\b/.test(pkg.scripts?.["mobile:ios"] || ""),
  "mobile:ios runs cap open ios explicitly",
);
ok(!pkg.dependencies?.["@capacitor/android"], "no @capacitor/android dependency");
ok(!pkg.devDependencies?.["@capacitor/android"], "no @capacitor/android devDependency");

// تجاهل التعليقات — افحص أوامر التنفيذ فقط
const prepareIosCode = prepareIos
  .split("\n")
  .filter((line) => !/^\s*#/.test(line))
  .join("\n");
ok(!/\bnpx\b/.test(prepareIosCode), "prepare-ios.sh must not invoke npx");
ok(!/\bnpm\s+exec\b/.test(prepareIosCode), "prepare-ios.sh must not invoke npm exec");
ok(
  /node_modules\/\.bin\/cap/.test(prepareIosCode) && /"\$CAP_BIN"\s+sync\s+ios/.test(prepareIosCode),
  "prepare-ios.sh invokes local node_modules/.bin/cap sync ios",
);

const iosGitignore = readFileSync(join(root, "ios", ".gitignore"), "utf8");
ok(
  /App\/App\/public\/\*\*/.test(iosGitignore) && /!App\/App\/public\/\.gitkeep/.test(iosGitignore),
  "ios/.gitignore ignores App/App/public/** except .gitkeep",
);
ok(existsSync(join(iosApp, "App", "public", ".gitkeep")), "App/App/public/.gitkeep present");

try {
  const repoRoot = join(root, "../..");
  const tracked = execSync("git ls-files -- artifacts/majalis/ios/App/App/public", {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
  const unexpected = tracked.filter((f) => !f.endsWith("/.gitkeep") && !f.endsWith(".gitkeep"));
  ok(
    unexpected.length === 0,
    `ios App/App/public not tracked in git except .gitkeep (extra=${unexpected.length})`,
  );
  ok(
    tracked.some((f) => f.endsWith(".gitkeep")),
    "public/.gitkeep is tracked so the directory survives clean clones",
  );
} catch (err) {
  ok(false, `git ls-files public mirror check: ${err instanceof Error ? err.message : err}`);
}

// الصدفة الأصلية: الحزم الأربع مربوطة بهدف App، والمفتاح مطفأ افتراضيًا
for (const pkg of ["SunnahNative", "SunnahDataKit", "SunnahWeb", "SunnahPrayer"]) {
  ok(
    new RegExp(`XCLocalSwiftPackageReference;\\s*relativePath = ${pkg};`).test(pbx) &&
      pbx.includes(`/* ${pkg} in Frameworks */ = {isa = PBXBuildFile; productRef`),
    `${pkg} مربوطة بالتطبيق في project.pbxproj`,
  );
  ok(existsSync(join(iosApp, pkg, "Package.swift")), `${pkg}/Package.swift موجود`);
}
const nativeGate = readFileSync(join(iosApp, "App", "NativeShellGate.swift"), "utf8");
ok(
  /UserDefaults\.standard\.bool\(forKey: defaultsKey\)/.test(nativeGate) && nativeGate.includes('"native_shell_enabled"'),
  "native_shell_enabled يُقرأ من UserDefaults.bool (القيمة الافتراضية false)",
);
ok(!/register\(defaults/.test(nativeGate) && !/native_shell_enabled[^\n]*true/.test(nativeGate), "لا تفعيل افتراضي لـnative_shell_enabled");

if (failed) {
  console.error(`\n${failed} gate(s) failed`);
  process.exit(1);
}
console.log("\nAll iOS static gates passed.");
