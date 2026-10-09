/**
 * التسميع v2 — تنزيل النموذج: رابط قابل للتبديل مع بقاء SHA-256 مثبَّتًا، حالة التنزيل/الاستئناف، شاشة الموافقة، Wi-Fi فقط (Swift).
 * تشغيل: node --import tsx src/lib/__tests__/tasmee-v2-model-download.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function load(u,c,n){if(u.endsWith(".css"))return{format:"module",source:"export default {}",shortCircuit:true};return n(u,c)}`,
    ),
);
(globalThis as { React?: unknown }).React = React;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const {
  applyRemoteModelConfig,
  bundledTasmeeManifest: base,
  remoteModelConfigUrl,
  resolveTasmeeManifest,
  __resetTasmeeManifestCache,
} = await import("@/lib/tasmee/model-config");
const { modelReducer, initialModelState, modelPercent } = await import("@/features/tasmee-v2/useTasmeeModel");
const { TasmeeModelPanel } = await import("@/features/tasmee-v2/TasmeeModelSheet");
const { T } = await import("@/features/tasmee-v2/strings");

/* 1) الإعداد البعيد يبدّل الرابط فقط، للنموذج نفسه، وhttps فقط */
const alt = "https://cdn.example.org/m.zip";
const switched = applyRemoteModelConfig(base, { modelId: base.modelId, archiveUrl: alt });
assert.equal(switched.archive.url, alt);
assert.equal(switched.archive.sha256, base.archive.sha256, "SHA-256 يبقى من المثبَّت");
assert.equal(switched.archive.size, base.archive.size);
assert.deepEqual(switched.files, base.files);
for (const bad of [
  { modelId: "other-model", archiveUrl: alt },
  { modelId: base.modelId, archiveUrl: "http://insecure.example/m.zip" },
  { modelId: base.modelId, archiveUrl: "not a url" },
  null,
  "x",
]) {
  const r = applyRemoteModelConfig(base, bad);
  assert.equal(r.archive.url, base.archive.url, JSON.stringify(bad));
  assert.equal(r.archive.sha256, base.archive.sha256);
}
assert.equal(
  applyRemoteModelConfig(base, { modelId: base.modelId, archiveUrl: alt, sha256: "00", size: 1 }).archive.sha256,
  base.archive.sha256,
  "الإعداد البعيد لا يغيّر SHA-256 ولا الحجم",
);
assert.match(remoteModelConfigUrl(true, 1), /^https:\/\/[^/]+\/data\/tasmee-model\.json\?t=1$/);
assert.equal(remoteModelConfigUrl(false, 1), "/data/tasmee-model.json?t=1");

/* الملف المنشور يطابق المثبَّت (لا تبديل فعلي عند الإطلاق) */
const published = JSON.parse(readFileSync(resolve(root, "public/data/tasmee-model.json"), "utf8"));
assert.equal(applyRemoteModelConfig(base, published).archive.url, base.archive.url);
assert.equal(published.modelId, base.modelId);

/* فشل الشبكة → المثبَّت */
const realFetch = globalThis.fetch;
globalThis.fetch = (async () => {
  throw new Error("offline");
}) as typeof fetch;
__resetTasmeeManifestCache();
assert.equal((await resolveTasmeeManifest(true)).archive.url, base.archive.url);
globalThis.fetch = (async () =>
  new Response(JSON.stringify({ modelId: base.modelId, archiveUrl: alt }))) as typeof fetch;
__resetTasmeeManifestCache();
assert.equal((await resolveTasmeeManifest(true)).archive.url, alt);
globalThis.fetch = realFetch;

/* 2) حالة التنزيل والاستئناف */
const total = base.archive.size;
let s = initialModelState(true);
assert.equal(s.phase, "checking");
assert.equal(s.total, total, "الحجم معروف قبل أي فحص");
assert.equal(initialModelState(false).phase, "unsupported");
assert.equal(modelReducer(s, { type: "status", installed: false, bytesOnDisk: 0, total, downloading: false }).phase, "missing");
s = modelReducer(s, { type: "status", installed: false, bytesOnDisk: 40_000_000, total, downloading: false });
assert.equal(s.phase, "paused", "جزء منزَّل → استئناف");
s = modelReducer(s, { type: "start" });
s = modelReducer(s, { type: "progress", received: 75_000_000, total });
assert.equal(modelPercent(s), Math.floor((75_000_000 / total) * 100));
assert.equal(modelReducer(s, { type: "progress", received: 10, total }).received, 75_000_000, "التقدّم لا يتراجع");
assert.equal(modelReducer(s, { type: "failed", code: "cancelled" }).phase, "paused");
const wifi = modelReducer(s, { type: "failed", code: "wifi_required" });
assert.deepEqual([wifi.phase, wifi.error], ["error", "wifi"]);
assert.equal(modelReducer(s, { type: "failed" }).error, "other");
assert.equal(modelReducer(s, { type: "done" }).phase, "ready");
assert.equal(modelReducer(s, { type: "status", installed: true, bytesOnDisk: total, total, downloading: false }).phase, "ready");

/* 3) شاشة الموافقة: الحجم وWi-Fi والخصوصية قبل التنزيل؛ تقدّم بـARIA أثناءه */
const noop = () => {};
const render = (st: ReturnType<typeof initialModelState>) =>
  renderToStaticMarkup(createElement(TasmeeModelPanel, { state: st, onClose: noop, onDownload: noop, onCancel: noop, onStart: noop }));
const mb = String(Math.round(total / 1_000_000));
const missing = render({ phase: "missing", received: 0, total, error: null });
assert.match(missing, /dir="rtl"/);
for (const t of [T.model.missing, T.model.wifi, T.model.privacy, T.model.consent, T.model.later, T.model.size]) assert.ok(missing.includes(t), t);
assert.ok(missing.includes(`>${mb}</bdi>`), "الحجم بالميغابايت ظاهر");
assert.doesNotMatch(missing, /role="progressbar"/, "لا تقدّم قبل الموافقة");
const paused = render({ phase: "paused", received: 40_000_000, total, error: null });
assert.ok(paused.includes(T.model.resume) && paused.includes(T.model.pausedHint));
const busy = render({ phase: "downloading", received: 75_000_000, total, error: null });
assert.match(busy, /role="progressbar"[^>]*aria-valuenow="50"/);
assert.ok(busy.includes(T.model.cancel) && !busy.includes(T.model.consent));
assert.ok(render({ phase: "error", received: 0, total, error: "wifi" }).includes(T.model.wifiRequired));
assert.ok(render({ phase: "ready", received: total, total, error: null }).includes(T.model.start));

/* 4) Swift: جلسة Wi-Fi فقط وخطأ مخصّص بلا إعادة على الخلوي */
const store = readFileSync(resolve(root, "ios/App/App/Tasmee/TasmeeModelStore.swift"), "utf8");
for (const k of ["allowsCellularAccess = false", "allowsExpensiveNetworkAccess = false", "allowsConstrainedNetworkAccess = false"]) {
  assert.ok(store.includes(k), k);
}
assert.doesNotMatch(store, /URLSession\.shared/, "لا تنزيل عبر الجلسة العامة");
assert.match(store, /networkUnavailableReason != nil[\s\S]{0,80}wifiRequired/);
assert.match(store, /catch TasmeeModelError\.wifiRequired \{\s*throw TasmeeModelError\.wifiRequired/);
const plugin = readFileSync(resolve(root, "ios/App/App/Tasmee/TasmeeEnginePlugin.swift"), "utf8");
assert.match(plugin, /"wifi_required"/);

console.log("tasmee-v2-model-download: ok");
