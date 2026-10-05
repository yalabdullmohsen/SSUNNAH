/**
 * بوابة: لا modulepreload لحزمة HomePage على مسار الإقلاع.
 * LCP = p.hsh-lead في HomeStartHereSection (خارج Suspense) — preload HomePage
 * ينافس حزمة App على Slow 4G ويرفع render-delay.
 * تشغيل: node --import tsx src/lib/__tests__/home-lcp-no-homepage-preload-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const inject = read("scripts/inject-home-chunk-preload.mjs");
assert.match(inject, /skip modulepreload|no Home LCP contention preload/);
assert.doesNotMatch(
  inject,
  /html\.replace\(anchor,\s*`\$\{preloadTag\}/,
  "must not inject HomePage modulepreload before entry script",
);

const app = read("src/App.tsx");
assert.match(app, /HomeStartHereSection/, "LCP host outside Suspense");
assert.match(
  app,
  /HomeStartHereSection[\s\S]{0,120}<\s*\/section>[\s\S]{0,80}<Suspense[\s\S]{0,120}HomePage/,
  "StartHere precedes lazy HomePage Suspense",
);

const distHtmlPath = resolve(root, "dist/index.html");
if (existsSync(distHtmlPath)) {
  const distHtml = readFileSync(distHtmlPath, "utf8");
  assert.doesNotMatch(
    distHtml,
    /rel="modulepreload"[^>]*(?:HomePage|HomeView)/i,
    "dist must not modulepreload HomePage/HomeView",
  );
  console.log("dist/index.html: no HomePage modulepreload");
} else {
  console.log("dist/index.html missing — skipped dist assert (pre-build)");
}

console.log("home-lcp-no-homepage-preload-gate: ok");
