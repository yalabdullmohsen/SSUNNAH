/**
 * توافق: إعلان داخل الهيدر — لا HomepageAdBar ولا TopSponsorBanner.
 * Interaction PR-9: cluster HomepageAdBar محذوف (SAFE_REMOVE مثبت).
 * تشغيل: node --import tsx src/lib/__tests__/homepage-ad-bar-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const app = readFileSync(resolve(root, "src/App.tsx"), "utf8") + "\n" + readFileSync(resolve(root, "src/AppRoutes.tsx"), "utf8");
const nav = readFileSync(resolve(root, "src/components/NavBar.tsx"), "utf8");
const cfg = readFileSync(resolve(root, "src/config/header-ad.ts"), "utf8");

assert.doesNotMatch(app, /HomepageAdBar|homeAdSlot/);
assert.doesNotMatch(app, /TopSponsorBanner/);
assert.match(nav, /HeaderAdSlot/);
assert.match(nav, /shouldShowHeaderAd/);
assert.doesNotMatch(nav, /navbar-v3__ad-row/);
assert.doesNotMatch(nav, /MajlisWordmark/);
assert.match(cfg, /headerAdConfig/);
assert.match(cfg, /enabled:\s*false/);
assert.match(cfg, /placement:\s*"header"/);
assert.match(cfg, /شركة العبد المحسن للحج/);
assert.match(cfg, /الثقة/);

for (const rel of [
  "src/styles/components/homepage-ad-bar.css",
  "src/components/home/HomepageAdBar.tsx",
  "src/config/homepage-ad.ts",
] as const) {
  assert.equal(existsSync(resolve(root, rel)), false, `PR-9: ${rel} must stay removed`);
}

console.log("\nhomepage-ad-bar-gate.test.ts: ok (header ad in navbar)");
