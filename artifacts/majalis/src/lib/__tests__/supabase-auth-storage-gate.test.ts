/**
 * بوابة تخزين جلسة Supabase — Web vs Keychain + migration safety.
 * Run: node --import tsx src/lib/__tests__/supabase-auth-storage-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { __authStorageTest, createSupabaseAuthStorage } from "../supabase-auth-storage";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

console.log("=== Wiring ===");
const boot = read("src/lib/supabase-bootstrap.ts");
assert.match(boot, /createSupabaseAuthStorage/);
assert.match(boot, /storage:\s*createSupabaseAuthStorage\(\)/);

const plugin = read("ios/App/App/SunnahAuthKeychainPlugin.swift");
assert.match(plugin, /SunnahAuthKeychainPlugin/);
assert.match(plugin, /KeychainStore/);
assert.doesNotMatch(plugin, /UserDefaults\.(standard|suiteName)|NSUserDefaults/);
assert.match(plugin, /cap\.supabase\./);

const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
assert.match(pbx, /SunnahAuthKeychainPlugin\.swift/);

const keychainStore = read("ios/App/App/Services/KeychainStore.swift");
assert.match(keychainStore, /enum KeychainStore|struct KeychainStore|KeychainStore/);

console.log("=== Session blob heuristic ===");
assert.equal(__authStorageTest.looksLikeSessionBlob(""), false);
assert.equal(__authStorageTest.looksLikeSessionBlob("{"), false);
assert.equal(__authStorageTest.looksLikeSessionBlob("not-json"), false);
assert.equal(
  __authStorageTest.looksLikeSessionBlob(JSON.stringify({ access_token: "x", refresh_token: "y" })),
  true,
);

type CapPlugin = {
  get: (opts: { key: string }) => Promise<{ value?: string | null }>;
  set: (opts: { key: string; value: string }) => Promise<{ ok?: boolean }>;
  remove: (opts: { key: string }) => Promise<{ ok?: boolean }>;
};

function installLocalStorage(mem: Map<string, string>) {
  const g = globalThis as unknown as { window?: unknown; localStorage?: Storage };
  const prevWindow = g.window;
  const prevLs = g.localStorage;
  g.window = g.window ?? globalThis;
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

console.log("=== Web storage round-trip ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  const g = globalThis as unknown as { window: { Capacitor?: unknown } };
  delete g.window.Capacitor;
  const storage = createSupabaseAuthStorage();
  const blob = JSON.stringify({ access_token: "a", refresh_token: "b" });
  await storage.setItem("sb-test-auth-token", blob);
  assert.equal(await storage.getItem("sb-test-auth-token"), blob);
  assert.equal(mem.get("sb-test-auth-token"), blob);
  await storage.removeItem("sb-test-auth-token");
  assert.equal(await storage.getItem("sb-test-auth-token"), null);
  restore();
}

console.log("=== Native Keychain adapter + migration ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  const chain = new Map<string, string>();
  const mock: CapPlugin = {
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
  };
  const g = globalThis as unknown as {
    window: { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, CapPlugin> } };
  };
  g.window.Capacitor = {
    isNativePlatform: () => true,
    Plugins: { SunnahAuthKeychain: mock },
  };

  const legacyKey = "sb-native-auth-token";
  const legacyBlob = JSON.stringify({ access_token: "legacy-a", refresh_token: "legacy-b" });
  mem.set(legacyKey, legacyBlob);

  const storage = createSupabaseAuthStorage();
  const got = await storage.getItem(legacyKey);
  assert.equal(got, legacyBlob);
  assert.equal(chain.get(legacyKey), legacyBlob);
  assert.equal(mem.has(legacyKey), false, "legacy localStorage token must be purged after migration");
  assert.equal(mem.get(__authStorageTest.MIGRATION_FLAG), "1");

  const refreshed = JSON.stringify({ access_token: "new-a", refresh_token: "new-b" });
  await storage.setItem(legacyKey, refreshed);
  assert.equal(chain.get(legacyKey), refreshed);
  assert.equal(mem.has(legacyKey), false, "refresh must not leave token in localStorage");

  mem.set(__authStorageTest.LEGACY_REVIEW_FLAG, "1");
  await storage.removeItem(legacyKey);
  assert.equal(chain.has(legacyKey), false);
  assert.equal(mem.has(legacyKey), false);
  assert.equal(mem.has(__authStorageTest.LEGACY_REVIEW_FLAG), false);

  restore();
}

console.log("=== Malformed legacy session does not crash ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  const chain = new Map<string, string>();
  const mock: CapPlugin = {
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
  };
  const g = globalThis as unknown as {
    window: { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, CapPlugin> } };
  };
  g.window.Capacitor = {
    isNativePlatform: () => true,
    Plugins: { SunnahAuthKeychain: mock },
  };
  mem.set("sb-bad", "{not-json");
  const storage = createSupabaseAuthStorage();
  const got = await storage.getItem("sb-bad");
  assert.equal(got, null);
  assert.equal(chain.has("sb-bad"), false);
  assert.equal(mem.get(__authStorageTest.MIGRATION_FLAG), "1");
  restore();
}

console.log("=== Missing native bridge fails safely (web fallback, no throw) ===");
{
  const mem = new Map<string, string>();
  const restore = installLocalStorage(mem);
  const g = globalThis as unknown as {
    window: { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, never> } };
  };
  g.window.Capacitor = { isNativePlatform: () => true, Plugins: {} };
  const storage = createSupabaseAuthStorage();
  const blob = JSON.stringify({ access_token: "fb", refresh_token: "fb2" });
  await storage.setItem("sb-fallback", blob);
  assert.equal(await storage.getItem("sb-fallback"), blob);
  restore();
}

console.log("=== Source: no token dump / review password in auth storage module ===");
const storageSrc = read("src/lib/supabase-auth-storage.ts");
const reviewPwLiteral = ["Sunnah", "Review", "-2026!"].join("");
assert.doesNotMatch(storageSrc, /console\.(log|info|debug|warn|error)\([^)]*token/i);
assert.ok(!storageSrc.includes(reviewPwLiteral));
assert.doesNotMatch(storageSrc, /UserDefaults/);

console.log("supabase-auth-storage-gate.test.ts: ok");
