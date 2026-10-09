/**
 * محرك التسميع v2: VAD والنوافذ، المزوّدون، والمحاذاة المقيَّدة على خمسة سيناريوهات بتعرّف محاكى
 * (صحيحة، ناقصة، مبدّلة، تكرار، تعثّر) + هلوسة وضجيج — مع قياس الإنذارات الكاذبة والكشف والزمن.
 * node --import tsx src/lib/__tests__/tasmee-v2-engine.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { formatTable, runBenchCase, summarize, TARGETS, type BenchCase } from "../tasmee-v2/engine/tracker-bench.ts";
import { RecitationTracker } from "../tasmee-v2/engine/recitation-tracker.ts";
import { AppleSpeechProvider, encodeWav, FallbackChain, OnDeviceProvider } from "../tasmee-v2/engine/asr-providers.ts";
import { GroqWindowProvider } from "../tasmee-v2/engine/asr-provider-groq.ts";
import type { SpokenWord } from "../tasmee-v2/engine/asr-simulate.ts";
import { SpeechWindower } from "../tasmee-v2/engine/vad.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const page = JSON.parse(readFileSync(resolve(root, "public/data/quran-v2/pages/page-562.json"), "utf8")) as Array<{
  verse_key: string;
  verse_number: number;
  words: Array<{ char_type_name: string; position: number; text_uthmani: string; page_number: number; line_number: number }>;
}>;
const ref = page
  .filter((v) => v.verse_key.startsWith("67:") && v.verse_number <= 2)
  .flatMap((v) =>
    v.words.filter((w) => w.char_type_name === "word").map((w) => ({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani })),
  );
const plain = "تبارك الذي بيده الملك وهو على كل شيء قدير الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور".split(" ");
assert.equal(ref.length, plain.length);
const said = (idx: number[]): SpokenWord[] => idx.map((i) => ({ text: plain[i]!, ref: i }));
const all = plain.map((_, i) => i);

console.log("=== VAD والنوافذ (1–3ث، لا حفظ بعد الصمت) ===");
{
  const sr = 16_000;
  const tone = (ms: number, amp: number) => Float32Array.from({ length: (sr * ms) / 1000 }, (_, i) => amp * Math.sin((2 * Math.PI * 220 * i) / sr));
  const w = new SpeechWindower();
  const wins = [...w.push(tone(500, 0.001)), ...w.push(tone(4000, 0.3)), ...w.push(tone(800, 0.001)), ...w.push(tone(100, 0.3)), ...w.push(tone(800, 0.001))];
  assert.ok(wins.length >= 6, `نوافذ أثناء الكلام: ${wins.length}`);
  for (const x of wins) {
    const ms = (x.pcm.length * 1000) / x.sampleRate;
    assert.ok(ms >= 1000 && ms <= 3000, `طول النافذة ${ms}`);
  }
  assert.equal(wins.filter((x) => x.final).length, 1, "نافذة نهائية واحدة عند الصمت؛ النقرة القصيرة تُهمل");
  assert.ok(wins[0]!.startMs >= 300, "الصمت قبل الكلام لا يُرسل");
  assert.deepEqual(w.flush(), [], "لا شيء متبقٍ بعد الصمت");
}

console.log("=== المزوّدون: موافقة، احتياط، Apple غير متاح ===");
{
  const wav = encodeWav(new Float32Array(16_000), 16_000);
  assert.equal(new TextDecoder().decode(wav.subarray(0, 4)), "RIFF");
  assert.equal(wav.length, 44 + 32_000);
  let calls = 0;
  const fetchImpl = (async () => {
    calls++;
    return new Response(JSON.stringify({ ok: true, configured: true, transcript: "تبارك" }));
  }) as typeof fetch;
  const noConsent = new GroqWindowProvider({ hasConsent: () => false, cloudEnabled: () => true, fetchImpl });
  assert.equal(await noConsent.isAvailable(), false);
  await assert.rejects(noConsent.transcribe({ pcm: new Float32Array(16_000), sampleRate: 16_000, startMs: 0, endMs: 1000, final: true }));
  assert.equal(calls, 0, "لا يغادر صوت دون موافقة");
  const groq = new GroqWindowProvider({ hasConsent: () => true, cloudEnabled: () => true, fetchImpl });
  const apple = new AppleSpeechProvider();
  assert.equal(await apple.isAvailable(), false);
  const device = new OnDeviceProvider(() => false, async () => "");
  let online = false;
  const chain = new FallbackChain([device, apple, groq], () => online);
  assert.equal(await chain.pick(), null, "بلا شبكة ولا نموذج على الجهاز: لا مزوّد (لا تسميع مكسور)");
  online = true;
  assert.equal((await chain.pick())?.id, "groq");
  const win = { pcm: new Float32Array(16_000), sampleRate: 16_000, startMs: 0, endMs: 1000, final: true };
  assert.equal((await chain.transcribe(win))?.text, "تبارك");
}

console.log("=== السيناريوهات الخمسة (تعرّف محاكى نظيف) ===");
const cases: BenchCase[] = [
  { name: "صحيحة", ref, spoken: said(all), expectedErrors: [] },
  { name: "ناقصة (والحياة)", ref, spoken: said(all.filter((i) => i !== 12)), expectedErrors: [12] },
  {
    name: "مبدّلة (عملا→قولا)",
    ref,
    spoken: all.map((i) => (i === 16 ? { text: "قولا" } : { text: plain[i]!, ref: i })),
    expectedErrors: [16],
  },
  { name: "تكرار (بيده الملك ×2)", ref, spoken: [...said([0, 1, 2, 3]), { text: "بيده" }, { text: "الملك" }, ...said(all.slice(4))], expectedErrors: [] },
  {
    name: "تعثّر (ليب… ليبلوكم)",
    ref,
    spoken: [...said(all.slice(0, 13)), { text: "ليب", pauseAfterMs: 400 }, ...said(all.slice(13))],
    expectedErrors: [],
  },
];
const clean = cases.map((c) => runBenchCase(c));
console.log(formatTable(clean));
for (const r of clean) {
  assert.deepEqual(r.falseAlarms, [], `${r.name}: لا إنذار كاذب`);
  assert.deepEqual(r.missed, [], `${r.name}: كُشف الخطأ`);
}
const s = summarize(clean);
assert.ok(s.pass.all, `المعيار على المحاكاة النظيفة: ${JSON.stringify(s)}`);

console.log("=== الكلمة المكشوفة لا تُكشف قبل نطقها، والخطأ لا يظهر قبل تأكيده ===");
{
  const t = new RecitationTracker(ref);
  const ev = t.ingest("تبارك الذي", 1000);
  assert.deepEqual(
    ev.map((e) => [e.kind, e.index]),
    [
      ["correct", 0],
      ["correct", 1],
    ],
  );
  const ev2 = t.ingest("تبارك الذي الملك", 1500);
  assert.ok(!ev2.some((e) => e.kind === "error"), "التجاوز مشتبه فقط");
  assert.deepEqual(t.pending, [2]);
  const ev3 = t.ingest("الذي بيده الملك وهو", 2000);
  assert.ok(ev3.some((e) => e.kind === "correct" && e.index === 2 && e.recovered), "سُمعت لاحقًا فسُحب الاشتباه");
}

console.log("=== نافذة 3ث تحوي كلمات أكثر من مدى النظر ===");
{
  const t = new RecitationTracker(ref);
  t.ingest(plain.slice(0, 7).join(" "), 3000);
  t.ingest(plain.slice(7, 14).join(" "), 6000);
  t.ingest(plain.slice(14).join(" "), 9000);
  const errs = t.finish(9100).filter((e) => e.kind === "error");
  assert.deepEqual(errs, [], "تُستهلك النافذة كلها دون تجاوز كاذب");
  assert.equal(t.next, ref.length);
}

console.log("=== هلوسة وضجيج (بذور متعددة) ===");
{
  const noisy = [1, 2, 3, 4, 5].flatMap((seed) =>
    cases.map((c) => runBenchCase({ ...c, name: `${c.name} #${seed}` }, { seed, dropRate: 0.08, corruptRate: 0.05, hallucinationRate: 0.15 })),
  );
  const ns = summarize(noisy);
  console.log(
    `ضجيج: إنذار كاذب ${(ns.falseAlarmRate * 100).toFixed(1)}% · كشف ${(ns.detectionRate * 100).toFixed(1)}% · p95 ${ns.latencyP95Ms}ms`,
  );
  assert.ok(ns.falseAlarmRate <= TARGETS.maxFalseAlarmRate, `إنذارات كاذبة تحت الضجيج ${ns.falseAlarmRate}`);
  assert.ok(ns.detectionRate >= TARGETS.minDetectionRate, `كشف تحت الضجيج ${ns.detectionRate}`);
  assert.ok(ns.latencyP95Ms <= TARGETS.maxLatencyP95Ms, `زمن تحت الضجيج ${ns.latencyP95Ms}`);
}

console.log("tasmee-v2-engine ✅");
