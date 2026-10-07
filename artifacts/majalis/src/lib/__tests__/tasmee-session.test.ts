/**
 * جلسة «تسميع» بمحرك وهمي: ربط النص الجزئي بالمطابِق، تحديث الـprompt، وتقرير التأخير (نهاية الكلمة → الكشف).
 * تشغيل: node --import tsx src/lib/__tests__/tasmee-session.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TASMEE_SCOPE_NOTE } from "../tasmee/copy.ts";
import { TASMEE_UNCLEAR_HINT, TasmeeSession } from "../tasmee/session.ts";
import type { TasmeeAlignedWord, TasmeeEngineApi, TasmeePartialEvent, TasmeeSessionDiagnostics } from "../tasmee/types.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const page = JSON.parse(readFileSync(resolve(root, "public/data/quran-v2/pages/page-562.json"), "utf8")) as Array<{
  verse_key: string;
  verse_number: number;
  words: Array<{ char_type_name: string; position: number; text_uthmani: string; page_number: number; line_number: number }>;
}>;
const ref = page
  .filter((v) => v.verse_key.startsWith("67:") && v.verse_number === 1)
  .flatMap((v) => v.words.filter((w) => w.char_type_name === "word").map((w) => ({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani })));
const spoken = "تبارك الذي بيده الملك وهو على كل شيء قدير".split(" ");
assert.equal(ref.length, spoken.length);

const diag: TasmeeSessionDiagnostics = {
  durationSec: 12, decodes: 20, decodeMeanMs: 300, decodeP95Ms: 450, decodeMaxMs: 600, cpuMeanPercent: 90, cpuPeakPercent: 140,
  thermalStart: "nominal", thermalEnd: "fair", thermalMax: "fair", thermalTrace: [], batteryStart: 0.8, batteryEnd: 0.79,
  batteryState: "unplugged", vadSkippedTicks: 2, speechWithoutTextWindows: 3, unclearHintsAtSec: [31.5], deviceModel: "iPhone14,5", osVersion: "17.5",
};

function fakeEngine(aligned: TasmeeAlignedWord[]) {
  let partialCb: ((p: TasmeePartialEvent) => void) | null = null;
  let unclearCb: ((e: { voicedSeconds: number }) => void) | null = null;
  const calls: string[] = [];
  const prompts: Array<string | null> = [];
  let startOpts: { prompt?: string; keepSessionAudio?: boolean } | null = null;
  const engine: TasmeeEngineApi = {
    start: async (o) => { startOpts = o; calls.push("start"); },
    setPrompt: async (t) => { prompts.push(t); },
    stop: async () => { calls.push("stop"); return diag; },
    alignSession: async () => ({ words: aligned }),
    releaseSessionAudio: async () => { calls.push("release"); },
    onPartial: (cb) => { partialCb = cb; return () => { partialCb = null; }; },
    onInterruption: () => () => {},
    onThermal: () => () => {},
    onUnclear: (cb) => { unclearCb = cb; return () => { unclearCb = null; }; },
    onFailure: () => () => {},
  };
  return { engine, emitUnclear: (sec: number) => unclearCb?.({ voicedSeconds: sec }), emit: (p: TasmeePartialEvent) => partialCb?.(p), calls, prompts, startOpts: () => startOpts };
}

// الكلمة k تنتهي عند (k+1)*500ms؛ والتفريغ الجزئي يصل بعد نهايتها بـ ٢٠٠ms
const aligned = spoken.map((w, k) => ({ word: w, startMs: k * 500, endMs: (k + 1) * 500 - 50 }));
const { engine, emit, emitUnclear, calls, prompts, startOpts } = fakeEngine(aligned);
const session = new TasmeeSession(engine, ref, { promptWords: 5, measure: true });
const live: string[] = [];
const hints: string[] = [];
session.onHint((m) => hints.push(m));
session.onWord((e) => live.push(`${e.index}:${e.state}`));
await session.start();
assert.equal(startOpts()?.keepSessionAudio, true, "وضع القياس يحتفظ بالصوت في الذاكرة فقط");
assert.ok(startOpts()?.prompt && startOpts()!.prompt!.split(" ").length === 5, "prompt = الكلمات الخمس الأولى");

spoken.forEach((_, k) => {
  emit({ seq: k + 1, text: spoken.slice(0, k + 1).join(" "), windowStartMs: 0, windowEndMs: (k + 1) * 500, computeMs: 150, finishedAtMs: (k + 1) * 500 + 200 });
});
assert.equal(live.length, spoken.length, "كل كلمة كُشفت فور وصول نتيجتها الجزئية");
assert.equal(live[0], "0:correct");
assert.ok(prompts.length > 0 && prompts.at(-1) === null, "الـprompt يتحدّث مع تقدّم المؤشر ويفرغ عند النهاية");

// كلام بلا نص ≥ 4ث: تلميح هادئ واحد يصل للواجهة، ولا يتوقف التسميع (الكشف بعده يستمر)
emitUnclear(4.2);
assert.deepEqual(hints, [TASMEE_UNCLEAR_HINT]);
assert.equal(TASMEE_UNCLEAR_HINT, "لم يتضح الصوت، قرّب الهاتف أو قلّل الضوضاء");
const report = await session.stop();
assert.equal(report.unclearHints, 1);
assert.equal(report.diagnostics.speechWithoutTextWindows, 3, "عدّاد نوافذ «كلام بلا نص» يصل لتقرير القياس");
emitUnclear(5);
assert.equal(hints.length, 1, "بعد الإيقاف لا تلميحات");
assert.deepEqual(calls, ["start", "stop", "release"], "يُفرَّغ صوت القياس من الذاكرة بعد المحاذاة");
assert.equal(report.correct, spoken.length);
assert.equal(report.total, spoken.length);
assert.equal(report.detectionRate, 1);
assert.ok(report.latency && report.latency.samples === spoken.length);
assert.equal(Math.round(report.latency!.medianMs), 250, "٢٠٠ms بعد (نهاية-٥٠): كشف عند (k+1)*500+200 ونهاية (k+1)*500-50");
assert.equal(report.latency!.within1sPct, 100);
assert.equal(report.diagnostics.batteryStart, 0.8);
assert.equal(report.partials, spoken.length);
assert.equal(report.words[2]!.id.split(":").length, 3, "معرّف page:line:position");

// بلا وضع القياس: لا محاذاة ولا احتفاظ بصوت
{
  const f = fakeEngine(aligned);
  const s = new TasmeeSession(f.engine, ref, { promptWords: 0 });
  await s.start();
  assert.equal(f.startOpts()?.keepSessionAudio, false);
  assert.equal(f.startOpts()?.prompt, undefined, "بلا prompt عند promptWords=0");
  const r = await s.stop();
  assert.equal(r.latency, null);
  assert.deepEqual(f.calls, ["start", "stop"]);
}

// وصف النطاق: أخطاء الحفظ على مستوى الكلمة فقط، لا حركات ولا تجويد
assert.match(TASMEE_SCOPE_NOTE, /أخطاء الحفظ على مستوى الكلمة/);
assert.match(TASMEE_SCOPE_NOTE, /\(كلمة خاطئة أو ناقصة\)/);
assert.doesNotMatch(TASMEE_SCOPE_NOTE, /آية أخرى|انتقال/, "كشف الانتقال غير مبني بعد: لا يُذكر في الوصف");
assert.match(TASMEE_SCOPE_NOTE, /ولا يصحّح الحركات ولا أحكام التجويد/);

console.log("tasmee-session.test.ts: ok");
