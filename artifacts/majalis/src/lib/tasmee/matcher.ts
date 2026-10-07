/**
 * مطابقة النتائج الجزئية للتفريغ الصوتي مع الكلمات القادمة في وضع «تسميع» — منطق نقي (بلا DOM/شبكة).
 * تكشف الكلمة بمجرد تطابقها دون انتظار نهاية الآية، وتعالج: تطابق تقريبي (fuzzy)، خطأ، تجاوز.
 * يبني على التطبيع المشترك (`normalizeQuranWord`) وعلى `quran-word-match`.
 *
 * معرّف الكلمة `page:line:position` (يطابق data-word-id في DOM المصحف).
 */
import { bestWordSimilarity, quranWordForms, tokenizeSpoken } from "@/lib/quran-word-match";

export type TasmeeWordState = "pending" | "correct" | "wrong" | "skipped";

export type TasmeeRefWord = { id: string; text: string };

export type TasmeeWordEvent = {
  index: number;
  id: string;
  state: Exclude<TasmeeWordState, "pending">;
  /** لحظة القرار (ms) كما مُرّرت إلى ingest */
  timeMs: number;
};

export type TasmeeMatchParams = {
  /** كم كلمة قادمة تُفحص (3–5) */
  lookahead: number;
  /** كلمات سابقة تُستهلك لمحاذاة بداية نافذة التفريغ (التي تحوي كلمات كُشفت سابقًا) */
  back: number;
  /** عدد النتائج الجزئية المتتالية اللازمة قبل الكشف (1 = فوري) */
  stableHyps: number;
  /** أدنى تشابه لكلمة طولها ≥ 4 */
  thrLong: number;
  /** أدنى تشابه لكلمة طولها 3 */
  thrMid: number;
  /** أدنى تشابه لاعتبار كلمة مسموعة «خطأ» لا «متجاوزة» */
  wrongSim: number;
};

export const DEFAULT_TASMEE_PARAMS: TasmeeMatchParams = {
  lookahead: 5,
  back: 4,
  stableHyps: 1,
  thrLong: 0.75,
  thrMid: 0.66,
  wrongSim: 0.4,
};

export class TasmeeMatcher {
  readonly ref: readonly TasmeeRefWord[];
  readonly params: TasmeeMatchParams;
  private readonly forms: string[][];
  private states: TasmeeWordState[];
  private nextIdx = 0;
  private stable = new Map<number, number>();

  constructor(ref: readonly TasmeeRefWord[], params: Partial<TasmeeMatchParams> = {}) {
    this.ref = ref;
    this.params = { ...DEFAULT_TASMEE_PARAMS, ...params };
    this.forms = ref.map((w) => quranWordForms(w.text));
    this.states = ref.map(() => "pending");
  }

  /** فهرس الكلمة المتوقعة التالية */
  get next(): number {
    return this.nextIdx;
  }

  get state(): readonly TasmeeWordState[] {
    return this.states;
  }

  /** نص الكلمات القادمة (للـprompt الموجَّه للنموذج). */
  upcomingText(count: number): string {
    return this.ref
      .slice(this.nextIdx, this.nextIdx + count)
      .map((w) => w.text)
      .join(" ");
  }

  reset(): void {
    this.states = this.ref.map(() => "pending");
    this.nextIdx = 0;
    this.stable.clear();
  }

  private accepts(token: string, idx: number): boolean {
    const forms = this.forms[idx]!;
    const len = Math.min(forms[0]!.length, token.length);
    const s = bestWordSimilarity(token, forms);
    if (len <= 2) return s >= 0.99;
    if (len === 3) return s >= this.params.thrMid;
    return s >= this.params.thrLong;
  }

