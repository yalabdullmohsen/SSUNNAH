/**
 * APP_WEB_BOUNDARY_GATE — حدّ التطبيق الأصلي ↔ الموقع.
 * المرجع: docs/architecture/APP_VS_WEB_BOUNDARY.md
 * Run: node --import tsx src/lib/__tests__/app-web-boundary-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

/* 1) وحدة الحدّ الواحدة */
const boundary = read("src/lib/native-platform.ts");
for (const sym of ["BUILD_TARGET", "IS_NATIVE_BUILD", "isNativeApp", "isWeb", "APP_HOSTS", "isAppHost", "isNativePlatform"]) {
  assert.match(boundary, new RegExp(`export (const|function|type) ${sym}\\b`), `native-platform يصدّر ${sym}`);
}
assert.match(boundary, /import\.meta\.env\.VITE_TARGET/, "BUILD_TARGET يُقرأ من VITE_TARGET (ثابت بناء)");
assert.doesNotMatch(boundary, /@capacitor\/core/, "وحدة الحدّ بلا @capacitor/core (خارج رسم الإقلاع)");

const {
  BUILD_TARGET,
  IS_NATIVE_BUILD,
  isNativeApp,
  isWeb,
  isAppHost,
} = await import("../native-platform");
assert.equal(BUILD_TARGET, "web", "تحت node بلا VITE_TARGET → web");
assert.equal(IS_NATIVE_BUILD, false);
assert.equal(isNativeApp(), false);
assert.equal(isWeb(), true);
for (const h of ["www.ssunnah.com", "ssunnah.com", "majlisilm.com", "x.ssunnah.com", "WWW.SSUNNAH.COM."]) {
  assert.ok(isAppHost(h), `نطاقنا: ${h}`);
}
for (const h of ["example.com", "ssunnah.com.evil.io", "notssunnah.com"]) {
  assert.ok(!isAppHost(h), `ليس نطاقنا: ${h}`);
}

