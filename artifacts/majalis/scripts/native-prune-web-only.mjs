#!/usr/bin/env node
/**
 * حدّ التطبيق ↔ الموقع — تنظيف webDir المنسوخ إلى iOS بعد كل `cap copy`/`cap sync`.
 * يعمل تلقائيًا عبر خطاف Capacitor `capacitor:copy:after` في package.json، فيغطّي كل
 * المسارات (prepare-ios.sh · mobile:sync · ios-native-macos.yml · ios-testflight-deploy.yml).
 *
 * الوضعان (يُحدَّدان من capacitor.config.json المنسوخ):
 *  - remote-shell (server.url مضبوط — الوضع الإنتاجي الحالي): الغلاف يحمّل https://www.ssunnah.com
 *    الحيّ، ولا يُقرأ من الحزمة المحلية إلا صفحة الخطأ (server.errorPath). يُبقى فقط:
 *    index.html (شرط cap) + صفحة الخطأ + ملفات جسر Cordova + .gitkeep — ويُحذف الباقي
 *    (صفحات SEO المولّدة مسبقًا، sitemap/robots/feed، SW/manifest، data/، audio/، fonts/، …).
 *  - local-bundle (بلا server.url): يُحذف فقط ما هو ويب حصرًا (WEB_ONLY_FILES).
 *
 *   node scripts/native-prune-web-only.mjs            # ios/App/App/public
 *   node scripts/native-prune-web-only.mjs --dry-run  # تقرير فقط
 *   node scripts/native-prune-web-only.mjs --dir <path> [--remote|--local]
 *
 * المرجع: docs/architecture/APP_VS_WEB_BOUNDARY.md
 */
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** ما يلزم الغلاف البعيد محليًا — لا شيء غيره. */
export const REMOTE_SHELL_KEEP = Object.freeze([
  "index.html",
  "cordova.js",
  "cordova_plugins.js",
  "plugins",
  ".gitkeep",
]);

/** ملفات ويب حصرًا — لا معنى لها داخل WKWebView في أي وضع. */
export const WEB_ONLY_FILES = Object.freeze([
  "robots.txt",
  "sitemap.xml",
  "sitemap.xsl",
  "feed.xml",
  "sw.js",
  "quran-engine-sw.js",
  "quran-engine-manifest.json",
  "manifest.json",
  "manifest.webmanifest",
  "site.webmanifest",
  "offline.html",
  "404.html",
  "bundle-stats.html",
]);

const WEB_ONLY_PATTERNS = [/^sitemap[-_].*\.xml$/i, /\.map$/i, /^google[0-9a-f]+\.html$/i, /^BingSiteAuth\.xml$/i];

/**
 * خطة نقية (قابلة للاختبار): أي المدخلات العليا تُحذف.
 * @param {string[]} entries أسماء المدخلات في جذر webDir المنسوخ
 * @param {{ remoteShell: boolean, errorPath?: string }} opts
 */
export function planNativePrune(entries, { remoteShell, errorPath = "native-load-error.html" }) {
  if (remoteShell) {
    const keep = new Set([...REMOTE_SHELL_KEEP, errorPath.replace(/^\/+/, "").split("/")[0]]);
    return entries.filter((name) => !keep.has(name));
  }
  const web = new Set(WEB_ONLY_FILES);
  return entries.filter((name) => web.has(name) || WEB_ONLY_PATTERNS.some((re) => re.test(name)));
}

function sizeOf(path) {
  const st = statSync(path);
  if (!st.isDirectory()) return st.size;
  let total = 0;
  for (const name of readdirSync(path)) total += sizeOf(join(path, name));
  return total;
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;

function readConfig(appRoot, publicDir) {
  for (const p of [join(dirname(publicDir), "capacitor.config.json"), join(appRoot, "capacitor.config.json")]) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, "utf8"));
      } catch {
        /* جرّب التالي */
      }
    }
  }
  return {};
}

function main() {
  const args = process.argv.slice(2);
  const platform = process.env.CAPACITOR_PLATFORM_NAME;
  if (platform && platform !== "ios") {
    console.log(`native-prune-web-only: platform=${platform} — iOS فقط، تخطٍّ`);
    return;
  }
  const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const dirIdx = args.indexOf("--dir");
  const publicDir = dirIdx >= 0 ? resolve(args[dirIdx + 1]) : join(appRoot, "ios/App/App/public");
  if (!existsSync(publicDir)) {
    console.log(`native-prune-web-only: ${publicDir} غير موجود — تخطٍّ`);
    return;
  }
  const cfg = readConfig(appRoot, publicDir);
  const remoteShell = args.includes("--local") ? false : args.includes("--remote") ? true : Boolean(cfg?.server?.url);
  const errorPath = cfg?.server?.errorPath || "native-load-error.html";
  const dryRun = args.includes("--dry-run");

  if (remoteShell && !existsSync(join(publicDir, errorPath))) {
    console.error(`native-prune-web-only: صفحة الخطأ ${errorPath} مفقودة من webDir — أوقف التنظيف`);
    process.exit(1);
  }

  const entries = readdirSync(publicDir);
  const before = sizeOf(publicDir);
  const doomed = planNativePrune(entries, { remoteShell, errorPath });
  let removedBytes = 0;
  for (const name of doomed) {
    const p = join(publicDir, name);
    removedBytes += sizeOf(p);
    if (!dryRun) rmSync(p, { recursive: true, force: true });
  }
  console.log(
    `native-prune-web-only: mode=${remoteShell ? "remote-shell" : "local-bundle"}${dryRun ? " (dry-run)" : ""} · ` +
      `قبل ${mb(before)} · أُزيل ${mb(removedBytes)} (${doomed.length} مدخل) · بعد ${mb(before - removedBytes)}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
