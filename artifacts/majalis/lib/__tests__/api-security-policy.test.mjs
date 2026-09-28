/**
 * بوابة سياسة أمن API المركزية.
 * node artifacts/majalis/lib/__tests__/api-security-policy.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { API_ROUTES } from "../api-dispatch.mjs";
import { ROUTE_SECURITY_CLASS } from "../api-security-registry.mjs";
import {
  SECURITY_CLASSES,
  assertRegistryComplete,
  getRouteSecurityClass,
  isAllowedOrigin,
  isAiFeatureEnabled,
  getAiModelAllowlist,
  safeSecretEqual,
} from "../api-security-policy.mjs";
import { stripClientCostOverrides, enforcePromptLength, assertModelAllowed } from "../api-cost-guard.mjs";

const majalisRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const libRoot = join(majalisRoot, "lib");

// 1) كل مسار في الجدول مصنّف
const prefixes = API_ROUTES.map((r) => r.prefix);
const missing = assertRegistryComplete(prefixes);
assert.equal(missing.length, 0, `unclassified: ${missing.join(",")}`);
for (const r of API_ROUTES) {
  assert.ok(r.securityClass, r.prefix);
  assert.ok(SECURITY_CLASSES.includes(r.securityClass), r.prefix);
  assert.equal(r.securityClass, ROUTE_SECURITY_CLASS[r.prefix]);
}

// 2) لا مسارات مكررة بنفس prefix+exact
const keys = API_ROUTES.map((r) => `${r.prefix}::${r.exact ? "e" : "p"}`);
assert.equal(new Set(keys).size, keys.length, "duplicate routes");

// 3) كل module موجود
for (const r of API_ROUTES) {
  const abs = join(libRoot, r.module.replace(/^\.\//, ""));
  assert.ok(existsSync(abs), `missing handler ${r.module} @ ${abs}`);
}

// 4) test-anthropic معطّل في الإنتاج
assert.equal(getRouteSecurityClass("/api/test-anthropic"), "DISABLED_IN_PRODUCTION");
const testAnth = readFileSync(join(libRoot, "api-handlers/test-anthropic.js"), "utf8");
assert.match(testAnth, /blockInProduction/);

// 5) لا fallback Admin→Cron
const envCfg = readFileSync(join(libRoot, "env-config.mjs"), "utf8");
assert.doesNotMatch(
  envCfg,
  /adminSecret\s*=\s*pick\(\s*"ADMIN_API_SECRET"\s*,\s*"CRON_SECRET"/,
);
assert.match(envCfg, /لا fallback إلى CRON_SECRET/);

// 6) CORS: لا wildcard
assert.equal(isAllowedOrigin("https://evil.example"), false);
assert.equal(isAllowedOrigin("https://ssunnah.app"), true);
assert.equal(isAllowedOrigin("capacitor://localhost"), true);

// 7) cost overrides مرفوضة
const stripped = stripClientCostOverrides({
  message: "hi",
  model: "evil",
  provider: "x",
  max_tokens: 999999,
});
assert.equal(stripped.model, undefined);
assert.equal(stripped.provider, undefined);
assert.equal(assertModelAllowed("not-a-model"), false);
assert.equal(assertModelAllowed(getAiModelAllowlist()[0]), true);
assert.equal(enforcePromptLength("a".repeat(5000)).ok, false);
assert.equal(enforcePromptLength("قصير").ok, true);

// 8) timing-safe secret compare
assert.equal(safeSecretEqual("abc", "abc"), true);
assert.equal(safeSecretEqual("abc", "abd"), false);
assert.equal(safeSecretEqual("", "x"), false);

// 9) kill switch
const prev = process.env.AI_EMERGENCY_KILL_SWITCH;
process.env.AI_EMERGENCY_KILL_SWITCH = "1";
assert.equal(isAiFeatureEnabled(), false);
if (prev === undefined) delete process.env.AI_EMERGENCY_KILL_SWITCH;
else process.env.AI_EMERGENCY_KILL_SWITCH = prev;

// 10) root api stubs resolve to existing handlers
const repoRoot = join(majalisRoot, "../..");
for (const rel of [
  "api/assistant.js",
  "api/healthz.js",
  "api/prayer-times.js",
  "api/test-anthropic.js",
  "api/cron/sync-data.js",
  "api/assistant/health.js",
]) {
  const stub = join(repoRoot, rel);
  assert.ok(existsSync(stub), `stub missing ${rel}`);
  const src = readFileSync(stub, "utf8");
  assert.match(src, /api-handlers\//);
}

console.log("api-security-policy.test.mjs: ok", API_ROUTES.length, "routes");
