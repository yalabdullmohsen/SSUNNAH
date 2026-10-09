/**
 * محاكاة تعرّف صوتي متدفق لاختبار المحرك بلا صوت: تلاوة مُجدولة كلمةً كلمة → نوافذ منزلقة
 * (نفس منطق SpeechWindower: نافذة ≤ windowMs كل hopMs أثناء الكلام) → نص لكل نافذة بضجيج قابل للتكرار.
 */
export type SpokenWord = {
  text: string;
  /** فهرس الكلمة المرجعية التي يتلوها (لقياس الزمن)؛ يُترك للزائد/التعثّر */
  ref?: number;
  /** صمت بعد الكلمة (ms) */
  pauseAfterMs?: number;
};

export type TimedWord = SpokenWord & { startMs: number; endMs: number };

export type SimOptions = {
  windowMs: number;
  hopMs: number;
  /** زمن فك الترميز لكل نافذة (أساس + تذبذب عشوائي حتى jitterMs) */
  decodeMs: number;
  jitterMs: number;
  /** احتمال إسقاط كلمة من نافذة */
  dropRate: number;
  /** احتمال تحريف حرف في كلمة */
  corruptRate: number;
  /** احتمال إلحاق عبارة هلوسة بنافذة */
  hallucinationRate: number;
  /** مدة النطق لكل حرف (ms) + ثابت */
  msPerChar: number;
  msBase: number;
  seed: number;
};

export const DEFAULT_SIM: SimOptions = {
  windowMs: 3000,
  hopMs: 500,
  decodeMs: 250,
  jitterMs: 100,
  dropRate: 0,
  corruptRate: 0,
  hallucinationRate: 0,
  msPerChar: 70,
  msBase: 180,
  seed: 7,
};

export type SimWindow = { text: string; endMs: number; timeMs: number };

/** PRNG بذرة ثابتة (mulberry32) — نتائج قابلة للتكرار في CI. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function scheduleWords(words: readonly SpokenWord[], o: Pick<SimOptions, "msPerChar" | "msBase">, startMs = 300): TimedWord[] {
  let t = startMs;
  return words.map((w) => {
    const dur = o.msBase + o.msPerChar * w.text.replace(/[ً-ٰٟ]/g, "").length;
    const tw = { ...w, startMs: t, endMs: t + dur };
    t = tw.endMs + 60 + (w.pauseAfterMs ?? 0);
    return tw;
  });
}

const HALLUCINATIONS = ["اشتركوا في القناة", "شكرا للمشاهدة"];
const LETTERS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";

export function simulateStreamingAsr(
  words: readonly SpokenWord[],
  opts: Partial<SimOptions> = {},
): { windows: SimWindow[]; timed: TimedWord[] } {
  const o = { ...DEFAULT_SIM, ...opts };
  const rnd = prng(o.seed);
  const timed = scheduleWords(words, o);
  const windows: SimWindow[] = [];
  if (!timed.length) return { windows, timed };
  const last = timed[timed.length - 1]!.endMs;
  for (let end = timed[0]!.startMs + o.hopMs; end <= last + o.hopMs; end += o.hopMs) {
    const start = end - o.windowMs;
    // الكلمة تظهر في النافذة متى نُطق 60% منها داخلها (التعرّف لا يُخرج نصف كلمة في الطرف)
    const inside = timed.filter((w) => {
      const ov = Math.min(end, w.endMs) - Math.max(start, w.startMs);
      return ov >= 0.6 * (w.endMs - w.startMs);
    });
    // VAD: نافذة بلا كلام لا تُرسل
    if (!inside.length || inside[inside.length - 1]!.endMs < end - o.hopMs - 400) continue;
    const toks: string[] = [];
    for (const w of inside) {
      if (rnd() < o.dropRate) continue;
      if (rnd() < o.corruptRate && w.text.length > 2) {
        const i = 1 + Math.floor(rnd() * (w.text.length - 1));
        toks.push(w.text.slice(0, i) + LETTERS[Math.floor(rnd() * LETTERS.length)] + w.text.slice(i + 1));
      } else toks.push(w.text);
    }
    if (rnd() < o.hallucinationRate) toks.push(HALLUCINATIONS[Math.floor(rnd() * HALLUCINATIONS.length)]!);
    const endMs = Math.min(end, last);
    windows.push({ text: toks.join(" "), endMs, timeMs: endMs + o.decodeMs + Math.round(rnd() * o.jitterMs) });
  }
  return { windows, timed };
}
