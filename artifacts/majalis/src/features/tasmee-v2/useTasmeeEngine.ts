/**
 * ربط محرك الجهاز بطبقة التسميع: نوافذ التعرّف → RecitationTracker → علامات كلمات الصفحة.
 * لا صوت يُحفظ (keepSessionAudio=false)، ولا شيء يغادر الجهاز؛ إحصاءات الجلسة أرقام في الذاكرة فقط.
 */
import { useEffect, useRef, useState } from "react";
import { createTasmeeEngine, isTasmeeNativeAvailable, tasmeeNative } from "@/lib/tasmee/engine-plugin";
import type { TasmeeRefWord } from "@/lib/tasmee/matcher";
import { loadMushafPage } from "@/lib/quran-data/qpc-page-data";
import { resolveTasmeeManifest } from "@/lib/tasmee/model-config";
import { RecitationTracker, type TrackerEvent } from "@/lib/tasmee-v2/engine/recitation-tracker";
import type { WordMark } from "@/lib/tasmee-v2/session-state";

/** كلمات المتن بترتيب الصفحة — نفس ترتيب `.nm-word` (بلا علامات نهاية الآية) في القارئ. */
export async function loadPageRefWords(page: number): Promise<TasmeeRefWord[]> {
  const layout = await loadMushafPage(page);
  return layout.rows.flatMap((row) =>
    row.kind !== "line"
      ? []
      : row.words
          .filter((w) => w.charType !== "end")
          .map((w) => ({ id: `${layout.pageNumber}:${w.lineNumber}:${w.position}`, text: w.textUthmani })),
  );
}

/** أرقام الجلسة للوحة القياس: زمن كل كلمة صحيحة (نهاية النافذة → ظهورها) وعدد الإنذارات. */
export type TasmeeLiveStats = { windows: number; correct: number; alerts: number; latenciesMs: number[] };

export const emptyLiveStats = (): TasmeeLiveStats => ({ windows: 0, correct: 0, alerts: 0, latenciesMs: [] });

/** يطبّق أحداث المتتبّع (فهارس نسبية) على الصفحة ويحدّث الإحصاءات. صرفة للاختبار. */
export function applyTrackerEvents(
  events: readonly TrackerEvent[],
  offset: number,
  latencyMs: number | null,
  stats: TasmeeLiveStats,
  mark: (index: number, mark: WordMark) => void,
): TasmeeLiveStats {
  let { correct, alerts } = stats;
  const latenciesMs = [...stats.latenciesMs];
  for (const e of events) {
    if (e.kind === "correct") {
      correct += 1;
      if (latencyMs != null && !e.recovered) latenciesMs.push(latencyMs);
      mark(offset + e.index, "ok");
    } else {
      alerts += 1;
      mark(offset + e.index, e.state);
    }
  }
  return { ...stats, correct, alerts, latenciesMs };
}

let modelLoaded: Promise<unknown> | null = null;

type Options = {
  pageNumber: number;
  recording: boolean;
  /** النموذج منزَّل وجاهز */
  ready: boolean;
  /** فهرس الكلمة التالية عند بدء التسجيل: المتتبّع يبدأ منها */
  cursor: number;
  onMark: (index: number, mark: WordMark) => void;
  /** فشل/انقطاع: يوقف التسجيل في الطبقة */
  onStop: (reason: "failure" | "interruption") => void;
  /** اختبار التكامل على المحاكي: ملف في Documents بدل الميكروفون (Debug/TestFlight فقط) */
  feedFile?: string;
};

export function useTasmeeEngine({ pageNumber, recording, ready, cursor, onMark, onStop, feedFile }: Options) {
  const [stats, setStats] = useState<TasmeeLiveStats>(emptyLiveStats);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const cbRef = useRef({ onMark, onStop });
  cbRef.current = { onMark, onStop };

  /* إحصاءات القياس لكل صفحة */
  useEffect(() => setStats(emptyLiveStats()), [pageNumber]);

  useEffect(() => {
    if (!recording || !ready || !isTasmeeNativeAvailable()) return;
    let alive = true;
    let tracker: RecitationTracker | null = null;
    const offset = cursorRef.current;
    const engine = createTasmeeEngine();
    const apply = (events: TrackerEvent[], latencyMs: number | null) => {
      if (!events.length) return;
      setStats((s) => applyTrackerEvents(events, offset, latencyMs, s, (i, m) => cbRef.current.onMark(i, m)));
    };
    const unsubs = [
      engine.onPartial((p) => {
        if (!alive || !tracker) return;
        setStats((s) => ({ ...s, windows: s.windows + 1 }));
        apply(tracker.ingest(p.text, p.finishedAtMs), Math.max(0, p.finishedAtMs - p.windowEndMs));
      }),
      engine.onFailure(() => alive && cbRef.current.onStop("failure")),
      engine.onInterruption(() => alive && cbRef.current.onStop("interruption")),
    ];

    void (async () => {
      try {
        const ref = await loadPageRefWords(pageNumber);
        modelLoaded ??= resolveTasmeeManifest(true).then((m) => tasmeeNative.loadModel(JSON.stringify(m)));
        await modelLoaded;
        if (!alive) return;
        tracker = new RecitationTracker(ref.slice(offset));
        await engine.start(feedFile ? { feedFile } : {});
      } catch {
        modelLoaded = null;
        if (alive) cbRef.current.onStop("failure");
      }
    })();

    return () => {
      alive = false;
      unsubs.forEach((u) => u());
      void engine.stop().catch(() => undefined);
      /* نهاية المقطع: يُحسم كل مشتبه، ولا يُعدّ ما لم يُتلَ بعد متجاوزًا */
      if (tracker) apply(tracker.finish(Date.now()), null);
    };
  }, [recording, ready, pageNumber, feedFile]);

  return { stats, resetStats: () => setStats(emptyLiveStats()) };
}
