/**
 * أداة قياس التسميع v2: الإنذارات الكاذبة، كشف الأخطاء، وزمن الكشف — على المحاكاة الآن وعلى الصوت الحقيقي
 * (نصوص نوافذ مسجّلة) لاحقًا بالمقاييس نفسها. معيار الشحن في TARGETS.
 */
import type { TasmeeRefWord } from "../../tasmee/matcher";
import { percentile } from "../../tasmee/session";
import { RecitationTracker, type TrackerEvent, type TrackerParams } from "./recitation-tracker";
import { simulateStreamingAsr, type SimOptions, type SimWindow, type SpokenWord, type TimedWord } from "./asr-simulate";

export const TARGETS = { maxFalseAlarmRate: 0.02, minDetectionRate: 0.95, maxLatencyP95Ms: 1000 } as const;

export type BenchCase = {
  name: string;
  ref: readonly TasmeeRefWord[];
  spoken: readonly SpokenWord[];
  /** فهارس الكلمات المرجعية التي فيها خطأ متعمَّد (ناقصة/مبدّلة) */
  expectedErrors: readonly number[];
  /** آخر فهرس مرجعي يغطيه المقطع (الافتراضي: آخر كلمة) */
  throughIndex?: number;
};

export type BenchResult = {
  name: string;
  /** كلمات صحيحة التلاوة قُيِّمت */
  correctWords: number;
  falseAlarms: number[];
  expected: number;
  detected: number[];
  missed: number[];
  latenciesMs: number[];
  events: TrackerEvent[];
};

/** يشغّل حالة على نوافذ جاهزة (محاكاة أو نصوص تعرّف حقيقية) ويقيس. */
export function scoreWindows(
  c: BenchCase,
  windows: readonly SimWindow[],
  timed: readonly Pick<TimedWord, "ref" | "endMs">[],
  params: Partial<TrackerParams> = {},
): BenchResult {
  const tracker = new RecitationTracker(c.ref, params);
  const events: TrackerEvent[] = [];
  for (const w of windows) events.push(...tracker.ingest(w.text, w.timeMs));
  const through = c.throughIndex ?? c.ref.length - 1;
  const endAt = (windows[windows.length - 1]?.timeMs ?? 0) + 1;
  events.push(...tracker.finish(endAt, through));

  const expected = new Set(c.expectedErrors);
  const endOf = new Map<number, number>();
  for (const w of timed) if (w.ref !== undefined && !endOf.has(w.ref)) endOf.set(w.ref, w.endMs);
  const falseAlarms: number[] = [];
  const detected: number[] = [];
  const latenciesMs: number[] = [];
  for (const [i, e] of tracker.decided) {
    if (i > through) continue;
    if (e.kind === "error") (expected.has(i) ? detected : falseAlarms).push(i);
    else if (!expected.has(i) && endOf.has(i)) latenciesMs.push(Math.max(0, e.timeMs - endOf.get(i)!));
  }
  return {
    name: c.name,
    correctWords: through + 1 - expected.size,
    falseAlarms: falseAlarms.sort((a, b) => a - b),
    expected: expected.size,
    detected: detected.sort((a, b) => a - b),
    missed: [...expected].filter((i) => !detected.includes(i)),
    latenciesMs,
    events,
  };
}

export function runBenchCase(c: BenchCase, sim: Partial<SimOptions> = {}, params: Partial<TrackerParams> = {}): BenchResult {
  const { windows, timed } = simulateStreamingAsr(c.spoken, sim);
  return scoreWindows(c, windows, timed, params);
}

export type BenchSummary = {
  cases: number;
  falseAlarmRate: number;
  detectionRate: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  pass: { falseAlarms: boolean; detection: boolean; latency: boolean; all: boolean };
};

export function summarize(results: readonly BenchResult[]): BenchSummary {
  const words = results.reduce((s, r) => s + r.correctWords, 0);
  const fa = results.reduce((s, r) => s + r.falseAlarms.length, 0);
  const exp = results.reduce((s, r) => s + r.expected, 0);
  const det = results.reduce((s, r) => s + r.detected.length, 0);
  const lat = results.flatMap((r) => r.latenciesMs).sort((a, b) => a - b);
  const falseAlarmRate = words ? fa / words : 0;
  const detectionRate = exp ? det / exp : 1;
  const latencyP50Ms = percentile(lat, 0.5);
  const latencyP95Ms = percentile(lat, 0.95);
  const pass = {
    falseAlarms: falseAlarmRate <= TARGETS.maxFalseAlarmRate,
    detection: detectionRate >= TARGETS.minDetectionRate,
    latency: latencyP95Ms <= TARGETS.maxLatencyP95Ms,
    all: false,
  };
  pass.all = pass.falseAlarms && pass.detection && pass.latency;
  return { cases: results.length, falseAlarmRate, detectionRate, latencyP50Ms, latencyP95Ms, pass };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/** جدول Markdown بالنتائج لكل حالة + الإجمالي مقابل المعيار. */
export function formatTable(results: readonly BenchResult[], s = summarize(results)): string {
  const rows = results.map(
    (r) =>
      `| ${r.name} | ${r.correctWords} | ${r.falseAlarms.length} | ${r.detected.length}/${r.expected} | ${percentile([...r.latenciesMs].sort((a, b) => a - b), 0.95) || "—"} |`,
  );
  return [
    "| الحالة | كلمات صحيحة | إنذار كاذب | كشف | p95 (ms) |",
    "|---|---|---|---|---|",
    ...rows,
    `| **الإجمالي** | | ${pct(s.falseAlarmRate)} ${s.pass.falseAlarms ? "✅" : "❌"} | ${pct(s.detectionRate)} ${s.pass.detection ? "✅" : "❌"} | p50 ${s.latencyP50Ms} / p95 ${s.latencyP95Ms} ${s.pass.latency ? "✅" : "❌"} |`,
  ].join("\n");
}
