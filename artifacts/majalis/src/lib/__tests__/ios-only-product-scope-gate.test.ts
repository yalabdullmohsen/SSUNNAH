/**
 * iOS-only product scope — يمنع عودة Android/Play إلى المنتج النشط.
 * node --import tsx src/lib/__tests__/ios-only-product-scope-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.equal(existsSync(resolve(majalisRoot, "android")), false, "android/ must not exist");
assert.equal(existsSync(resolve(majalisRoot, "android/app/build.gradle")), false);

const pkg = JSON.parse(readMaj("package.json")) as {
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
assert.equal(pkg.dependencies?.["@capacitor/android"], undefined, "no @capacitor/android dep");
assert.doesNotMatch(pkg.scripts?.["mobile:sync"] || "", /cap sync android/);
assert.match(pkg.scripts?.["mobile:sync"] || "", /cap sync ios/);
assert.match(pkg.scripts?.["mobile:android"] || "", /Android retired/);

const cap = JSON.parse(readMaj("capacitor.config.json")) as { appId: string };
assert.equal(cap.appId, "com.yousef.majlisilm");

const board = readRepo("docs/audit/IOS_ONLY_CLOSURE_BOARD.md");
assert.match(board, /LIVE_TRUTH_LOCKED_IOS_ONLY/);
assert.match(board, /Android/);

const inv = readRepo("docs/mobile/ANDROID_RETIREMENT_INVENTORY.md");
assert.match(inv, /DELETE_ANDROID_ONLY/);
assert.match(inv, /NO_UNKNOWN|None/);

const releaseVerify = readRepo("scripts/release-verify.mjs");
assert.match(releaseVerify, /android\/ retired \(iOS-only product\)/);
assert.doesNotMatch(releaseVerify, /androidAppId/);

console.log("ios-only-product-scope-gate: PASS");
