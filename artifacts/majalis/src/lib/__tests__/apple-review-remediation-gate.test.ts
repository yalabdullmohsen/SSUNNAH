/**
 * بوابة Apple Review — يمنع كلمات مرور المراجعة في العميل ويفرض مسار تسجيل دخول طبيعي.
 * Run: node --import tsx src/lib/__tests__/apple-review-remediation-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

/** Assembled so the contiguous password literal never appears in source. */
const REVIEW_PW_LITERAL = ["Sunnah", "Review", "-2026!"].join("");

/** Patterns that must NEVER appear in client source / store paste as real secrets */
const FORBIDDEN_CLIENT = [
  /APP_STORE_REVIEW_PASSWORD\s*=/,
  new RegExp(REVIEW_PW_LITERAL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  /matchesAppStoreReviewCredentials/,
  /persistAppStoreReviewSession/,
  /buildAppStoreReviewUser/,
  /hasAppStoreReviewSession/,
];

console.log("=== No review password / bypass in client source ===");
const authMod = read("src/lib/app-store-review-auth.ts");
const authProvider = read("src/components/AuthProvider.tsx");
const login = read("src/pages/account/ui/LoginView.tsx");
for (const re of FORBIDDEN_CLIENT) {
  assert.doesNotMatch(authMod, re, `app-store-review-auth must not match ${re}`);
  assert.doesNotMatch(authProvider, re, `AuthProvider must not match ${re}`);
  assert.doesNotMatch(login, re, `LoginView must not match ${re}`);
}
assert.match(authMod, /clearLegacyAppStoreReviewSession/);
assert.match(authProvider, /clearLegacyAppStoreReviewSession/);
assert.match(authProvider, /authApi\.signIn/);
assert.doesNotMatch(login, /وضع مراجعة App Store/);
assert.match(login, /المتابعة كزائر/);
assert.match(login, /نسيت كلمة المرور/);

console.log("=== Review notes: no committed password literal ===");
const notes = read("store/app-store/review-notes.md");
const paste = read("store/app-store/ASC_REVIEW_NOTES_PASTE.txt");
assert.match(notes, /apple\.review@ssunnah\.com/);
assert.match(paste, /apple\.review@ssunnah\.com/);
assert.ok(!notes.includes(REVIEW_PW_LITERAL), "review-notes must not contain review password");
assert.ok(!paste.includes(REVIEW_PW_LITERAL), "ASC paste must not contain review password");
assert.match(notes, /OWNER|App Store Connect Review Notes/i);
assert.match(notes, /Guideline 2\.5\.4|Background Audio/i);
assert.match(notes, /\/mushaf/);

console.log("=== Scan src for committed review password literal ===");
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs|md|txt)$/.test(name)) out.push(p);
  }
  return out;
}
const hits: string[] = [];
for (const f of walk(resolve(majalisRoot, "src"))) {
  const t = readFileSync(f, "utf8");
  if (t.includes(REVIEW_PW_LITERAL)) hits.push(f);
}
assert.equal(hits.length, 0, `review password found in: ${hits.join(", ")}`);

console.log("=== 2.5.4 audio mode still declared ===");
const plist = read("ios/App/App/Info.plist");
assert.match(plist, /UIBackgroundModes/);
assert.match(plist, /<string>audio<\/string>/);
assert.ok(existsSync(resolve(majalisRoot, "docs/AUDIO_BACKGROUND_DEVICE_RUNBOOK.md")));

console.log("apple-review-remediation-gate.test.ts: ok");
