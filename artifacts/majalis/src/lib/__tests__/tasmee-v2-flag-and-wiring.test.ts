/**
 * علم tasmee_v2 الحي وربط المحرك بالطبقة: سياسة القناة، تطبيق أحداث المتتبّع، وملخص القياس.
 * node --import tsx src/lib/__tests__/tasmee-v2-flag-and-wiring.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decideTasmeeV2, TASMEE_FLAGS_REMOTE_PATH } from "../tasmee-v2/flags";
import { fetchLiveJson } from "../live-config/fetch-live-json";
import { RecitationTracker } from "../tasmee-v2/engine/recitation-tracker";
import { applyTrackerEvents, emptyLiveStats } from "../../features/tasmee-v2/useTasmeeEngine";
import { summarizeLiveStats } from "../../features/tasmee-v2/TasmeeDiagSheet";
import type { WordMark } from "../tasmee-v2/session-state";

const root = resolve(import.meta.dirname, "../../..");

// App Store: مغلق إلا بفتح صريح؛ تعذّر الجلب (null) يبقيه مغلقًا
assert.equal(decideTasmeeV2("appstore", null), false);
assert.equal(decideTasmeeV2("appstore", { appStore: "true" }), false);
assert.equal(decideTasmeeV2("appstore", { appStore: true }), true);
// TestFlight/Debug: مفعّل، والملف يغلقه فقط
assert.equal(decideTasmeeV2("testflight", null), true);
assert.equal(decideTasmeeV2("testflight", { testflight: false }), false);
assert.equal(decideTasmeeV2("debug", { testflight: false }), false);
assert.equal(decideTasmeeV2("web", { appStore: false }), true);

// الملف المنشور: App Store مغلق حتى اجتياز معايير الجهاز الحقيقي
const live = JSON.parse(readFileSync(resolve(root, "public/data/tasmee-flags.json"), "utf8"));
assert.equal(decideTasmeeV2("appstore", live), false, "لا فتح لـApp Store قبل القياس على جهاز حقيقي");
assert.equal(decideTasmeeV2("testflight", live), true);

// getBuildChannel متاح في كل البناءات (العلم يُقرَّر وقت التشغيل)
const plugin = readFileSync(resolve(root, "ios/App/App/Tasmee/TasmeeEnginePlugin.swift"), "utf8");
const gated = plugin.slice(plugin.indexOf("#if TASMEE_DIAGNOSTICS"), plugin.indexOf("#endif"));
assert.ok(plugin.includes('name: "getBuildChannel"') && !gated.includes("getBuildChannel"));

// أحداث المتتبّع تُطبَّق على الصفحة بإزاحة المؤشر
const ref = ["قل", "هو", "الله", "أحد"].map((text, i) => ({ id: String(i), text }));
const tracker = new RecitationTracker(ref.slice(1));
const marks: [number, WordMark][] = [];
let stats = applyTrackerEvents(tracker.ingest("هو الله أحد", 1200), 1, 400, emptyLiveStats(), (i, m) => marks.push([i, m]));
assert.deepEqual(marks, [[1, "ok"], [2, "ok"], [3, "ok"]]);
assert.equal(stats.correct, 3);
assert.deepEqual(stats.latenciesMs, [400, 400, 400]);

stats = applyTrackerEvents(
  [{ kind: "error", index: 0, id: "x", state: "wrong", timeMs: 1 }],
  5,
  null,
  stats,
  (i, m) => marks.push([i, m]),
);
assert.deepEqual(marks.at(-1), [5, "wrong"]);
assert.equal(stats.alerts, 1);

const sum = summarizeLiveStats({ windows: 4, correct: 99, alerts: 1, latenciesMs: [100, 200, 300, 400, 1600] });
assert.equal(sum.medianMs, 300);
assert.equal(sum.p95Ms, 1600);
assert.equal(sum.alertRate, 1);

/* خصوصية: جلب tasmee-flags.json طلب GET لملف إعداد فقط — لا جسم ولا ترويسات ولا معرّفات مستخدم في الرابط */
{
  const calls: [string, RequestInit | undefined][] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push([String(url), init]);
    return new Response(JSON.stringify({ tasmee_v2: { testflight: true } }), { status: 200 });
  }) as typeof fetch;
  try {
    await fetchLiveJson(TASMEE_FLAGS_REMOTE_PATH, true, 1000);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(calls.length, 1);
  const [url, init] = calls[0]!;
  assert.match(url, /^https:\/\/[^/?#]+\/data\/tasmee-flags\.json\?t=\d+$/, url);
  assert.ok(!init?.method || init.method === "GET");
  assert.equal(init?.body, undefined);
  assert.equal(init?.headers, undefined);
  assert.equal(init?.credentials, undefined);
}

console.log("tasmee-v2-flag-and-wiring: ok");
