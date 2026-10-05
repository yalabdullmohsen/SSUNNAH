/**
 * بوابة إعادة التحميل التلقائية الصامتة بعد نشر جديد (chunk قديم — MJL-20261005-203837-YZ77CE).
 * - فشل تحميل جزء بسبب تحديث ⇒ إعادة تحميل واحدة بصمت (الوعد يبقى معلّقًا ⇒ لا شاشة خطأ).
 * - لا تكرار لا نهائي: مرة لكل بناء فاشل · لا تُمسح عند استقرار القشرة · فاصل 30 ثانية · لا أثناء الانقطاع.
 * تشغيل: node --import tsx src/lib/__tests__/chunk-auto-reload.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHUNK_AUTO_RELOAD_KEY,
  CHUNK_AUTO_RELOAD_MIN_INTERVAL_MS,
  canAutoReloadForStaleChunk,
  clearChunkReloadGuard,
  consumeChunkAutoReload,
  getChunkRecoveryBuildId,
  loadWithChunkRecovery,
} from "../lazy-with-retry";
import {
  clearChunkRecoveryAfterStableBoot,
  resetChunkAutoReloadPendingForTests,
} from "../chunk-recovery";

const session = new Map<string, string>();
const local = new Map<string, string>();
let storageThrows = false;
function fakeStorage(map: Map<string, string>) {
  return {
    getItem: (k: string) => {
      if (storageThrows) throw new Error("SecurityError");
      return map.has(k) ? map.get(k)! : null;
    },
    setItem: (k: string, v: string) => {
      if (storageThrows) throw new Error("SecurityError");
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}
Object.defineProperty(globalThis, "sessionStorage", { value: fakeStorage(session), configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: fakeStorage(local), configurable: true });

const reloads: string[] = [];
const swMessages: unknown[] = [];
let online = true;
Object.defineProperty(globalThis, "window", {
  value: {
    dispatchEvent: () => true,
    location: {
      pathname: "/quran",
      reload: () => {
        reloads.push("reload");
      },
    },
  },
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  get: () => ({
    onLine: online,
    serviceWorker: { controller: { postMessage: (m: unknown) => swMessages.push(m) } },
  }),
  configurable: true,
});

const build = getChunkRecoveryBuildId();
const staleChunk = () =>
  Promise.reject(new Error("Failed to fetch dynamically imported module: /assets/QuranPage-old123.js"));
const PENDING = Symbol("pending");
async function settle<T>(p: Promise<T>): Promise<T | typeof PENDING | { rejected: unknown }> {
  return Promise.race([
    p.then(
      (v) => v,
      (e) => ({ rejected: e }),
    ),
    new Promise<typeof PENDING>((r) => setTimeout(() => r(PENDING), 50)),
  ]);
}
function resetAll() {
  session.clear();
  local.clear();
  reloads.length = 0;
  swMessages.length = 0;
  online = true;
  storageThrows = false;
}

// 1) أول فشل chunk بعد نشر ⇒ إعادة تحميل واحدة صامتة؛ الوعد معلّق ⇒ لا شاشة خطأ
resetAll();
const first = await settle(loadWithChunkRecovery(staleChunk, "QuranPage"));
assert.equal(first, PENDING, "يبقى الوعد معلّقًا (Suspense) — لا خطأ يصل لـErrorBoundary");
assert.deepEqual(reloads, ["reload"], "إعادة تحميل واحدة");
assert.ok(String(session.get(CHUNK_AUTO_RELOAD_KEY)).startsWith(`${build}|`));
assert.ok(local.has(CHUNK_AUTO_RELOAD_KEY), "مرآة localStorage (Capacitor)");
assert.ok(
  swMessages.some((m) => (m as { type?: string }).type === "MAJALIS_PURGE_SHELL_ASSETS"),
  "purge قشرة SW قبل إعادة التحميل",
);

// 2) فشل آخر قبل اكتمال إعادة التحميل (نفس الصفحة) ⇒ لا إعادة تحميل ثانية
const concurrent = await settle(loadWithChunkRecovery(staleChunk, "Other"));
assert.equal(concurrent, PENDING);
assert.equal(reloads.length, 1, "لا إعادة تحميل مزدوجة");

// 3) بعد إعادة التحميل (نسخة وحدة جديدة = صفحة جديدة) والـchunk ما زال مفقودًا لنفس البناء
//    ⇒ لا إعادة تحميل ثانية: يُرفض الخطأ فتظهر شاشة الخطأ (لا حلقة لا نهائية)
resetChunkAutoReloadPendingForTests();
const fresh = { loadWithChunkRecovery };
reloads.length = 0;
const second = await settle(fresh.loadWithChunkRecovery(staleChunk, "QuranPage"));
assert.ok(typeof second === "object" && second !== null && "rejected" in second, "الخطأ يصل للحدود");
assert.equal(reloads.length, 0, "لا إعادة تحميل ثانية لنفس البناء");

// 4) استقرار القشرة يمسح حارس الاستعادة القديم — لكن ليس حارس إعادة التحميل التلقائية
clearChunkRecoveryAfterStableBoot("test-stable");
clearChunkReloadGuard();
assert.ok(session.has(CHUNK_AUTO_RELOAD_KEY), "الحارس يبقى بعد shell-stable");
assert.equal(canAutoReloadForStaleChunk(), false);
const third = await settle(fresh.loadWithChunkRecovery(staleChunk, "QuranPage"));
assert.ok(typeof third === "object" && third !== null && "rejected" in third);
assert.equal(reloads.length, 0, "لا حلقة بعد استقرار القشرة");

// 5) بناء آخر لكن خلال 30 ثانية من إعادة تحميل سابقة ⇒ ممنوع (شبكة أمان)
resetAll();
const now = Date.now();
session.set(CHUNK_AUTO_RELOAD_KEY, `older-build|${now - 5_000}`);
assert.equal(canAutoReloadForStaleChunk(now), false);

// 6) نشر لاحق: بناء مختلف وبعد انقضاء الفاصل ⇒ محاولة جديدة مسموحة مرة واحدة
session.set(CHUNK_AUTO_RELOAD_KEY, `older-build|${now - CHUNK_AUTO_RELOAD_MIN_INTERVAL_MS - 1}`);
assert.equal(canAutoReloadForStaleChunk(now), true);
assert.equal(consumeChunkAutoReload(now), true);
assert.equal(consumeChunkAutoReload(now + 60_000), false, "مرة واحدة لكل بناء");

// 7) انقطاع الشبكة ⇒ لا إعادة تحميل ولا استهلاك للمحاولة (رسالة الانقطاع الصادقة تبقى)
resetAll();
online = false;
const offline = await settle(fresh.loadWithChunkRecovery(staleChunk, "QuranPage"));
assert.ok(typeof offline === "object" && offline !== null && "rejected" in offline);
assert.equal(reloads.length, 0);
assert.equal(session.has(CHUNK_AUTO_RELOAD_KEY), false, "الانقطاع لا يستهلك المحاولة");
online = true;

// 8) تخزين محظور (لا يمكن حفظ الحارس) ⇒ لا إعادة تحميل — منع الحلقة أولى
resetAll();
storageThrows = true;
assert.equal(consumeChunkAutoReload(), false);
const blocked = await settle(fresh.loadWithChunkRecovery(staleChunk, "QuranPage"));
assert.ok(typeof blocked === "object" && blocked !== null && "rejected" in blocked);
assert.equal(reloads.length, 0);
storageThrows = false;

// 9) خطأ غير chunk ⇒ يُرفض كما هو بلا إعادة تحميل
resetAll();
const bug = new TypeError("Cannot read properties of undefined");
const notChunk = await settle(fresh.loadWithChunkRecovery(() => Promise.reject(bug), "X"));
assert.deepEqual(notChunk, { rejected: bug });
assert.equal(reloads.length, 0);
assert.equal(session.has(CHUNK_AUTO_RELOAD_KEY), false);

// 10) تحميل ناجح ⇒ يُعاد الموديول
const ok = await fresh.loadWithChunkRecovery(() => Promise.resolve({ default: "Page" }), "Y");
assert.deepEqual(ok, { default: "Page" });

// 11) الحدود: لا شاشة خطأ أثناء إعادة التحميل التلقائية · بلا مؤقتات reload محظورة
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const boundary = readFileSync(join(root, "components/ErrorBoundary.tsx"), "utf8");
assert.equal(
  (boundary.match(/if \(this\.state\.error && this\.state\.autoReloading\) return null;/g) ?? []).length,
  2,
  "ErrorBoundary وSectionErrorBoundary لا يعرضان شاشة خطأ أثناء إعادة التحميل",
);
assert.equal((boundary.match(/reloadOnceForStaleChunk\(/g) ?? []).length, 2);
assert.match(boundary, /autoReloading: shouldAutoReload\(error\)/);
const lazySrc = readFileSync(join(root, "lib/lazy-with-retry.ts"), "utf8");
assert.match(lazySrc, /lazy\(\(\) => loadWithChunkRecovery\(factory, label\)\)/);
assert.doesNotMatch(lazySrc, /setTimeout/);
const recoverySrc = readFileSync(join(root, "lib/chunk-recovery.ts"), "utf8");
assert.doesNotMatch(recoverySrc, /safeLocationReload/);
assert.doesNotMatch(recoverySrc, /CHUNK_AUTO_RELOAD_KEY[\s\S]{0,80}removeItem/, "الحارس لا يُمسح");

console.log("chunk-auto-reload.test.ts: ok");
