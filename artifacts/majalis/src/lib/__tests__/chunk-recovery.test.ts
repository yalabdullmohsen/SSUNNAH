/**
 * بوابة استعادة chunks بعد النشر — هادئة بلا reload تلقائي.
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
  isChunkLoadError,
} from "../lazy-with-retry";
import {
  CHUNK_RECOVERING_EVENT,
  isChunkRecoveryInFlight,
  tryRecoverFromStaleChunk,
} from "../chunk-recovery";

const store = new Map<string, string>();
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

const reloads: string[] = [];
const events: unknown[] = [];
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
      reload: () => {
        reloads.push("reload");
      },
    },
  },
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: { serviceWorker: undefined },
  configurable: true,
});

assert.equal(isChunkLoadError(Object.assign(new Error("x"), { name: "ChunkLoadError" })), true);
assert.equal(isChunkLoadError(new Error("Loading CSS chunk 12 failed")), true);

store.clear();
reloads.length = 0;
events.length = 0;
assert.equal(tryRecoverFromStaleChunk("t1"), true);
assert.equal(isChunkRecoveryInFlight(), false, "must not stick in recovering");
assert.equal(store.get(CHUNK_RELOAD_KEY), "t1");
assert.equal(reloads.length, 0, "no automatic reload");
assert.equal(tryRecoverFromStaleChunk("t2"), false, "one attempt per session");
assert.equal(consumeChunkReloadAllowance("t3"), false);

clearChunkReloadGuard();

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const boundary = readFileSync(join(root, "components/ErrorBoundary.tsx"), "utf8");
assert.doesNotMatch(boundary, /تحديث العرض/);
assert.doesNotMatch(boundary, /تم تحديث المنصة/);
assert.match(boundary, /hardRecoverStaleDeploy/);
assert.match(boundary, /tryRecoverFromStaleChunk/);
assert.match(boundary, /noindex,\s*follow/);
assert.match(boundary, /data-nosnippet/);
assert.match(boundary, /أقسام مفيدة/);

const main = readFileSync(join(root, "main.tsx"), "utf8");
assert.match(main, /ChunkRecoveryToast/);
const toast = readFileSync(join(root, "components/ChunkRecoveryToast.tsx"), "utf8");
assert.match(toast, /return null/);

assert.equal(typeof CHUNK_RECOVERING_EVENT, "string");

console.log("chunk-recovery.test.ts: ok");
