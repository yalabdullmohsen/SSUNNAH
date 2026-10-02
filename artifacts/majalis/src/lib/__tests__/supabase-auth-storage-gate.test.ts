/**
 * بوابة تخزين جلسة Supabase — registerPlugin + Keychain + migration + logout.
 * Run: node --import tsx src/lib/__tests__/supabase-auth-storage-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  __authStorageTest,
  clearAllNativeAuthSessions,
  createSupabaseAuthStorage,
} from "../supabase-auth-storage";
import {
  __resetSunnahAuthKeychainPluginCacheForTests,
  __setSunnahAuthKeychainPluginForTests,
  NATIVE_LEGACY_SESSION_ACCOUNT,
  SUNNAH_AUTH_KEYCHAIN_PLUGIN_NAME,
  type SunnahAuthKeychainPlugin,
} from "../plugins/sunnah-auth-keychain";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

console.log("=== Wiring: registerPlugin required ===");
const pluginMod = read("src/lib/plugins/sunnah-auth-keychain.ts");
assert.match(pluginMod, /registerPlugin/);
assert.match(pluginMod, /SunnahAuthKeychain/);
assert.match(pluginMod, /clearNativeLegacySession/);
assert.doesNotMatch(pluginMod, /Capacitor\?\.Plugins|Plugins\?\.SunnahAuthKeychain/);

const storageSrc = read("src/lib/supabase-auth-storage.ts");
assert.match(storageSrc, /getSunnahAuthKeychainPlugin/);
assert.match(storageSrc, /clearAllNativeAuthSessions/);
assert.match(storageSrc, /keychain_unavailable_fallback/);
assert.doesNotMatch(storageSrc, /Capacitor\?\.Plugins|Plugins\?\.SunnahAuthKeychain/);

const boot = read("src/lib/supabase-bootstrap.ts");
assert.match(boot, /createSupabaseAuthStorage/);
assert.match(boot, /storage:\s*createSupabaseAuthStorage\(\)/);

const supabaseApi = read("src/lib/supabase.ts");
assert.match(supabaseApi, /clearAllNativeAuthSessions/);
assert.match(supabaseApi, /export async function signOut/);

const swift = read("ios/App/App/SunnahAuthKeychainPlugin.swift");
assert.match(swift, /clearNativeLegacySession/);
assert.match(swift, /majlis\.auth\.session\.v1/);
assert.match(swift, /KeychainStore/);
assert.doesNotMatch(swift, /UserDefaults\.(standard|suiteName)|NSUserDefaults/);

const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
assert.match(pbx, /SunnahAuthKeychainPlugin\.swift/);

assert.equal(SUNNAH_AUTH_KEYCHAIN_PLUGIN_NAME, "SunnahAuthKeychain");
assert.equal(NATIVE_LEGACY_SESSION_ACCOUNT, "majlis.auth.session.v1");

console.log("=== Session blob heuristic ===");
assert.equal(__authStorageTest.looksLikeSessionBlob(""), false);
assert.equal(__authStorageTest.looksLikeSessionBlob("{"), false);
assert.equal(
  __authStorageTest.looksLikeSessionBlob(JSON.stringify({ access_token: "x", refresh_token: "y" })),
  true,
);

function installLocalStorage(mem: Map<string, string>) {
  const g = globalThis as unknown as { window?: unknown; localStorage?: Storage };
  const prevWindow = g.window;
  const prevLs = g.localStorage;
  g.window = (g.window ?? globalThis) as Window & typeof globalThis;
  g.localStorage = {
    get length() {
      return mem.size;
    },
    clear() {
      mem.clear();
    },
    getItem(k: string) {
      return mem.has(k) ? mem.get(k)! : null;
    },
    setItem(k: string, v: string) {
      mem.set(k, String(v));
    },
    removeItem(k: string) {
      mem.delete(k);
    },
    key() {
      return null;
    },
  } as Storage;
  return () => {
    g.window = prevWindow;
    g.localStorage = prevLs;
  };
}

function markNativeIos() {
  const g = globalThis as unknown as {
    window: { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } };
  };
  g.window.Capacitor = {
    isNativePlatform: () => true,
    getPlatform: () => "ios",
  };
}

function makeMockPlugin(chain: Map<string, string>, state: { legacyCleared: boolean }): SunnahAuthKeychainPlugin {
  return {
    async get({ key }) {
      return { value: chain.has(key) ? chain.get(key)! : null };
    },
    async set({ key, value }) {
      chain.set(key, value);
      return { ok: true };
    },
    async remove({ key }) {
      chain.delete(key);
      return { ok: true };
    },
    async clearNativeLegacySession() {
      state.legacyCleared = true;
      return { ok: true };
    },
  };
}

console.log("=== Web storage round-trip ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  const g = globalThis as unknown as { window: { Capacitor?: unknown } };
  delete g.window.Capacitor;
  __resetSunnahAuthKeychainPluginCacheForTests();
  const storage = createSupabaseAuthStorage();
  const blob = JSON.stringify({ access_token: "a", refresh_token: "b" });
  await storage.setItem("sb-test-auth-token", blob);
  assert.equal(await storage.getItem("sb-test-auth-token"), blob);
  assert.equal(mem.get("sb-test-auth-token"), blob);
  await storage.removeItem("sb-test-auth-token");
  assert.equal(await storage.getItem("sb-test-auth-token"), null);
  restore();
}

console.log("=== Native Keychain path + migration via registered plugin ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  markNativeIos();
  const chain = new Map<string, string>();
  const state = { legacyCleared: false };
  __setSunnahAuthKeychainPluginForTests(makeMockPlugin(chain, state));

  const storage = createSupabaseAuthStorage();
  const legacyKey = "sb-native-auth-token";
  const legacyBlob = JSON.stringify({ access_token: "legacy-a", refresh_token: "legacy-b" });
  mem.set(legacyKey, legacyBlob);

  const got = await storage.getItem(legacyKey);
  assert.equal(got, legacyBlob);
  assert.equal(chain.get(legacyKey), legacyBlob);
  assert.equal(mem.has(legacyKey), false, "legacy localStorage purged after Keychain migration");
  assert.equal(mem.get(__authStorageTest.MIGRATION_FLAG), "1");
  assert.notEqual(mem.get(__authStorageTest.FALLBACK_FLAG), __authStorageTest.FALLBACK_MODE);

  const refreshed = JSON.stringify({ access_token: "new-a", refresh_token: "new-b" });
  await storage.setItem(legacyKey, refreshed);
  assert.equal(chain.get(legacyKey), refreshed);
  assert.equal(mem.has(legacyKey), false, "refresh must not leave token in localStorage");

  mem.set(__authStorageTest.LEGACY_REVIEW_FLAG, "1");
  await storage.removeItem(legacyKey);
  assert.equal(chain.has(legacyKey), false);
  assert.equal(state.legacyCleared, true, "remove/logout clears majlis.auth.session.v1");
  assert.equal(mem.has(__authStorageTest.LEGACY_REVIEW_FLAG), false);

  __resetSunnahAuthKeychainPluginCacheForTests();
  restore();
}

console.log("=== Missing plugin → classified fallback (not Keychain success) ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  markNativeIos();
  __setSunnahAuthKeychainPluginForTests(null);

  const storage = createSupabaseAuthStorage();
  const blob = JSON.stringify({ access_token: "fb", refresh_token: "fb2" });
  await storage.setItem("sb-fallback", blob);
  assert.equal(mem.get(__authStorageTest.FALLBACK_FLAG), __authStorageTest.FALLBACK_MODE);
  assert.equal(await storage.getItem("sb-fallback"), blob);
  assert.equal(mem.get("sb-fallback"), blob);

  __resetSunnahAuthKeychainPluginCacheForTests();
  restore();
}

console.log("=== Malformed legacy session does not crash ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  markNativeIos();
  const chain = new Map<string, string>();
  const state = { legacyCleared: false };
  __setSunnahAuthKeychainPluginForTests(makeMockPlugin(chain, state));
  mem.set("sb-bad", "{not-json");
  const storage = createSupabaseAuthStorage();
  const got = await storage.getItem("sb-bad");
  assert.equal(got, null);
  assert.equal(chain.has("sb-bad"), false);
  assert.equal(mem.get(__authStorageTest.MIGRATION_FLAG), "1");
  __resetSunnahAuthKeychainPluginCacheForTests();
  restore();
}

console.log("=== clearAllNativeAuthSessions clears legacy Keychain account ===");
{
  const state = { legacyCleared: false };
  __setSunnahAuthKeychainPluginForTests(makeMockPlugin(new Map(), state));
  await clearAllNativeAuthSessions();
  assert.equal(state.legacyCleared, true);
  __resetSunnahAuthKeychainPluginCacheForTests();
  await clearAllNativeAuthSessions(); // web / no plugin — no throw
}

console.log("=== Source: no token dump ===");
assert.doesNotMatch(storageSrc, /console\.(log|info|debug|warn|error)\([^)]*token/i);

console.log("supabase-auth-storage-gate.test.ts: ok");
