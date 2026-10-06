/**
 * مخطط موحّد لكل مجموعة بيانات مضمّنة (zod) — المرجع: docs/DATA.md.
 * المعرّف الثابت لكل نوع مذكور في `stableId`؛ لا يُحذف معرّف ثابت إلا بترحيل
 * يحفظ بيانات المستخدم (المفضلة/المحفوظات) — تفرضه البوابة عبر id-baseline.json.
 * رقم الإصدار لكل مجموعة: `manifest.json` → `version` (يُرفع عند تغيير البنية).
 * مخططات المعرفة (knowledge) بصيغة JSON Schema في هذا المجلد نفسه.
 */
import { z } from "zod";

const text = z.string().trim().min(1);

/** مجموعة مجزأة: manifest + أجزاء بمصفوفات. */
export const ChunkManifest = z.object({
  version: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  chunks: z.array(z.object({ file: text, count: z.number().int().nonnegative(), key: z.string().optional() })).min(1),
}).passthrough();

/** حديث محقق: المتن + المصدر + الدرجة إلزامية. */
export const VerifiedHadith = z.object({
  id: text,
  collection: z.string(),
  text,
  source_name: text,
  grade: text,
  authenticity_class: z.enum(["sahih", "hasan", "daif", "mawdu"]),
}).passthrough();

/** حديث من الصحيحين (fawazahmed0/hadith-api): n = رقم الحديث، t = النص. */
export const SahihaynHadith = z.object({ n: z.number(), t: text }).passthrough();

/** ذكر: النص + المصدر/المرجع + الدرجة. */
export const Dhikr = z.object({
  id: text,
  categoryId: text,
  text,
  count: z.number().int().positive(),
  grade: text,
}).passthrough().refine((d) => Boolean(d.source?.trim() || d.reference?.trim()), { message: "ذكر بلا مصدر/مرجع" });

export const QaItem = z.object({ id: z.union([z.string(), z.number()]), question: text, answer: text }).passthrough();
export const QuizItem = z.object({ id: z.union([z.string(), z.number()]), question: text, answer: text, section: text }).passthrough();
export const Story = z.object({ id: z.number(), slug: text, title: text, full_content: text, sources: z.array(z.unknown()).min(1) }).passthrough();
export const LessonItem = z.object({ id: z.union([z.string(), z.number()]), title: text }).passthrough();

export const AudioRegistry = z.object({
  version: z.number(),
  reciters: z.array(z.object({ id: text, name: text, urlPattern: z.string().url().startsWith("https://") }).passthrough()).min(1),
}).passthrough();

/** المجموعات المجزأة: المجلد ← مخطط العنصر + المعرّف الثابت. */
export const CHUNKED = {
  "hadith-verified": { item: VerifiedHadith, stableId: "id" },
  qa: { item: QaItem, stableId: "id" },
  quiz: { item: QuizItem, stableId: "id" },
  stories: { item: Story, stableId: "slug" },
  lessons: { item: LessonItem, stableId: "id" },
};
