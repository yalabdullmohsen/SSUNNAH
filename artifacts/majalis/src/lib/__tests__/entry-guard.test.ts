/**
 * حارس فشل سكربت الدخول (index.html): إعادة تحميل واحدة بلا حلقة، ثم شاشة «تعذّر التحميل».
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const body = html.match(/<script id="mj-entry-guard">([\s\S]*?)<\/script>/)?.[1];
assert.ok(body, "سكربت mj-entry-guard موجود");
assert.ok(html.indexOf("mj-entry-guard") < html.indexOf('src="/src/main.tsx"'), "قبل سكربت الدخول");

function run(store: Map<string, string> | null) {
  let handler: ((ev: unknown) => void) | undefined;
  const reloads: number[] = [];
  const appended: Array<{ id?: string; children: Array<{ textContent?: string }> }> = [];
  const mk = (tag: string) => ({ tag, style: {} as Record<string, string>, children: [] as unknown[], id: "", textContent: "",
    setAttribute() {}, appendChild(c: unknown) { this.children.push(c); } });
  const win = {
    addEventListener: (_: string, fn: (ev: unknown) => void, cap: boolean) => { assert.equal(cap, true); handler = fn; },
  };
  const ctx = {
    window: win,
    document: { getElementById: () => null, createElement: mk, documentElement: { appendChild: (e: never) => appended.push(e) } },
    sessionStorage: store ? { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) } : { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } },
    location: { href: "https://x/lessons", reload: () => reloads.push(1) },
    fetch: () => Promise.resolve(),
    Date, Number,
  };
  vm.runInNewContext(body!, ctx);
  const fail = (src = "https://x/assets/index-abc.js", tagName = "SCRIPT") => handler!({ target: { tagName, src, type: "module" } });
  return { fail, reloads, appended };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const store = new Map<string, string>();
const a = run(store);
a.fail("https://x/assets/foo.js", "LINK");
a.fail("https://x/other.js");
assert.equal(a.reloads.length, 0, "غير السكربت/غير assets لا يُعالَج");
a.fail();
await flush();
assert.equal(a.reloads.length, 1, "المحاولة الأولى: إعادة تحميل واحدة");
assert.equal(a.appended.length, 0);
const b = run(store); // صفحة جديدة بعد إعادة التحميل (التخزين يبقى)
b.fail();
await flush();
assert.equal(b.reloads.length, 0, "الثانية خلال الحدّ الزمني: لا إعادة تحميل");
assert.equal(b.appended.length, 1, "تُعرض شاشة الفشل");
assert.match(String((b.appended[0].children[0] as { textContent: string }).textContent), /تعذّر التحميل، أعد المحاولة/);
const c = run(null); // تخزين غير متاح ⇒ لا حلقة
c.fail();
await flush();
assert.equal(c.reloads.length, 0);
assert.equal(c.appended.length, 1);
console.log("entry-guard: OK");
