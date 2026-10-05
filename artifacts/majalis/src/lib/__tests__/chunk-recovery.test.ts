/**
 * بوابة الاستعادة الهادئة (tryRecoverFromStaleChunk) — بلا reload تلقائي؛ إعادة التحميل الصامتة الواحدة في chunk-auto-reload.test.ts.
 * تشغيل: node --import tsx src/lib/__tests__/chunk-recovery.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHUNK_RELOAD_KEY,
  clearChunkReloadGuard,
  consumeChunkReloadAllowance,
  getChunkRecoveryBuildId,
  hasChunkReloadBeenAttempted,
  isChunkLoadError,
  recordChunkFailureMeta,
} from "../lazy-with-retry";
import {
  CHUNK_RECOVERING_EVENT,
  clearChunkRecoveryAfterStableBoot,
  hardRecoverStaleDeploy,
  isChunkRecoveryInFlight,
  tryRecoverFromStaleChunk,
} from "../chunk-recovery";
import { isBrowserOffline, isChunkLoadError as isChunkErr } from "../lazy-with-retry";
import { clearOpsTelemetryForTests, getOpsTelemetrySnapshot } from "../ops-telemetry";

const store = new Map<string, string>();
const localStore = new Map<string, string>();
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  },
  configurable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => (localStore.has(k) ? localStore.get(k)! : null),
    setItem: (k: string, v: string) => {
      localStore.set(k, v);
    },
    removeItem: (k: string) => {
      localStore.delete(k);
    },
  },
  configurable: true,
});

const reloads: string[] = [];
const events: unknown[] = [];
let online = true;
Object.defineProperty(globalThis, "window", {
  value: {
    setTimeout: (fn: () => void) => {
      fn();
      return 0;
    },
    dispatchEvent: (ev: unknown) => {
      events.push(ev);
      return true;
    },
    location: {
      pathname: "/mushaf",
      reload: () => {
        reloads.push("reload");
      },
    },
  },
  configurable: true,
});

// 7) عمل دون Service Worker
Object.defineProperty(globalThis, "navigator", {
  get: () => ({ serviceWorker: undefined, onLine: online }),
  configurable: true,
});

clearOpsTelemetryForTests();

assert.equal(isChunkLoadError(Object.assign(new Error("x"), { name: "ChunkLoadError" })), true);
assert.equal(isChunkLoadError(new Error("Loading CSS chunk 12 failed")), true);

// 0) خطأ غير chunk — لا مسار استعادة
assert.equal(isChunkLoadError(new Error("TypeError: cannot read")), false);
assert.equal(isChunkErr(new Error("network timeout unrelated")), false);

// 1) فشل chunk لأول مرة → استعادة هادئة
store.clear();
localStore.clear();
reloads.length = 0;
events.length = 0;
online = true;
const err1 = new Error("Failed to fetch dynamically imported module: /assets/MushafReaderPage-abc.js");
assert.equal(tryRecoverFromStaleChunk("t1", err1), true);
assert.equal(isChunkRecoveryInFlight(), false, "must not stick in recovering");
assert.ok(String(store.get(CHUNK_RELOAD_KEY)).includes("|t1") || store.get(CHUNK_RELOAD_KEY) === "t1");
assert.ok(localStore.has(CHUNK_RELOAD_KEY), "Capacitor-durable localStorage mirror");
assert.equal(reloads.length, 0, "no automatic reload");
assert.equal(hasChunkReloadBeenAttempted(), true);
assert.equal((globalThis as { window: { location: { pathname: string } } }).window.location.pathname, "/mushaf");

// 2) نجاح recovery (purge هادئ) — بلا reload
const snap = getOpsTelemetrySnapshot();
assert.ok(snap.some((e) => e.name === "chunk.recovery_attempted"));
assert.ok(snap.some((e) => e.name === "chunk.recovery_result" && e.data?.ok === true));

// 3) فشل recovery بعد المحاولة — لا محاولة ثانية لنفس البناء
assert.equal(tryRecoverFromStaleChunk("t2", err1), false, "one attempt per build");
assert.equal(consumeChunkReloadAllowance("t3"), false);

// 4) عدم حدوث reload loop
assert.equal(reloads.length, 0, "still no reload after exhausted allowance");

// 5) اختلاف build/version → محاولة جديدة
const buildId = getChunkRecoveryBuildId();
store.set(CHUNK_RELOAD_KEY, `other-build-xyz|old`);
assert.equal(hasChunkReloadBeenAttempted(), false, "different build opens allowance");
assert.equal(consumeChunkReloadAllowance("new-build"), true);
assert.ok(String(store.get(CHUNK_RELOAD_KEY)).startsWith(`${buildId}|`));

// تنظيف بعد استقرار الإقلاع
clearChunkRecoveryAfterStableBoot("test-stable");
assert.equal(store.has(CHUNK_RELOAD_KEY), false, "guard cleared after stable boot");

// metadata
const meta = recordChunkFailureMeta("meta-label", err1);
assert.ok(meta);
assert.equal(meta!.label, "meta-label");
assert.ok(meta!.chunkHint?.includes("MushafReaderPage") || meta!.chunkHint === null || typeof meta!.chunkHint === "string");

clearChunkReloadGuard();

// 6) مسار Capacitor — لا يعتمد على SW (navigator.serviceWorker undefined أعلاه)
store.clear();
localStore.clear();
assert.equal(tryRecoverFromStaleChunk("cap-native", err1), true);
assert.equal(reloads.length, 0);

clearChunkReloadGuard();

// 8) OFFLINE — بلا reload · بلا استنزاف المحاولة
online = false;
store.clear();
localStore.clear();
reloads.length = 0;
assert.equal(isBrowserOffline(), true);
assert.equal(tryRecoverFromStaleChunk("offline-1", err1), false);
assert.equal(hasChunkReloadBeenAttempted(), false, "offline must not burn allowance");
assert.equal(reloads.length, 0);
await hardRecoverStaleDeploy();
assert.equal(reloads.length, 0, "hard recover blocked while offline");
online = true;

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const boundary = readFileSync(join(root, "components/ErrorBoundary.tsx"), "utf8");
assert.doesNotMatch(boundary, /تحديث العرض/);
assert.doesNotMatch(boundary, /تم تحديث المنصة/);
assert.match(boundary, /hardRecoverStaleDeploy/);
assert.match(boundary, /tryRecoverFromStaleChunk/);
assert.match(boundary, /isBrowserOffline/);
assert.match(boundary, /noindex,\s*follow/);
assert.match(boundary, /data-nosnippet/);
assert.match(boundary, /أقسام مفيدة/);

const main = readFileSync(join(root, "main.tsx"), "utf8");
assert.match(main, /ChunkRecoveryToast/);
const toast = readFileSync(join(root, "components/ChunkRecoveryToast.tsx"), "utf8");
assert.match(toast, /return null/);

const shell = readFileSync(join(root, "lib/app-shell-stability.ts"), "utf8");
assert.match(shell, /clearChunkRecoveryAfterStableBoot/);

assert.equal(typeof CHUNK_RECOVERING_EVENT, "string");

console.log("chunk-recovery.test.ts: ok");
