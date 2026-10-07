/**
 * مطابقة الكلمات القرآنية المطبَّعة — على نص حقيقي من المصحف (سورة الملك).
 * تشغيل: node --import tsx src/lib/__tests__/quran-word-match.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bestWordSimilarity, editDistance, quranWordForms, tokenizeSpoken, wordSimilarity, wordsMatch } from "../quran-word-match.ts";
import { normalizeQuranWord } from "../quran-text-normalize.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const surah = JSON.parse(readFileSync(resolve(root, "public/data/quran/surah-067.json"), "utf8").replace(/^\uFEFF/, "")) as {
  ayahs: Array<{ numberInSurah: number; text: string }>;
};

assert.equal(editDistance("", "abc"), 3);
assert.equal(editDistance("كلمه", "كلمه"), 0);
assert.equal(editDistance("مالك", "ملك"), 1);

assert.equal(wordSimilarity("الحمد", "الحمد"), 1);
assert.equal(wordSimilarity("", ""), 1);
assert.ok(wordSimilarity("الملك", "المركب") > 0.4 && wordSimilarity("الملك", "المركب") < 0.75);

// طويلتان: حرف واحد يُتسامح فيه؛ قصيرتان: لا
assert.equal(wordsMatch("تباركك", "تباركا"), true);
assert.equal(wordsMatch("من", "عن"), false);
assert.equal(wordsMatch("من", "من"), true);
assert.equal(wordsMatch("تبارك", "تبارق", "strict"), false);

// تفكيك منطوق بتشكيل وترقيم: كل كلمة مطبَّعة وغير فارغة
const spoken = tokenizeSpoken("تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.");
assert.equal(spoken.length, 9);
assert.equal(spoken[0]!.raw, "تَبَارَكَ");
assert.ok(spoken.every((w) => w.norm.length > 0 && !/[ً-ٰٟ]/.test(w.norm)));

// آية ١ من الملك (بيانات المصحف المحلية تبدأها بالبسملة، فنأخذ الكلمات التسع الأخيرة) مقابل منطوقها بلا تشكيل
const rawRef = surah.ayahs.find((a) => a.numberInSurah === 1)!.text.split(/\s+/).filter(Boolean).slice(-9);
const heard = tokenizeSpoken("تبارك الذي بيده الملك وهو على كل شيء قدير").map((w) => w.norm);
assert.equal(rawRef.length, heard.length);

// التطبيع القياسي وحده يخطئ الألف الخنجرية: «تَبَٰرَكَ» → «تبرك» ≠ «تبارك» (وwordsMatch لا يتسامح في ٥ أحرف)
assert.equal(normalizeQuranWord(rawRef[0]!), "تبرك");
assert.equal(wordsMatch(normalizeQuranWord(rawRef[0]!), heard[0]!), false);
// الصيغتان معًا تعالجان ذلك: تطابق تام كلمة بكلمة
assert.deepEqual(quranWordForms(rawRef[0]!), ["تبرك", "تبارك"]);
assert.equal(bestWordSimilarity(heard[0]!, quranWordForms(rawRef[0]!)), 1);
for (let i = 0; i < rawRef.length; i++) {
  assert.equal(bestWordSimilarity(heard[i]!, quranWordForms(rawRef[i]!)), 1, `الكلمة ${i}`);
}
// كلمة خاطئة تماثل أقل من العتبة
assert.ok(bestWordSimilarity("الركب", quranWordForms(rawRef[3]!)) < 0.75);

console.log("quran-word-match.test.ts: ok");
