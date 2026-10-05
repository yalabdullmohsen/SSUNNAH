/**
 * كان يحقن modulepreload لحزمة HomePage بعد البناء.
 *
 * دليل LHCI home mobile (2026-10-05):
 *   عنصر LCP الثابت = `p.hsh-lead` داخل HomeStartHereSection (App.tsx، خارج Suspense)
 *   وليس داخل حزمة HomePage الكسولة.
 * modulepreload لـ HomePage على Slow 4G ينافس حزمة الإقلاع التي ترسم LCP
 * فيرفع ELEMENT_RENDER_DELAY حتى سقف 7762ms.
 *
 * الإبقاء على السكربت في سلسلة البناء كحارس: يمنع إعادة إدخال preload خاطئ،
 * ولا يحقن شيئاً.
 */
import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "..");
const distDir = resolve(appRoot, "dist");
const indexPath = resolve(distDir, "index.html");

const assetsDir = resolve(distDir, "assets");
const files = await readdir(assetsDir);
const homeChunk = files.find(
  (f) =>
    f.endsWith(".js") &&
    !f.endsWith(".map") &&
    (/HomePage|HomeView|account.*Home/i.test(f) || f.includes("HomePage")),
);

let html = await readFile(indexPath, "utf8");

/** أزل أي modulepreload لحزمة HomePage إن وُجد (من بناء سابق / دمج SEO). */
const stripped = html.replace(/<link\b[^>]*>/gi, (tag) => {
  if (!/rel\s*=\s*["']modulepreload["']/i.test(tag)) return tag;
  if (!/HomePage|HomeView/i.test(tag)) return tag;
  return "";
}).replace(/\n{3,}/g, "\n\n");

if (stripped !== html) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(indexPath, stripped, "utf8");
  html = stripped;
  console.log("[inject-home-chunk-preload] removed HomePage/HomeView modulepreload (LCP contention)");
}

if (/rel="modulepreload"[^>]*(?:HomePage|HomeView)/i.test(html)) {
  console.error("[inject-home-chunk-preload] HomePage modulepreload still present — abort");
  process.exit(1);
}

if (homeChunk) {
  console.log(
    "[inject-home-chunk-preload] skip modulepreload for",
    homeChunk,
    "(LCP is App HomeStartHere, not HomePage chunk)",
  );
} else {
  console.log("[inject-home-chunk-preload] no HomePage chunk — nothing to guard");
}

console.log("[inject-home-chunk-preload] ok: no Home LCP contention preload");
