/**
 * جلسة «تسميع»: تربط الإضافة الأصلية (نص جزئي) بالمطابِق (كشف الكلمات)، وتُرجع تقريرًا للقياس.
 * المطابقة هنا في JS؛ الإضافة تُرسل النص الجزئي فقط. كل شيء على الجهاز.
 */
import { HallucinationGuard } from "./hallucination-guard";
import { paramsForStrictness, type TasmeeStrictness } from "./levels";
import { TasmeeMatcher, type TasmeeExtraEvent, type TasmeeMatchParams, type TasmeeRefWord, type TasmeeWordEvent, type TasmeeWordState } from "./matcher";
import type { TasmeeAlignedWord, TasmeeEngineApi, TasmeePartialEvent, TasmeeSessionDiagnostics } from "./types";

/**
 * عدد الكلمات القادمة التي تُمرَّر نصًّا إرشاديًّا (prompt) للنموذج. الافتراضي 0 = بلا prompt.
 * قياس base على 13 تلاوة: prompt رفع الكشف 97.6%→97.9% فقط، وكشف الأخطاء المزروعة 100% في الحالتين (104/104)،
 * لكنه زاد التأخير (وسيط 0.21→0.33ث في جولة الأخطاء، وحصة ≤1ث 90%→83%) — فبلا prompt أسرع وأبسط. القدرة تبقى متاحة بخيار promptWords.
 */
export const DEFAULT_PROMPT_WORDS = 0;

import { TASMEE_UNCLEAR_HINT } from "./copy";

export { TASMEE_UNCLEAR_HINT };

export type TasmeeSessionOptions = {
  /** مستوى الصرامة المحفوظ في الإعدادات؛ تتغلّب عليه params الصريحة */
  strictness?: TasmeeStrictness;
  params?: Partial<TasmeeMatchParams>;
  promptWords?: number;
  /** وضع القياس: يحتفظ الصوت في ذاكرة الإضافة لمحاذاة ما بعد الجلسة (لا يُكتب للقرص) */
  measure?: boolean;
};

export type TasmeeWordReport = {
  index: number;
  id: string;
  state: TasmeeWordState;
  revealedAtMs: number | null;
  /** لحظة حسم الحالة (صحيحة/خطأ/متجاوزة) على ساعة الجلسة؛ تُستعمل لتأخير التنبيه بالخطأ */
  decidedAtMs: number | null;
  alignedEndMs: number | null;
  /** وقت الكشف ناقصًا نهاية النطق المقدَّرة (سالب = كُشفت قبل انتهاء الكلمة) */
  latencyMs: number | null;
};

export type TasmeeSessionReport = {
  words: TasmeeWordReport[];
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** نسبة الكلمات التي قال المحاذي إنها نُطقت وكُشفت صحيحة */
  detectionRate: number | null;
  latency: { medianMs: number; p90Ms: number; p95Ms: number; within1sPct: number; samples: number } | null;
  partials: number;
  /** مرات ظهور التلميح في الجلسة (ms من بدء التسجيل على ساعة الجلسة لا تتوفر؛ انظر diagnostics.unclearHintsAtSec) */
  unclearHints: number;
  /** كلمات زائدة نُبِّه عليها (مستوى «دقيق»؛ 0 في غيره) */
  extras: number;
  diagnostics: TasmeeSessionDiagnostics;
};

export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]!;
}

/** يحسب التأخير: نهاية كل كلمة (من محاذاة الصوت الكامل) مقابل لحظة كشفها. */
export function buildLatencyReport(
  ref: readonly TasmeeRefWord[],
  events: readonly TasmeeWordEvent[],
  aligned: readonly TasmeeAlignedWord[],
): { ends: Map<number, number>; detectionRate: number | null } {
  // نمرّر الكلمات المحاذاة تباعًا إلى مطابِق ثانٍ بنافذة أوسع: يربط كل كلمة مسموعة بموضعها المرجعي ويعطي نهايتها
  const m = new TasmeeMatcher(ref, { lookahead: 8, stableHyps: 1 });
  const ends = new Map<number, number>();
  for (const w of aligned) {
    for (const e of m.ingest(w.word, w.endMs)) if (e.state === "correct") ends.set(e.index, w.endMs);
  }
  const spoken = ends.size;
  const revealed = new Set(events.filter((e) => e.state === "correct").map((e) => e.index));
  const hit = [...ends.keys()].filter((i) => revealed.has(i)).length;
  return { ends, detectionRate: spoken ? hit / spoken : null };
}

