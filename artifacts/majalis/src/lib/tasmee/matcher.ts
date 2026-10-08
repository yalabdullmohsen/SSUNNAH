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

/** كلمة زائدة سُمعت بين كلمتين متتاليتين من النص (مستوى «دقيق» فقط، وبعد ثباتها في نتيجتين). */
export type TasmeeExtraEvent = {
  /** فهرس آخر كلمة مرجعية قبل الزيادة */
  afterIndex: number;
  /** الكلمة المسموعة (مطبَّعة) */
  heard: string;
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
  /** كشف الكلمة الزائدة (مغلق افتراضيًا؛ يُفعَّل في مستوى «دقيق» فقط بعد ثبوت انعدام التنبيهات الخاطئة على التلاوات السليمة) */
  detectExtra: boolean;
  /** عدد النتائج المتتالية اللازمة لتثبيت كلمة زائدة قبل التنبيه */
  extraStableHyps: number;
  /** أقل طول (بعد التطبيع) لكلمة تُعدّ زائدة (الحشو القصير يُهمَل) */
  extraMinLen: number;
  /** كلمة مسموعة تسبق مباشرةً الكلمة الصحيحة وتشبهها بهذا القدر فأكثر تُعدّ محاولة قبل تصحيح ذاتي لا زيادة */
  extraSelfCorrectSim: number;
};

export const DEFAULT_TASMEE_PARAMS: TasmeeMatchParams = {
  lookahead: 5,
  back: 4,
  stableHyps: 1,
  thrLong: 0.75,
  thrMid: 0.66,
  wrongSim: 0.4,
  detectExtra: false,
  extraStableHyps: 2,
  extraMinLen: 3,
  extraSelfCorrectSim: 0.3,
};

export class TasmeeMatcher {
  readonly ref: readonly TasmeeRefWord[];
  readonly params: TasmeeMatchParams;
  private readonly forms: string[][];
  private states: TasmeeWordState[];
  private nextIdx = 0;
  private stable = new Map<number, number>();
  private extraSeen = new Map<string, number>();
  private extraReported = new Set<string>();
  private pendingExtras: TasmeeExtraEvent[] = [];

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
    this.extraSeen.clear();
    this.extraReported.clear();
    this.pendingExtras = [];
  }

  /** الكلمات الزائدة المثبَّتة منذ آخر استدعاء (فارغة ما لم يُفعَّل detectExtra). */
  drainExtras(): TasmeeExtraEvent[] {
    const out = this.pendingExtras;
    this.pendingExtras = [];
    return out;
  }

  /**
   * زيادة = كلمة مسموعة بين كلمتين مرجعيتين متتاليتين (محاذاتان متجاورتان) لا تشبه أي كلمة قريبة من النص:
   * فتُستثنى إعادة كلمة/مقطع سبق (تردد) والتصحيح الذاتي (تشبه كلمة مجاورة) والحشو القصير. تُثبَّت بنتيجتين متتاليتين.
   */
  private detectExtras(toks: string[], matched: Array<{ tok: number; word: number }>, timeMs: number): void {
    const seenNow = new Set<string>();
    const matchedToks = new Set(matched.map((m) => m.tok));
    for (let k = 0; k + 1 < matched.length; k++) {
      const a = matched[k]!, b = matched[k + 1]!;
      if (b.word !== a.word + 1 || b.tok - a.tok < 2) continue;
      for (let ti = a.tok + 1; ti < b.tok; ti++) {
        if (matchedToks.has(ti)) continue;
        const tok = toks[ti]!;
        if (tok.length < this.params.extraMinLen) continue;
        const lo = Math.max(0, a.word - 10), hi = Math.min(this.ref.length, b.word + 10);
        let similarToText = false;
        for (let j = lo; j < hi && !similarToText; j++) similarToText = this.accepts(tok, j) || bestWordSimilarity(tok, this.forms[j]!) >= this.params.wrongSim + 0.2;
        if (similarToText) continue;
        // محاولة تصحيح ذاتي: الكلمة المسموعة تسبق الصحيحة مباشرةً وتشبهها (ولو قليلًا) → ليست زيادة
        if (ti === b.tok - 1 && bestWordSimilarity(tok, this.forms[b.word]!) >= this.params.extraSelfCorrectSim) continue;
        const key = `${a.word}|${tok}`;
        seenNow.add(key);
        const n = (this.extraSeen.get(key) ?? 0) + 1;
        this.extraSeen.set(key, n);
        if (n >= this.params.extraStableHyps && !this.extraReported.has(key)) {
          this.extraReported.add(key);
          this.pendingExtras.push({ afterIndex: a.word, heard: tok, timeMs });
        }
      }
    }
    for (const key of [...this.extraSeen.keys()]) if (!seenNow.has(key)) this.extraSeen.delete(key);
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
    if (this.params.detectExtra) this.detectExtras(toks, matched, timeMs);

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
