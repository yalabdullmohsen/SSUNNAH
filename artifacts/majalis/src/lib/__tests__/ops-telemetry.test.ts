/**
 * مرصدية محلية — لا ترمي · لا تسجّل حقولًا حسّاسة.
 * تشغيل: node --import tsx src/lib/__tests__/ops-telemetry.test.ts
 */
import assert from "node:assert/strict";
import {
  clearOpsTelemetryForTests,
  getOpsTelemetrySnapshot,
  trackOps,
} from "../ops-telemetry";

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

clearOpsTelemetryForTests();
trackOps("chunk.load_failure", {
  label: "x",
  token: "SECRET",
  password: "p",
  buildId: "b1",
});
const snap = getOpsTelemetrySnapshot();
assert.equal(snap.length, 1);
assert.equal(snap[0]!.name, "chunk.load_failure");
assert.equal(snap[0]!.data?.token, undefined);
assert.equal(snap[0]!.data?.password, undefined);
assert.equal(snap[0]!.data?.buildId, "b1");

// لا يرمي عند فشل التخزين
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  },
  configurable: true,
});
assert.doesNotThrow(() => trackOps("splash.cleared", { reason: "timeout" }));

console.log("ops-telemetry.test.ts: ok");