/* قائمة النطاقات في مكان واحد فقط */
for (const rel of ["src/lib/capacitor-utils.ts", "src/lib/in-app-navigation.ts"]) {
  const src = read(rel);
  assert.doesNotMatch(src, /new Set\(\[\s*["']www\.ssunnah\.com/, `${rel}: لا قائمة نطاقات مكررة — استورد isAppHost`);
  assert.match(src, /isAppHost/, `${rel} يستخدم isAppHost من وحدة الحدّ`);
}

/* 2) ثابت البناء في vite */
const vite = read("vite.config.ts");
assert.match(vite, /"import\.meta\.env\.VITE_TARGET":\s*JSON\.stringify\(buildTarget\)/, "vite define VITE_TARGET");
assert.match(vite, /buildTarget === "native" \? "dist-native" : "dist"/, "متغيّر native لا يمسّ dist الويب");

/* 3) لا PWA/SW/دعوات تحميل داخل التطبيق */
const app = read("src/App.tsx");
assert.match(app, /const PwaInstallBanner = import\.meta\.env\.VITE_TARGET === "native"\s*\?\s*null/, "PwaInstallBanner يُحذف من متغيّر native");
assert.match(app, /!isNative && PwaInstallBanner &&/, "PwaInstallBanner لا يُركَّب داخل التطبيق");
const main = read("src/main.tsx");
assert.match(main, /if \(!isNative && import\.meta\.env\.VITE_TARGET !== "native"\) \{\s*const registerSw/, "تسجيل SW للويب فقط");
assert.match(read("src/components/IosAppCta.tsx"), /!isNativeApp\(\)/, "دعوة App Store للموقع فقط");
assert.match(read("src/lib/push-notifications.ts"), /if \(isNative\) return "unsupported"/, "Web Push معطّل في التطبيق");

/* 4) روابط السياق الأصلي */
const nav = read("src/lib/in-app-navigation.ts");
assert.match(nav, /installInAppNavigationGuard/);
assert.match(nav, /void openExternalUrl\(abs\.toString\(\)\);\s*return null;/, "window.open الخارجي → متصفح داخل التطبيق");
assert.match(main, /installInAppNavigationGuard/, "الحارس مثبّت عند الإقلاع");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "__tests__" || name === "node_modules") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}
const fullReload = /location\.(?:assign|replace)\(\s*["'`]\/|location\.href\s*=\s*["'`]\//;
const absOwnHref = /href=\{?\s*["'`]https:\/\/(?:www\.)?(?:ssunnah|majlisilm)\.com/;
const offenders: string[] = [];
for (const file of walk(resolve(root, "src"))) {
  const rel = relative(root, file);
  const src = readFileSync(file, "utf8");
  if (fullReload.test(src)) offenders.push(`${rel}: إعادة تحميل كاملة لمسار داخلي — استخدم navigateTo`);
  if (!rel.startsWith("src/views/admin/") && absOwnHref.test(src)) {
    offenders.push(`${rel}: رابط مطلق لنطاقنا — استخدم مسارًا داخليًا`);
  }
}
assert.deepEqual(offenders, [], offenders.join("\n"));

/* 5) webDir الأصلي: لا ملفات ويب داخل الحزمة */
const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
assert.equal(pkg.scripts["capacitor:copy:after"], "node scripts/native-prune-web-only.mjs", "خطاف cap copy ينظّف webDir");
assert.match(pkg.scripts["build:native-variant"] || "", /VITE_TARGET=native vite build/);
assert.match(pkg.scripts["test:app-web-boundary"] || "", /app-web-boundary-gate/);

const prune = (await import(resolve(root, "scripts/native-prune-web-only.mjs"))) as {
  planNativePrune: (e: string[], o: { remoteShell: boolean; errorPath?: string }) => string[];
  WEB_ONLY_FILES: readonly string[];
};
const sample = [
  "index.html", "native-load-error.html", "cordova.js", "cordova_plugins.js", "plugins", ".gitkeep",
  "assets", "data", "audio", "fonts", "lessons", "sitemap.xml", "sitemap-lessons.xml", "robots.txt",
  "sw.js", "manifest.webmanifest", ".well-known", "offline.html", "mj-launch-splash-boot.js",
];
const remote = prune.planNativePrune(sample, { remoteShell: true, errorPath: "native-load-error.html" });
assert.deepEqual(
  sample.filter((n) => !remote.includes(n)).sort(),
  [".gitkeep", "cordova.js", "cordova_plugins.js", "index.html", "native-load-error.html", "plugins"].sort(),
  "remote-shell: يبقى الحد الأدنى فقط",
);
const local = prune.planNativePrune(sample, { remoteShell: false });
for (const web of ["sitemap.xml", "sitemap-lessons.xml", "robots.txt", "sw.js", "manifest.webmanifest", "offline.html"]) {
  assert.ok(local.includes(web), `local-bundle يزيل ${web}`);
}
for (const app of ["index.html", "assets", "data", "native-load-error.html", "cordova.js"]) {
  assert.ok(!local.includes(app), `local-bundle يُبقي ${app}`);
}

const cap = read("capacitor.config.ts");
assert.match(cap, /url:\s*"https:\/\/www\.ssunnah\.com"/, "الغلاف يحمّل canonical الحيّ");
assert.match(cap, /errorPath:\s*"native-load-error\.html"/);
const errorPage = read("public/native-load-error.html");
assert.doesNotMatch(
  errorPage,
  /<(?:script|img|link)[^>]+(?:src|href)=["']\/(?!\/)/,
  "صفحة الخطأ مكتفية ذاتيًا (لا تعتمد على أصول محلية محذوفة)",
);

/* 6) إن وُجد متغيّر native مبنيًا: وحدات الويب فقط محذوفة منه */
const nativeAssets = resolve(root, "dist-native/assets");
if (existsSync(nativeAssets)) {
  const chunks = readdirSync(nativeAssets);
  assert.ok(!chunks.some((c) => /^PwaInstallBanner-/.test(c)), "dist-native بلا PwaInstallBanner");
  assert.ok(!chunks.some((c) => /^service-worker-/.test(c)), "dist-native بلا service-worker");
}

/* 7) التوثيق */
const doc = readFileSync(resolve(repoRoot, "docs/architecture/APP_VS_WEB_BOUNDARY.md"), "utf8");
for (const marker of ["APP_VS_WEB_BOUNDARY", "native-platform.ts", "VITE_TARGET", "native-prune-web-only", "capacitor:copy:after", "server.url", "إجراءات المالك"]) {
  assert.ok(doc.includes(marker), `التوثيق يذكر ${marker}`);
}

console.log("app-web-boundary-gate.test.ts: ok");
console.log("APP_WEB_BOUNDARY_ACTIVE");
