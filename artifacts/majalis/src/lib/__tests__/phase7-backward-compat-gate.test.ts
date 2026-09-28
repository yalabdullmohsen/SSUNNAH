/**
 * Phase 7 — Backward compatibility with currently published web (P1 on main).
 * Run: node --import tsx src/lib/__tests__/phase7-backward-compat-gate.test.ts
 *
 * Production pin (measured): https://www.ssunnah.com/version.json → 2e008c8d (P1 squash).
 * This RC must remain additive for APIs/storage used by that binary/web session.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

console.log("=== Canonical routes still registered ===");
const routes = read("src/AppRoutes.tsx");
for (const path of [
  "/mushaf",
  "/search",
  "/hadith",
  "/prayer-times",
  "/adhkar",
  "/offline",
  "/login",
  "/privacy",
  "/account-deletion",
]) {
  assert.match(routes, new RegExp(path.replace(/\//g, "\\/")));
}

console.log("=== Mushaf persistence keys remain versioned (no wipe-on-bump) ===");
const persistenceDir = resolve(majalisRoot, "src/lib/mushaf-persistence");
assert.ok(existsSync(persistenceDir));
const persistenceFiles = readdirSync(persistenceDir).filter((f) => f.endsWith(".ts"));
assert.ok(persistenceFiles.length > 0);
const persistenceBlob = persistenceFiles.map((f) => read(`src/lib/mushaf-persistence/${f}`)).join("\n");
assert.match(persistenceBlob, /v\d+|version|migrat/i);
assert.doesNotMatch(persistenceBlob, /localStorage\.clear\(\)/);
assert.doesNotMatch(persistenceBlob, /indexedDB\.deleteDatabase/);

console.log("=== API security layer from Phase 2 remains present ===");
for (const rel of [
  "lib/api-security-guard.mjs",
  "lib/api-security-policy.mjs",
  "lib/api-security-registry.mjs",
  "lib/api-dispatch.mjs",
]) {
  assert.ok(existsSync(resolve(majalisRoot, rel)), rel);
}
assert.ok(existsSync(resolve(majalisRoot, "api/healthz.js")));

console.log("=== Capacitor production host unchanged ===");
const cap = JSON.parse(read("capacitor.config.json")) as { server?: { url?: string } };
assert.equal(cap.server?.url, "https://www.ssunnah.com");

console.log("=== Env changeset documents no breaking SQL for this RC ===");
const envDoc = readFileSync(resolve(repoRoot, "docs/release/PHASE_7_ENVIRONMENT_CHANGESET.md"), "utf8");
assert.match(envDoc, /NOT_APPLICABLE|No new SQL|None for this RC/i);

console.log("phase7-backward-compat-gate.test.ts: ok");
