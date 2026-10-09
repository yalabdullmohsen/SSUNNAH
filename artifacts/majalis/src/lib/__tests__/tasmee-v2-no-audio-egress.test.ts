/**
 * التسميع 1.1.0 على الجهاز فقط: يفشل إن خرج أي طلب شبكة أثناء التسميع، أو إن استُورد مسار Groq في الحزمة.
 * node --import tsx src/lib/__tests__/tasmee-v2-no-audio-egress.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FallbackChain, OnDeviceProvider } from "../tasmee-v2/engine/asr-providers.ts";
import { GroqWindowProvider } from "../tasmee-v2/engine/asr-provider-groq.ts";
import { SpeechWindower, type AudioWindow } from "../tasmee-v2/engine/vad.ts";
import { isTasmeeCloudAsrEnabled } from "../tasmee-v2/flags.ts";

const src = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "__tests__") walk(p, out); }
    else if (/\.(tsx?|mjs|js)$/.test(e.name)) out.push(p);
  }
  return out;
};
const files = walk(src).map((p) => ({ rel: relative(src, p), text: readFileSync(p, "utf8") }));

// 1) العلم مغلق ثابتًا
assert.equal(isTasmeeCloudAsrEnabled(), false, "tasmee_cloud_asr مغلق في 1.1.0");

// 2) لا كود في الحزمة يستورد مسار Groq للتسميع ولا مسار «اختبار التلاوة» القديم
const groqModule = "lib/tasmee-v2/engine/asr-provider-groq.ts";
for (const f of files) {
  if (f.rel === groqModule) continue;
  assert.doesNotMatch(f.text, /(from|import)\s*\(?\s*["'][^"']*asr-provider-groq/, `${f.rel} يستورد مسار Groq الخامل`);
  assert.doesNotMatch(f.text, /from ["'][^"']*recitation-test\/(api|consent)["']/, `${f.rel} يستورد مسار اختبار التلاوة السحابي`);
}

// 3) لا واجهة شبكة في كود التسميع v2 (المحرك والطبقة) خارج وحدة Groq الخاملة
const netApi = /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|recitation-transcribe/;
const tasmeeFiles = files.filter((f) => /^(lib\/tasmee-v2|features\/tasmee-v2)\//.test(f.rel) && f.rel !== groqModule);
assert.ok(tasmeeFiles.length >= 5, "وُجدت ملفات التسميع v2");
for (const f of tasmeeFiles) assert.doesNotMatch(f.text, netApi, `${f.rel} يستعمل واجهة شبكة`);

// 4) سلوكيًا: جلسة كاملة (VAD → نوافذ → سلسلة المزوّدين) مع Groq «موافَق عليه» — صفر طلبات
type Req = { kind: string; body: string };
const requests: Req[] = [];
const g = globalThis as Record<string, unknown>;
const saved = { fetch: g.fetch, XMLHttpRequest: g.XMLHttpRequest, WebSocket: g.WebSocket, navigator: g.navigator };
const bodyOf = (b: unknown) => (typeof b === "string" ? b : b == null ? "" : `[${Object.prototype.toString.call(b)}]`);
g.fetch = (async (_u: unknown, init?: RequestInit) => {
  requests.push({ kind: "fetch", body: bodyOf(init?.body) });
  return new Response(JSON.stringify({ ok: true, configured: true, transcript: "تبارك" }));
}) as typeof fetch;
g.XMLHttpRequest = class { open() {} setRequestHeader() {} send(b?: unknown) { requests.push({ kind: "xhr", body: bodyOf(b) }); } };
g.WebSocket = class { constructor() { requests.push({ kind: "ws", body: "" }); } send(b?: unknown) { requests.push({ kind: "ws", body: bodyOf(b) }); } };
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { sendBeacon: (_u: string, b?: unknown) => (requests.push({ kind: "beacon", body: bodyOf(b) }), true) } });

try {
  const sr = 16_000;
  const pcm = new Float32Array(sr * 6);
  for (let i = sr; i < sr * 5; i++) pcm[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / sr);
  const windower = new SpeechWindower();
  const windows: AudioWindow[] = [];
  for (let i = 0; i < pcm.length; i += 1600) windows.push(...windower.push(pcm.subarray(i, i + 1600)));
  windows.push(...windower.flush());
  assert.ok(windows.length >= 1, "خرجت نوافذ كلام من الجلسة");

  for (const deviceReady of [true, false]) {
    let decoded = 0;
    const device = new OnDeviceProvider(() => deviceReady, async () => (decoded++, "تبارك الذي"));
    // Groq بموافقة المستخدم وبلا حقن للعلم: العلم المغلق وحده يجب أن يمنعه
    const groq = new GroqWindowProvider({ hasConsent: () => true });
    const chain = new FallbackChain([device, groq], () => true);
    for (const w of windows) await chain.transcribe(w);
    if (deviceReady) assert.equal(decoded, windows.length, "كل النوافذ فُرّغت على الجهاز");
    else assert.equal(await chain.pick(), null, "بلا نموذج على الجهاز: لا مزوّد (رسالة تنزيل لا إرسال)");
  }
  const audio = requests.filter((r) => /audioBase64|RIFF|audio\/|\[object (Blob|ArrayBuffer|Uint8Array|FormData|Float32Array)\]/.test(r.body));
  assert.equal(audio.length, 0, `طلب شبكة يحمل صوتًا أثناء التسميع: ${JSON.stringify(audio).slice(0, 200)}`);
  assert.equal(requests.length, 0, `طلبات شبكة أثناء التسميع: ${requests.map((r) => r.kind).join(",")}`);
} finally {
  g.fetch = saved.fetch;
  g.XMLHttpRequest = saved.XMLHttpRequest;
  g.WebSocket = saved.WebSocket;
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: saved.navigator });
}

console.log(`tasmee-v2-no-audio-egress: ok (${tasmeeFiles.length} ملفًا بلا شبكة، 0 طلبات)`);
