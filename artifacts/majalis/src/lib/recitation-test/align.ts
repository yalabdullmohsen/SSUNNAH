/**
 * مقارنة تلاوة المستخدم (نص مفرَّغ) بنص المصحف على مستوى الكلمات — أخطاء الحفظ فقط.
 * لا تقيّم أحكام التجويد ولا مخارج الحروف ولا المدود.
 *
 * يبني على التطبيع القائم (`normalizeQuranWord`: حذف التشكيل والألف الخنجرية والهمزات ومرادفات الرسم العثماني)
 * ويُطبَّق بالطريقة نفسها على النص المرجعي والمنطوق لضمان الإنصاف. المحاذاة Needleman–Wunsch عالمية:
 * match / substitute (مبدّلة) / delete (ناقصة) / insert (زائدة).
 * وحدة نقية بلا DOM أو شبكة.
 */
import {
  isBismillahPhrase,
  normalizeQuranWord,
  positionKey,
  SURAH_WITHOUT_BISMILLAH,
  WORD_POSITION_OVERRIDES,
} from "@/lib/quran-text-normalize";

export type WordStatus = "correct" | "missing" | "substituted";

export type ExpectedAyah = { ayah: number; text: string };

export type ReferenceWord = { ayah: number; text: string; norm: string };

export type WordResult = {
  ayah: number;
  /** الكلمة كما في المصحف (بتشكيلها). */
  text: string;
  status: WordStatus;
  /** ما سُمع بدلها (للمبدّلة) — نص مفرَّغ كما وصل. */
  heard?: string;
};

export type ExtraWord = {
  /** عدد كلمات المرجع التي سبقت هذه الزائدة (موضعها بين الكلمات). */
  afterWord: number;
  text: string;
};

export type RecitationComparison = {
  words: WordResult[];
  extras: ExtraWord[];
  counts: { correct: number; missing: number; substituted: number; extra: number; expected: number };
  /** نسبة الكلمات الصحيحة من المتوقَّع (0–100). */
  accuracy: number;
  /** الآيات التي فيها خطأ (لروابط «انتقل للآية»). */
  ayahsWithErrors: number[];
};

const MATCH = 2;
const MISMATCH = -1;
const GAP = -1;

/** مسافة تحرير بين كلمتين مطبَّعتين (Levenshtein). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n]!;
}

/**
 * تطابق كلمتين مطبَّعتين. «asr» يتسامح بحرف واحد فقط حين تبلغ الكلمتان 6 أحرف فأكثر لضجيج التفريغ الصوتي،
 * ولا يتسامح في القصيرة (نسيان حرف في «من/عن/قد» خطأ حقيقي). «strict» تطابق تام.
 */
export function wordsMatch(refNorm: string, heardNorm: string, mode: "asr" | "strict" = "asr"): boolean {
  if (refNorm === heardNorm) return true;
  if (mode === "strict") return false;
  // التسامح للكلمات الطويلة فقط (الأقصر ≥6 أحرف): نسيان/زيادة حرف في كلمة قصيرة خطأ حقيقي لا ضجيج تفريغ.
  if (Math.min(refNorm.length, heardNorm.length) < 6) return false;
  return editDistance(refNorm, heardNorm) <= 1;
}

export function buildReferenceWords(ayahs: readonly ExpectedAyah[], surah?: number): ReferenceWord[] {
  const out: ReferenceWord[] = [];
  for (const a of ayahs) {
    const raws = a.text.split(/\s+/).filter(Boolean);
    let skip = 0;
    // بيانات المصحف المحلية تضع البسملة في مطلع الآية 1 لكل سورة عدا الفاتحة (آية فعلية) والتوبة (لا بسملة):
    // ليست من كلمات الحفظ المطلوبة، فلا تُحتسب نقصًا إن تركها المستخدم.
    if (surah != null && a.ayah === 1 && surah !== 1 && !SURAH_WITHOUT_BISMILLAH.has(surah) && raws.length > 4) {
      const head = raws.slice(0, 4).map((w) => normalizeQuranWord(w));
      if (isBismillahPhrase(head)) skip = 4;
    }
    for (let i = skip; i < raws.length; i++) {
      const raw = raws[i]!;
      // تصحيحات موضعية موثّقة في التطبيع القائم (مثل «مَٰلِكِ» ← مالك في الفاتحة:4:0)
      const override = surah != null ? WORD_POSITION_OVERRIDES[positionKey(surah, a.ayah, i)] : undefined;
      const norm = override ?? normalizeQuranWord(raw);
      if (norm) out.push({ ayah: a.ayah, text: raw, norm });
    }
  }
  return out;
}

