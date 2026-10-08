/**
 * فلتر الكلمات الوهمية على ضوضاء ثابتة حقيقية (وردية، مكيّف، شارع، نقرات): صفر كلمات مكشوفة
 * حتى لو كانت الكلمة المكررة هي التالية المتوقعة. المدخل: نصوص التفريغ الجزئي الفعلية (بلا صوت).
 * تشغيل: node --import tsx src/lib/__tests__/tasmee-hallucination.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HallucinationGuard, HALLUCINATION_REPEAT_LIMIT } from "../tasmee/hallucination-guard.ts";
import { TasmeeMatcher } from "../tasmee/matcher.ts";
import { TasmeeSession } from "../tasmee/session.ts";
import type { TasmeeEngineApi, TasmeePartialEvent } from "../tasmee/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(readFileSync(resolve(here, "fixtures/tasmee-noise-partials.json"), "utf8")) as { noise: Record<string, Array<[number, string]>> };

function fakeEngine() {
  let cb: ((p: TasmeePartialEvent) => void) | null = null;
  const engine: TasmeeEngineApi = {
    start: async () => {},
    setPrompt: async () => {},
    stop: async () => ({ durationSec: 0, decodes: 0, decodeMeanMs: 0, decodeP95Ms: 0, decodeMaxMs: 0, cpuMeanPercent: 0, cpuPeakPercent: 0, thermalStart: "nominal", thermalEnd: "nominal", thermalMax: "nominal", thermalTrace: [], batteryStart: -1, batteryEnd: -1, batteryState: "unknown", vadSkippedTicks: 0, speechWithoutTextWindows: 0, unclearHintsAtSec: [], deviceModel: "", osVersion: "" }),
    alignSession: async () => ({ words: [] }),
    releaseSessionAudio: async () => {},
    onPartial: (c) => { cb = c; return () => { cb = null; }; },
    onInterruption: () => () => {},
    onThermal: () => () => {},
    onFailure: () => () => {},
    onUnclear: () => () => {},
  };
  return { engine, emit: (p: TasmeePartialEvent) => cb?.(p) };
}

let seq = 0;
const partial = (finishedAtMs: number, text: string): TasmeePartialEvent => ({ seq: ++seq, text, windowStartMs: 0, windowEndMs: finishedAtMs, computeMs: 300, finishedAtMs });

// الكلمة الوهمية المكررة على الضجيج الثابت هي نفسها الكلمة التالية المتوقعة (أسوأ حالة)
const repeated = fixture.noise["pink_loud_-22dB"]![0]![1].trim();
assert.equal(new Set(fixture.noise["pink_loud_-22dB"]!.map(([, t]) => t.trim())).size, 1, "ضجيج وردي: خرج واحد حرفيًا في كل النوافذ");
const ref = [repeated, "تبارك", "الذي", "بيده"].map((text, i) => ({ id: `1:1:${i + 1}`, text }));

console.log("=== بدون الفلتر: الخرج المكرر يكشف الكلمة (يثبت حساسية الاختبار) ===");
{
  const m = new TasmeeMatcher(ref);
  let revealed = 0;
  for (const [t, text] of fixture.noise["pink_loud_-22dB"]!) revealed += m.ingest(text, t).length;
  assert.ok(revealed >= 1, "بلا فلتر يُكشف خطأً");
}

console.log("=== مع الفلتر: صفر كلمات مكشوفة على كل تسجيلات الضجيج ===");
for (const [name, rows] of Object.entries(fixture.noise)) {
  const { engine, emit } = fakeEngine();
  const session = new TasmeeSession(engine, ref);
  const revealed: string[] = [];
  session.onWord((e) => revealed.push(`${e.index}:${e.state}`));
  await session.start();
  for (const [t, text] of rows) emit(partial(t, text));
  const report = await session.stop();
  assert.deepEqual(revealed, [], `${name}: لا كشف`);
  assert.equal(report.correct, 0, `${name}: صفر كلمات صحيحة`);
}

console.log("=== الحارس: القاعدة ===");
{
  assert.equal(HALLUCINATION_REPEAT_LIMIT, 3);
  const g = new HallucinationGuard();
  assert.equal(g.decide("وَالْمُؤْمِنِينَ", 0), "warmup", "أول نافذة لا تُستعمل");
  assert.equal(g.decide("وَالْمُؤْمِنِينَ", 500), "repeat");
  assert.equal(g.decide("وَالْمُؤْمِنِينَ", 1000), "hallucination", "الثالثة المتطابقة وهم");
  assert.equal(g.decide("وَالْمُؤْمِنِينَ", 1500), "hallucination");
  assert.equal(g.decide("وَالْمُؤْمِنِينَ تبارك", 2000), "use", "تغيّر النص → يُستعمل من جديد");
  // تلاوة حقيقية: نصوص متنامية كلها تُستعمل بعد النافذة الأولى
  const g2 = new HallucinationGuard();
  const seqs = ["تبارك", "تبارك الذي", "تبارك الذي بيده", "تبارك الذي بيده الملك"];
  assert.deepEqual(seqs.map((t, i) => g2.decide(t, i * 500)), ["warmup", "use", "use", "use"]);
  // صمت طويل يبدأ حلقة جديدة (تُحفظ أول نافذة ولا تُستعمل)
  assert.equal(g2.decide("الذي", 60_000), "warmup");
}

console.log("=== تلاوة حقيقية لا تتأثر: الكلمات الأولى تُكشف عند النافذة الثانية ===");
{
  const { engine, emit } = fakeEngine();
  const real = [{ id: "a:1:1", text: "تَبَٰرَكَ" }, { id: "a:1:2", text: "ٱلَّذِى" }, { id: "a:1:3", text: "بِيَدِهِ" }];
  const session = new TasmeeSession(engine, real);
  const at: Record<number, number> = {};
  session.onWord((e) => { at[e.index] = e.timeMs; });
  await session.start();
  ["تبارك", "تبارك الذي", "تبارك الذي بيده"].forEach((text, i) => emit(partial(1000 + i * 500, text)));
  await session.stop();
  assert.deepEqual(Object.keys(at).map(Number), [0, 1, 2]);
  assert.equal(at[0], 1500, "الكلمة الأولى عند النافذة الثانية (تحمّل نبضة واحدة فقط لأول كلمة)");
}

console.log("tasmee-hallucination.test.ts: ok");
