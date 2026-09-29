/**
 * P0 — استقرار تنقّل الصلاة: بلا تسرّب pts-immersive من Prefetch/warm.
 * Run: node --import tsx src/lib/__tests__/navigation-prayer-stability-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  commitRouteSurface,
  resolveRouteSurfaceMode,
} from "@/lib/route-surface";
import { getActiveTab } from "@/lib/get-active-tab";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

assert.equal(resolveRouteSurfaceMode("/"), "standard-light");
assert.equal(resolveRouteSurfaceMode("/sections"), "standard-light");
assert.equal(resolveRouteSurfaceMode("/lessons"), "standard-light");
assert.equal(resolveRouteSurfaceMode("/quran-hub"), "standard-light");
assert.equal(resolveRouteSurfaceMode("/prayer-times"), "prayer-dark");
assert.equal(resolveRouteSurfaceMode("/prayer-times/"), "prayer-dark");

assert.equal(getActiveTab("/"), "home");
assert.equal(getActiveTab("/prayer-times"), "prayer");
assert.equal(getActiveTab("/sections"), "sections");
assert.equal(getActiveTab("/quran-hub"), "quran");
assert.equal(getActiveTab("/lessons"), "lessons");
assert.equal(getActiveTab("/adhkar"), "prayer");

const bottom = read("src/components/BottomNavBar.tsx");
const top = read("src/components/TopSectionBar.tsx");
const app = read("src/App.tsx");
const surface = read("src/lib/route-surface.ts");
const chromeSync = read("src/components/PageChromeSync.tsx");

assert.doesNotMatch(bottom, /classList\.add\(\s*["']pts-immersive["']\s*\)/);
assert.doesNotMatch(top, /classList\.add\(\s*["']pts-immersive["']\s*\)/);
assert.match(bottom, /prefetchPrayerRouteAssets/);
assert.match(app, /commitRouteSurface\(location\)/);
assert.match(app, /useLayoutEffect/);
assert.match(surface, /dataset\.routeSurface/);
assert.match(chromeSync, /useLayoutEffect/);
assert.match(chromeSync, /applyPageChromeDom/);

assert.match(
  readFileSync(
    resolve(root, "../../docs/remediation/NAVIGATION_PRAYER_ROOT_CAUSE.md"),
    "utf8",
  ),
  /Unowned global/,
);

/* محاكاة التزام: صلاة ثم رئيسية — لا يبقى pts إن وُجد document */
if (typeof document !== "undefined") {
  commitRouteSurface("/prayer-times");
  assert.equal(document.documentElement.classList.contains("pts-immersive"), true);
  commitRouteSurface("/");
  assert.equal(document.documentElement.classList.contains("pts-immersive"), false);
  assert.equal(document.documentElement.dataset.routeSurface, "standard-light");
}

console.log("navigation-prayer-stability-gate.test.ts: ok");
