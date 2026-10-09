/**
 * محرك التسميع v2: محاذاة مقيَّدة بالنص المتوقع فوق نوافذ تعرّف منزلقة (1–3ث).
 *
 * يعيد استخدام المطابِق القائم (TasmeeMatcher: محاذاة شبه-عامة على نافذة حول المؤشر، بالتطبيع القرآني نفسه)
 * وحارس الهلوسة، ويضيف فوقهما طبقة «اشتباه ثم تأكيد» تكبت الإنذارات الكاذبة:
 * - الكلمة الصحيحة تُكشف فورًا (هدف الزمن ≤ 1ث).
 * - الخطأ/التجاوز يبقى «مشتبهًا» حتى يتقدم القارئ `confirmWords` كلمات بعده؛ فإن ظهرت الكلمة في نافذة متداخلة
 *   لاحقة (أسقطها التعرّف مرة ثم سمعها) أو في رأي ثانٍ (Groq) سُحب الاشتباه وكُشفت صحيحة.
 */
import { HallucinationGuard } from "../../tasmee/hallucination-guard";
import { TasmeeMatcher, type TasmeeMatchParams, type TasmeeRefWord } from "../../tasmee/matcher";
import { bestWordSimilarity, quranWordForms, tokenizeSpoken } from "../../quran-word-match";

export type TrackerEvent =
  | { kind: "correct"; index: number; id: string; timeMs: number; recovered?: boolean }
  | { kind: "error"; index: number; id: string; state: "wrong" | "skipped"; timeMs: number };

export type TrackerParams = {
  match: Partial<TasmeeMatchParams>;
  /** كم كلمة صحيحة بعد المشتبه قبل تأكيده */
  confirmWords: number;
  /** أدنى تشابه لسحب الاشتباه حين تُسمع الكلمة لاحقًا */
  recoverSim: number;
  /** مدى الجوار الذي يجب أن تكون الكلمة فريدة فيه حتى يُعتدّ بسماعها لاحقًا */
  uniqueSpan: number;
};

export const DEFAULT_TRACKER_PARAMS: TrackerParams = {
  match: {},
  confirmWords: 2,
  recoverSim: 0.8,
  uniqueSpan: 3,
};

type Suspect = { index: number; state: "wrong" | "skipped"; timeMs: number };

export class RecitationTracker {
  readonly params: TrackerParams;
  private readonly matcher: TasmeeMatcher;
  private readonly guard = new HallucinationGuard();
  private readonly forms: string[][];
  private suspects: Suspect[] = [];
  private readonly final = new Map<number, TrackerEvent>();

  constructor(
    readonly ref: readonly TasmeeRefWord[],
    params: Partial<TrackerParams> = {},
  ) {
    this.params = { ...DEFAULT_TRACKER_PARAMS, ...params };
    this.matcher = new TasmeeMatcher(ref, this.params.match);
    this.forms = ref.map((w) => quranWordForms(w.text));
  }

  get next(): number {
    return this.matcher.next;
  }

  /** نتائج كل كلمة حُسمت نهائيًا (صحيحة أو خطأ مؤكَّد) */
  get decided(): ReadonlyMap<number, TrackerEvent> {
    return this.final;
  }

  /** ما زال مشتبهًا (لم يُعرض للمستخدم) */
  get pending(): readonly number[] {
    return this.suspects.map((s) => s.index);
  }

  private isUniqueNearby(index: number): boolean {
    const span = this.params.uniqueSpan;
    const [f] = this.forms[index]!;
    for (let j = Math.max(0, index - span); j <= Math.min(this.ref.length - 1, index + span); j++) {
      if (j !== index && bestWordSimilarity(f!, this.forms[j]!) >= this.params.recoverSim) return false;
    }
    return true;
  }

  /** يسحب الاشتباه عن كل كلمة سُمعت في هذا النص. */
  private recover(text: string, timeMs: number, out: TrackerEvent[]): void {
    if (!this.suspects.length) return;
    const toks = tokenizeSpoken(text).map((t) => t.norm);
    this.suspects = this.suspects.filter((s) => {
      if (!this.isUniqueNearby(s.index)) return true;
      const heard = toks.some((t) => bestWordSimilarity(t, this.forms[s.index]!) >= this.params.recoverSim);
      if (!heard) return true;
      this.emit({ kind: "correct", index: s.index, id: this.ref[s.index]!.id, timeMs, recovered: true }, out);
      return false;
    });
  }

  private emit(e: TrackerEvent, out: TrackerEvent[]): void {
    this.final.set(e.index, e);
    out.push(e);
  }

  private confirmDue(timeMs: number, throughIndex: number, out: TrackerEvent[]): void {
    this.suspects = this.suspects.filter((s) => {
      if (throughIndex - s.index <= this.params.confirmWords) return true;
      this.emit({ kind: "error", index: s.index, id: this.ref[s.index]!.id, state: s.state, timeMs }, out);
      return false;
    });
  }

  /** نص نافذة تعرّف جديدة عند لحظة `timeMs` (نهاية النافذة + زمن فك الترميز). */
  ingest(text: string, timeMs: number): TrackerEvent[] {
    const out: TrackerEvent[] = [];
    // النوافذ المنزلقة تتداخل فيتكرر نصها طبيعيًا؛ الحارس يُسقط الهلوسة المتكررة فقط
    if (this.guard.decide(text, timeMs) === "hallucination") return out;
    this.recover(text, timeMs, out);
    // نافذة 3ث قد تحوي كلمات أكثر من مدى نظر المطابِق: يُعاد تمريرها ما دام المؤشر يتقدم
    for (let pass = 0; pass < 4; pass++) {
      const before = this.matcher.next;
      for (const e of this.matcher.ingest(text, timeMs)) {
        if (e.state === "correct") this.emit({ kind: "correct", index: e.index, id: e.id, timeMs: e.timeMs }, out);
        else this.suspects.push({ index: e.index, state: e.state, timeMs: e.timeMs });
      }
      if (this.matcher.next === before) break;
    }
    this.confirmDue(timeMs, this.matcher.next - 1, out);
    return out;
  }

  /** رأي ثانٍ (مثل Groq على النافذة المشتبهة): يسحب الاشتباه فقط، ولا يُنشئ خطأً. */
  secondOpinion(text: string, timeMs: number): TrackerEvent[] {
    const out: TrackerEvent[] = [];
    this.recover(text, timeMs, out);
    return out;
  }

  /** نهاية المقطع: تأكيد كل مشتبه، وما لم يُتلَ حتى `throughIndex` يُعدّ متجاوزًا. */
  finish(timeMs: number, throughIndex = this.matcher.next - 1): TrackerEvent[] {
    const out: TrackerEvent[] = [];
    for (const s of this.suspects) this.emit({ kind: "error", index: s.index, id: this.ref[s.index]!.id, state: s.state, timeMs }, out);
    this.suspects = [];
    for (let i = 0; i <= throughIndex; i++) {
      if (!this.final.has(i)) this.emit({ kind: "error", index: i, id: this.ref[i]!.id, state: "skipped", timeMs }, out);
    }
    return out;
  }
}
