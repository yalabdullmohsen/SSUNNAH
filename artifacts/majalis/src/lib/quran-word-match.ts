/**
 * مطابقة الكلمات القرآنية المطبَّعة (نقية بلا DOM/شبكة): مسافة تحرير، تطابق متسامح لضجيج التفريغ الصوتي،
 * تشابه مُطبَّع، وتفكيك المنطوق إلى كلمات مطبَّعة.
 * تبني فوق `normalizeQuranWord` (حذف التشكيل والألف الخنجرية والهمزات ومرادفات الرسم العثماني).
 * مُستخرَجة من منطق المقارنة ليستعملها أكثر من مستهلك (اختبار التلاوة، وضع التسميع) دون تكرار.
 */
import { normalizeQuranWord } from "@/lib/quran-text-normalize";

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

/** تشابه مُطبَّع بين 0 و1 (1 = تطابق تام). */
export function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 1 : 1 - editDistance(a, b) / longest;
}

/**
 * تطابق كلمتين مطبَّعتين. «asr» يتسامح بحرف واحد فقط حين تبلغ الأقصر 6 أحرف فأكثر لضجيج التفريغ الصوتي،
 * ولا يتسامح في القصيرة (نسيان حرف في «من/عن/قد» خطأ حقيقي). «strict» تطابق تام.
 */
export function wordsMatch(refNorm: string, heardNorm: string, mode: "asr" | "strict" = "asr"): boolean {
  if (refNorm === heardNorm) return true;
  if (mode === "strict") return false;
  if (Math.min(refNorm.length, heardNorm.length) < 6) return false;
  return editDistance(refNorm, heardNorm) <= 1;
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

/**
 * صيغتا الكلمة المرجعية: التطبيع القياسي (يحذف الألف الخنجرية: «تَبَٰرَكَ» → تبرك) وصيغة تُحوّل الألف الخنجرية
 * إلى ألف (→ تبارك) كما يكتبها التفريغ الصوتي غالبًا. تُقارَن الكلمة المسموعة بأفضل الصيغتين.
 */
export function quranWordForms(raw: string): string[] {
  const plain = normalizeQuranWord(raw);
  const withAlef = normalizeQuranWord(raw.replace(/\u0670/g, "ا"));
  return plain === withAlef ? [plain] : [plain, withAlef];
}

/** أعلى تشابه بين كلمة مسموعة مطبَّعة وأي صيغة من صيغ الكلمة المرجعية. */
export function bestWordSimilarity(heardNorm: string, forms: readonly string[]): number {
  let best = 0;
  for (const f of forms) best = Math.max(best, wordSimilarity(heardNorm, f));
  return best;
}
