/**
 * حارس التركيب: شاشة تحميل + «إعادة المحاولة» + إعادة تحميل واحدة، ولا شيء إن رُكِّب التطبيق.
 * التشغيل: node --import tsx src/lib/__tests__/mount-watchdog.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOUNT_WATCHDOG_OVERLAY_ID,
  MOUNT_WATCHDOG_RELOAD_KEY,
  __resetMountWatchdogForTests,
  installMountWatchdog,
  markAppMounted,
} from "../mount-watchdog";

type El = { id?: string; children: El[]; listeners: Record<string, () => void>; style: Record<string, string>; [k: string]: unknown };
function makeDoc() {
  const body: El = { children: [], listeners: {}, style: {} };
  const mk = (): El => {
    const e: El = {
      children: [],
      listeners: {},
      style: {},
      setAttribute() {},
      addEventListener(t: string, f: () => void) { e.listeners[t] = f; },
      append(...c: El[]) { e.children.push(...c); },
      remove() { const i = body.children.indexOf(e); if (i >= 0) body.children.splice(i, 1); },
    };
    return e;
  };
  body.append = (...c: El[]) => { body.children.push(...c); };
  const doc = {
    body,
    createElement: mk,
    getElementById: (id: string) => body.children.find((c) => c.id === id) ?? null,
  };
  return doc as unknown as Document & { body: El };
}
const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 1) لا تركيب → overlay ثم reload واحد فقط
{
  __resetMountWatchdogForTests();
  const doc = makeDoc(); const storage = mem(); let reloads = 0;
  installMountWatchdog({ doc, storage, reload: () => void reloads++, showAfterMs: 20, reloadAfterMs: 20 });
  await wait(30);
  assert.ok(doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID), "تظهر شاشة التحميل");
  const btn = doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID)!.children.find((c) => c.textContent === "إعادة المحاولة");
  assert.ok(btn, "زر إعادة المحاولة");
  btn!.listeners.click();
  assert.equal(reloads, 1, "الزر يعيد التحميل");
  await wait(40);
  assert.equal(reloads, 2, "إعادة تحميل تلقائية واحدة");
  // جلسة ثانية بنفس التخزين: لا إعادة تحميل ثانية
  const doc2 = makeDoc(); let r2 = 0;
  installMountWatchdog({ doc: doc2, storage, reload: () => void r2++, showAfterMs: 10, reloadAfterMs: 10 });
  await wait(40);
  assert.equal(r2, 0, "لا حلقة إعادة تحميل");
  assert.equal(storage.getItem(MOUNT_WATCHDOG_RELOAD_KEY), "1");
}

// 2) تركيب قبل المهلة → لا شيء
{
  __resetMountWatchdogForTests();
  const doc = makeDoc(); const storage = mem(); let reloads = 0;
  installMountWatchdog({ doc, storage, reload: () => void reloads++, showAfterMs: 20, reloadAfterMs: 20 });
  markAppMounted(doc, storage);
  await wait(60);
  assert.equal(doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID), null);
  assert.equal(reloads, 0);
}

// 3) تركيب متأخر بعد ظهور الشاشة → تُزال
{
  __resetMountWatchdogForTests();
  const doc = makeDoc(); const storage = mem(); let reloads = 0;
  installMountWatchdog({ doc, storage, reload: () => void reloads++, showAfterMs: 10, reloadAfterMs: 50 });
  await wait(25);
  assert.ok(doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID));
  markAppMounted(doc, storage);
  assert.equal(doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID), null);
  await wait(60);
  assert.equal(reloads, 0);
}

// 4) main.tsx موصول: الحارس + شارة + عدم تعليق createRoot على استيراد CSS
{
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const main = readFileSync(resolve(root, "main.tsx"), "utf8");
  assert.match(main, /installMountWatchdog\(\)/);
  assert.match(main, /<MountBeacon \/>/);
  const raceIdx = main.indexOf("Promise.race([");
  assert.ok(raceIdx > 0 && raceIdx < main.indexOf("createRoot(rootEl)"), "مهلة على استيراد CSS قبل createRoot");
}
console.log("mount-watchdog: OK");
