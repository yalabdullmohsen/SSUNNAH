/**
 * بوابة Phase 1 — نظام ودجت سُنّة الأصلي.
 * Run: node --import tsx src/lib/__tests__/native-widgets-phase1-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const docs = read("../../docs/native-widgets/SUNNAH_WIDGET_SYSTEM.md");
assert.match(docs, /Phase 1/);
assert.match(docs, /group\.com\.yousef\.majlisilm\.widgets/);
assert.match(docs, /native-widgets-phase1-gate/);

const types = read("src/lib/native-widgets/types.ts");
assert.match(types, /WIDGET_SNAPSHOT_VERSION/);
assert.match(types, /next_prayer/);
assert.match(types, /WIDGET_APP_GROUP_ID/);

const theme = read("src/lib/native-widgets/theme.ts");
assert.match(theme, /WIDGET_THEME_AA/);
assert.match(theme, /#15382D/);
assert.match(theme, /#48645A/);
assert.match(theme, /#5F7168/);
assert.match(theme, /#0F5C3F/);
assert.match(theme, /#F8F6F1/);

const snapshot = read("src/lib/native-widgets/snapshot.ts");
assert.match(snapshot, /buildWidgetSnapshot/);
assert.match(snapshot, /computePrayerStatus/);
assert.doesNotMatch(snapshot, /ayahText\s*=\s*["'][^"']{20,}/, "لا نص قرآني مخترع في اللقطة");

const deep = read("src/lib/native-widgets/deep-links.ts");
assert.match(deep, /\/prayer-times/);
assert.match(deep, /\/mushaf/);
assert.match(deep, /\/adhkar/);
assert.match(deep, /\/widget-settings/);

const pluginTs = read("src/lib/plugins/sunnah-widgets.ts");
assert.match(pluginTs, /SunnahWidgets/);
assert.match(pluginTs, /writeSnapshot/);
assert.match(pluginTs, /reloadAll/);

const routes = read("src/app/router/routes.ts");
assert.match(routes, /\/widget-settings/);
const appRoutes = read("src/AppRoutes.tsx");
assert.match(appRoutes, /WidgetSettingsPage/);
assert.match(appRoutes, /path="\/widget-settings"/);

const settings = read("src/pages/settings/ui/WidgetSettingsView.tsx");
assert.match(settings, /syncSunnahWidgets/);
assert.match(settings, /#15382D|WIDGET_THEME_AA/);

const css = read("src/styles/pages/widget-settings.css");
assert.match(css, /--ws-ink:\s*#15382[dD]/i);
assert.match(css, /--ws-emerald:\s*#0[fF]5[cC]3[fF]/i);

/* iOS */
const iosPlugin = read("ios/App/App/SunnahWidgetsPlugin.swift");
assert.match(iosPlugin, /group\.com\.yousef\.majlisilm\.widgets/);
assert.match(iosPlugin, /writeSnapshot/);
assert.match(iosPlugin, /WidgetCenter/);

const home = read("ios/App/PrayerLiveActivity/NextPrayerHomeWidget.swift");
assert.match(home, /NextPrayerHomeWidget/);
assert.match(home, /ssunnah\.com\/prayer-times/);
assert.match(home, /layoutDirection.*rightToLeft|rightToLeft/);

const lock = read("ios/App/PrayerLiveActivity/NextPrayerLockScreenWidget.swift");
assert.match(lock, /accessoryCircular/);
assert.match(lock, /accessoryRectangular/);
assert.match(lock, /accessoryInline/);

const bundle = read("ios/App/PrayerLiveActivity/PrayerLiveActivityBundle.swift");
assert.match(bundle, /NextPrayerHomeWidget/);
assert.match(bundle, /NextPrayerLockScreenWidget/);

const entApp = read("ios/App/App/App.entitlements");
assert.match(entApp, /group\.com\.yousef\.majlisilm\.widgets/);
const entExt = read("ios/App/PrayerLiveActivity/PrayerLiveActivity.entitlements");
assert.match(entExt, /group\.com\.yousef\.majlisilm\.widgets/);

const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
assert.match(pbx, /SunnahWidgetsPlugin\.swift in Sources/);
assert.match(pbx, /NextPrayerHomeWidget\.swift in Sources/);
assert.match(pbx, /NextPrayerLockScreenWidget\.swift in Sources/);
assert.match(pbx, /SunnahWidgetSnapshot\.swift in Sources/);
assert.match(pbx, /CODE_SIGN_ENTITLEMENTS = PrayerLiveActivity\/PrayerLiveActivity\.entitlements/);

/* Android */
const androidPlugin = read("android/app/src/main/java/com/majlisilm/app/SunnahWidgetsPlugin.kt");
assert.match(androidPlugin, /SunnahWidgets/);
assert.match(androidPlugin, /writeSnapshot/);
assert.match(androidPlugin, /NextPrayerWidgetProvider/);

const provider = read("android/app/src/main/java/com/majlisilm/app/widgets/NextPrayerWidgetProvider.kt");
assert.match(provider, /widget_next_prayer/);
assert.match(provider, /prayer-times/);

const store = read("android/app/src/main/java/com/majlisilm/app/widgets/SunnahWidgetSnapshotStore.kt");
assert.match(store, /sunnah_widgets/);
assert.match(store, /snapshot_v1/);

const manifest = read("android/app/src/main/AndroidManifest.xml");
assert.match(manifest, /NextPrayerWidgetProvider/);
assert.match(manifest, /next_prayer_widget_info/);

const main = read("android/app/src/main/java/com/majlisilm/app/MainActivity.java");
assert.match(main, /SunnahWidgetsPlugin/);

const colors = read("android/app/src/main/res/values/colors.xml");
assert.match(colors, /widget_ink">#15382D/);
assert.match(colors, /widget_emerald">#0F5C3F/);
assert.match(colors, /widget_bg">#F8F6F1/);

const strings = read("android/app/src/main/res/values/strings.xml");
assert.match(strings, /widget_next_prayer_description/);

assert.ok(existsSync(resolve(root, "android/app/src/main/res/layout/widget_next_prayer.xml")));
assert.ok(existsSync(resolve(root, "android/app/src/main/res/xml/next_prayer_widget_info.xml")));

console.log("native-widgets-phase1-gate.test.ts: ok");