/** يفكّ المنطوق إلى كلمات مطبَّعة مع إبقاء النص الأصلي لعرض «ما سُمع». */
export function tokenizeSpoken(transcript: string): Array<{ raw: string; norm: string }> {
  return transcript
    .split(/\s+/)
    .map((raw) => raw.replace(/[.,،؛:!؟?"«»()[\]{}…]/g, ""))
    .filter(Boolean)
    .map((raw) => ({ raw, norm: normalizeQuranWord(raw) }))
    .filter((w) => w.norm);
}

/** تُهمَل البسملة المنطوقة قبل أول آية في السور (عدا الفاتحة والتوبة) فلا تُحتسب زيادة. */
export function stripLeadingBismillah<T extends { norm: string }>(
  heard: T[],
  surah: number,
  firstAyah: number,
): T[] {
  if (firstAyah !== 1 || surah === 1 || SURAH_WITHOUT_BISMILLAH.has(surah)) return heard;
  const head = heard.slice(0, 4).map((w) => w.norm);
  if (head.length >= 3 && isBismillahPhrase(head.slice(0, 4))) return heard.slice(4);
  if (head.length >= 3 && isBismillahPhrase(head.slice(0, 3))) return heard.slice(3);
  return heard;
}

export function compareRecitation(
  surah: number,
  ayahs: readonly ExpectedAyah[],
  transcript: string,
  opts: { mode?: "asr" | "strict" } = {},
): RecitationComparison {
  const mode = opts.mode ?? "asr";
  const ref = buildReferenceWords(ayahs, surah);
  const heard = stripLeadingBismillah(tokenizeSpoken(transcript), surah, ayahs[0]?.ayah ?? 1);
  const n = ref.length;
  const m = heard.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i]![0] = dp[i - 1]![0]! + GAP;
  for (let j = 1; j <= m; j++) dp[0]![j] = dp[0]![j - 1]! + GAP;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = dp[i - 1]![j - 1]! + (wordsMatch(ref[i - 1]!.norm, heard[j - 1]!.norm, mode) ? MATCH : MISMATCH);
      dp[i]![j] = Math.max(diag, dp[i - 1]![j]! + GAP, dp[i]![j - 1]! + GAP);
    }
  }

  type Op = { t: "match" | "sub" | "del" | "ins"; i: number; j: number };
  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const isM = wordsMatch(ref[i - 1]!.norm, heard[j - 1]!.norm, mode);
      if (dp[i]![j] === dp[i - 1]![j - 1]! + (isM ? MATCH : MISMATCH)) {
        ops.push({ t: isM ? "match" : "sub", i: i - 1, j: j - 1 });
        i--; j--;
        continue;
      }
    }
    if (i > 0 && dp[i]![j] === dp[i - 1]![j]! + GAP) {
      ops.push({ t: "del", i: i - 1, j: -1 });
      i--;
    } else {
      ops.push({ t: "ins", i: -1, j: j - 1 });
      j--;
    }
  }
  ops.reverse();

  const words: WordResult[] = ref.map((r) => ({ ayah: r.ayah, text: r.text, status: "missing" as WordStatus }));
  const extras: ExtraWord[] = [];
  let refSeen = 0;
  for (const op of ops) {
    if (op.t === "match") {
      words[op.i]!.status = "correct";
      refSeen = op.i + 1;
    } else if (op.t === "sub") {
      words[op.i]!.status = "substituted";
      words[op.i]!.heard = heard[op.j]!.raw;
      refSeen = op.i + 1;
    } else if (op.t === "del") {
      words[op.i]!.status = "missing";
      refSeen = op.i + 1;
    } else {
      extras.push({ afterWord: refSeen, text: heard[op.j]!.raw });
    }
  }

  const correct = words.filter((w) => w.status === "correct").length;
  const missing = words.filter((w) => w.status === "missing").length;
  const substituted = words.filter((w) => w.status === "substituted").length;
  const ayahsWithErrors = [...new Set(words.filter((w) => w.status !== "correct").map((w) => w.ayah))];
  // زائدة بين كلمتين تُنسب لآية الكلمة السابقة
  for (const e of extras) {
    const owner = words[Math.max(0, Math.min(words.length - 1, e.afterWord - 1))]?.ayah;
    if (owner != null && !ayahsWithErrors.includes(owner)) ayahsWithErrors.push(owner);
  }
  ayahsWithErrors.sort((a, b) => a - b);

  return {
    words,
    extras,
    counts: { correct, missing, substituted, extra: extras.length, expected: n },
    accuracy: n === 0 ? 0 : Math.round((correct / n) * 100),
    ayahsWithErrors,
  };
}
