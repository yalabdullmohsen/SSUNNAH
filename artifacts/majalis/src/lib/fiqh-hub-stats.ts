/**
 * إحصاءات بطل الفقه — محسوبة من بيانات الكتب لا أرقام ثابتة يدوية.
 * بوابة: `fiqh-hub-stats-gate.test.ts`
 * تُحسب عند القراءة حتى تكتمل تحميل /data/fiqh في المتصفح.
 */
import { getAllFiqhBooks, fiqhBookCounts, isFiqhCatalogReady } from "@/lib/fiqh-books";

function computeFiqhHubStats(): { books: number; chapters: number; lessons: number } {
  /* بلا أرقام ثابتة في المصدر — الكتالوج الفارغ قبل التحميل يعطي أصفارًا محسوبة */
  void isFiqhCatalogReady();
  const books = getAllFiqhBooks();
  let chapters = 0;
  let lessons = 0;
  for (const b of books) {
    const c = fiqhBookCounts(b);
    chapters += c.chapters;
    lessons += c.lessons;
  }
  return { books: books.length, chapters, lessons };
}

/** متوافق مع الاستخدام السابق — getters بعد تحميل الكتالوج */
export const FIQH_HUB_STATS = {
  get books() {
    return computeFiqhHubStats().books;
  },
  get chapters() {
    return computeFiqhHubStats().chapters;
  },
  get lessons() {
    return computeFiqhHubStats().lessons;
  },
};

export function getFiqhHubStats() {
  return computeFiqhHubStats();
}