  /**
   * محاذاة أحادية الاتجاه (semi-global DP) للكلمات المسموعة على نافذة مرجعية [next-m, next+lookahead):
   * بدايتها حرّة (النافذة الصوتية تبدأ من منتصف ما كُشف) ونهايتها حرّة. تطابق +2، استبدال/حذف -1.
   * تمنع التخمين الأعمى: كلمة قديمة مكرّرة (مثل «الذي») لا تُحاذى على ظهورها اللاحق ما دام تسلسل أفضل يفسّرها.
   */
  private align(toks: string[]): Array<{ tok: number; word: number }> {
    const m = toks.length;
    const lo = Math.max(0, this.nextIdx - m - this.params.back);
    const hi = Math.min(this.ref.length, this.nextIdx + this.params.lookahead);
    const r = hi - lo;
    if (r <= 0) return [];
    const NEG = -1e9;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(r + 1).fill(NEG));
    const from: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(r + 1).fill(0)); // 1 قطري، 2 حذف كلمة مسموعة، 3 تخطي مرجعية
    for (let j = 0; j <= r; j++) dp[0]![j] = 0;
    const acc: boolean[][] = toks.map((t) => Array.from({ length: r }, (_, j) => this.accepts(t, lo + j)));
    for (let i = 1; i <= m; i++) {
      for (let j = 0; j <= r; j++) {
        let best = dp[i - 1]![j]! - 1; // حذف الكلمة المسموعة (ضجيج/زيادة)
        let how = 2;
        if (j > 0) {
          const diag = dp[i - 1]![j - 1]! + (acc[i - 1]![j - 1] ? 2 : -1);
          if (diag > best) { best = diag; how = 1; }
          const skip = dp[i]![j - 1]! - 1; // تخطي كلمة مرجعية
          if (skip > best) { best = skip; how = 3; }
        }
        dp[i]![j] = best;
        from[i]![j] = how;
      }
    }
    let j = 0;
    for (let c = 1; c <= r; c++) if (dp[m]![c]! > dp[m]![j]!) j = c;
    const out: Array<{ tok: number; word: number }> = [];
    let i = m;
    while (i > 0) {
      const how = from[i]![j]!;
      if (how === 1) {
        if (acc[i - 1]![j - 1]) out.push({ tok: i - 1, word: lo + j - 1 });
        i--; j--;
      } else if (how === 3) {
        j--;
      } else {
        i--;
      }
    }
    return out.reverse();
  }

  /** يستقبل نصًّا جزئيًّا من التفريغ ويُرجع الكلمات التي حُسمت حالتها الآن. */
  ingest(text: string, timeMs: number): TasmeeWordEvent[] {
    const toks = tokenizeSpoken(text).map((w) => w.norm);
    if (!toks.length || this.nextIdx >= this.ref.length) return [];

    const matched = this.align(toks);

    const candidates = new Set(matched.map((m) => m.word).filter((w) => w >= this.nextIdx));
    for (const k of [...this.stable.keys()]) if (!candidates.has(k)) this.stable.set(k, 0);
    for (const c of candidates) this.stable.set(c, (this.stable.get(c) ?? 0) + 1);

    const ready = [...candidates].filter((c) => (this.stable.get(c) ?? 0) >= this.params.stableHyps).sort((a, b) => a - b);
    const j = ready[ready.length - 1];
    if (j === undefined) return [];

    const prevTok = [...matched].reverse().find((m) => m.word < this.nextIdx)?.tok ?? -1;
    const jTok = matched.find((m) => m.word === j)?.tok ?? toks.length;
    const matchedToks = new Set(matched.map((m) => m.tok));
    const unmatchedBetween: number[] = [];
    for (let ti = prevTok + 1; ti < jTok; ti++) if (!matchedToks.has(ti)) unmatchedBetween.push(ti);

    const events: TasmeeWordEvent[] = [];
    const push = (index: number, state: TasmeeWordEvent["state"]) => {
      this.states[index] = state;
      events.push({ index, id: this.ref[index]!.id, state, timeMs });
    };
    let ui = 0;
    for (let g = this.nextIdx; g < j; g++) {
      if (ready.includes(g)) {
        push(g, "correct");
      } else if (ui < unmatchedBetween.length && bestWordSimilarity(toks[unmatchedBetween[ui]!]!, this.forms[g]!) >= this.params.wrongSim) {
        ui++;
        push(g, "wrong");
      } else {
        push(g, "skipped");
      }
    }
    push(j, "correct");
    this.nextIdx = j + 1;
    this.stable.clear();
    return events;
  }
}