export class TasmeeSession {
  readonly matcher: TasmeeMatcher;
  private readonly events: TasmeeWordEvent[] = [];
  private readonly listeners = new Set<(e: TasmeeWordEvent) => void>();
  private readonly hintListeners = new Set<(message: string) => void>();
  private readonly extraListeners = new Set<(e: TasmeeExtraEvent) => void>();
  private extrasCount = 0;
  private hints = 0;
  private unsubs: Array<() => void> = [];
  private partials = 0;
  private lastPrompt = "";
  private active = false;
  private readonly guard = new HallucinationGuard();

  constructor(
    private readonly engine: TasmeeEngineApi,
    readonly ref: readonly TasmeeRefWord[],
    private readonly opts: TasmeeSessionOptions = {},
  ) {
    this.matcher = new TasmeeMatcher(ref, { ...(opts.strictness ? paramsForStrictness(opts.strictness) : {}), ...opts.params });
  }

  onWord(cb: (e: TasmeeWordEvent) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /** كلمة زائدة مثبَّتة (مستوى «دقيق» فقط). */
  onExtra(cb: (e: TasmeeExtraEvent) => void): () => void {
    this.extraListeners.add(cb);
    return () => this.extraListeners.delete(cb);
  }

  /** تلميح هادئ («لم يتضح الصوت…») حين يُرصد كلام ولا يعود نص؛ التسميع يستمر. */
  onHint(cb: (message: string) => void): () => void {
    this.hintListeners.add(cb);
    return () => this.hintListeners.delete(cb);
  }

  private promptText(): string {
    const n = this.opts.promptWords ?? DEFAULT_PROMPT_WORDS;
    return n > 0 ? this.matcher.upcomingText(n) : "";
  }

  async start(): Promise<void> {
    this.active = true;
    this.unsubs.push(
      this.engine.onPartial((p) => this.handlePartial(p)),
      this.engine.onUnclear(() => {
        if (!this.active) return;
        this.hints += 1;
        this.hintListeners.forEach((l) => l(TASMEE_UNCLEAR_HINT));
      }),
    );
    this.lastPrompt = this.promptText();
    await this.engine.start({ prompt: this.lastPrompt || undefined, keepSessionAudio: this.opts.measure === true });
  }

  private handlePartial(p: TasmeePartialEvent): void {
    if (!this.active) return;
    this.partials += 1;
    // نص مكرر حرفيًا أو أول نافذة بعد صمت لا يكشف شيئًا (انظر hallucination-guard)
    if (this.guard.decide(p.text, p.finishedAtMs) !== "use") return;
    const evs = this.matcher.ingest(p.text, p.finishedAtMs);
    for (const x of this.matcher.drainExtras()) {
      this.extrasCount += 1;
      this.extraListeners.forEach((l) => l(x));
    }
    for (const e of evs) {
      this.events.push(e);
      this.listeners.forEach((l) => l(e));
    }
    if (evs.length) {
      const next = this.promptText();
      if (next !== this.lastPrompt) {
        this.lastPrompt = next;
        void this.engine.setPrompt(next || null);
      }
    }
  }

  async stop(): Promise<TasmeeSessionReport> {
    this.active = false;
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    const diagnostics = await this.engine.stop();
    let aligned: TasmeeAlignedWord[] = [];
    if (this.opts.measure) {
      try {
        aligned = (await this.engine.alignSession()).words;
      } finally {
        await this.engine.releaseSessionAudio();
      }
    }
    const { ends, detectionRate } = buildLatencyReport(this.ref, this.events, aligned);
    const revealed = new Map<number, TasmeeWordEvent>();
    for (const e of this.events) revealed.set(e.index, e);
    const words: TasmeeWordReport[] = this.ref.map((w, i) => {
      const ev = revealed.get(i);
      const end = ends.get(i) ?? null;
      const at = ev?.state === "correct" ? ev.timeMs : null;
      return {
        index: i,
        id: w.id,
        state: ev?.state ?? "pending",
        revealedAtMs: at,
        decidedAtMs: ev?.timeMs ?? null,
        alignedEndMs: end,
        latencyMs: at !== null && end !== null ? at - end : null,
      };
    });
    const lat = words.map((w) => w.latencyMs).filter((x): x is number => x !== null).sort((a, b) => a - b);
    return {
      words,
      total: this.ref.length,
      correct: words.filter((w) => w.state === "correct").length,
      wrong: words.filter((w) => w.state === "wrong").length,
      skipped: words.filter((w) => w.state === "skipped").length,
      detectionRate,
      latency: lat.length
        ? {
            medianMs: percentile(lat, 0.5),
            p90Ms: percentile(lat, 0.9),
            p95Ms: percentile(lat, 0.95),
            within1sPct: (100 * lat.filter((x) => x <= 1000).length) / lat.length,
            samples: lat.length,
          }
        : null,
      partials: this.partials,
      unclearHints: this.hints,
      extras: this.extrasCount,
      diagnostics,
    };
  }
}
