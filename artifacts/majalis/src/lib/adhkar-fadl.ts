// أزواج «الذكر + فضله» للإشعارات الأصلية (والمرشّحة لودجة «آية أو دعاء» لاحقًا).
// المصدر الوحيد: src/data/adhkar-fadl.json، المولَّد حرفيًا من public/data/hadith بـ scripts/gen-adhkar-fadl.mjs.
import data from '../data/adhkar-fadl.json';

export interface AdhkarFadlItem {
  id: string;
  /** عنوان الإشعار = الذكر. */
  dhikr: string;
  /** نص الحديث حرفيًا (بلا «قال ﷺ:»). */
  fadl: string;
  /** المصدر والدرجة للتوثيق فقط؛ لا يظهران في الإشعار. */
  source: string;
  grade: string;
  repoFile: string;
  repoN: number;
}

export const ADHKAR_FADL_PREFIX: string = data.prefix;
export const ADHKAR_FADL: readonly AdhkarFadlItem[] = data.items;

/** نص الإشعار: «قال ﷺ: …» كاملًا بلا مصدر ولا راوٍ. */
export const adhkarFadlBody = (item: AdhkarFadlItem): string => ADHKAR_FADL_PREFIX + item.fadl;
