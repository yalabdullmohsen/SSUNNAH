/**
 * حزمة الأذكار المضمَّنة في الشاشة الأصلية (SunnahNative/Resources/adhkar.json).
 * المصدر الوحيد هو adhkar-seed بنفس مرشّح النشر للعامة (isBlockedFromPublic)؛
 * التوليد: `node --import tsx scripts/export-native-adhkar.mjs`، ويفشل
 * check-data-integrity إن انحرف الملف المضمَّن عن المصدر.
 */
import { ADHKAR_CATEGORIES, getAllAdhkarItems } from "@/lib/adhkar-seed";
import { isBlockedFromPublic } from "@/lib/content-display-zones";

export const NATIVE_ADHKAR_BUNDLE_PATH = "ios/App/SunnahNative/Sources/SunnahNative/Resources/adhkar.json";

export function buildNativeAdhkarBundle(): string {
  const items = getAllAdhkarItems()
    .filter((it) => !isBlockedFromPublic(it))
    .map(({ id, categoryId, text, count, source, grade, reference }) => ({
      id, categoryId, text, count, source, grade, reference,
    }));
  const used = new Set(items.map((it) => it.categoryId));
  const categories = ADHKAR_CATEGORIES.filter((c) => used.has(c.id)).map(({ id, name, slug, description }) => ({
    id, name, slug, description,
  }));
  const lines = (rows: object[]) => rows.map((r) => `    ${JSON.stringify(r)}`).join(",\n");
  return `{\n  "categories": [\n${lines(categories)}\n  ],\n  "items": [\n${lines(items)}\n  ]\n}\n`;
}
