// قاعدة تركيب نص عرض المصدر لكل بنية sources (مرجعها docs/native/SOURCES_FIELD.md). تُستعمل في الاختبار وتُنقل حرفيًا إلى SourceRef في Swift.
const s = (v) => (typeof v === 'string' && v.trim().length > 1 ? v.trim() : '')
export function sourceDisplay(x) {
  if (typeof x === 'string') return s(x)
  if (!x || typeof x !== 'object') return ''
  if (s(x.ref) && !s(x.book)) return s(x.ref) // {ref,url?,...}
  if (s(x.book)) return [x.author, x.book, x.locator ?? x.ref].map(s).filter(Boolean).join('، ') // {author,book,locator|ref}
  if (s(x.title)) return [x.title, x.author].map(s).filter(Boolean).join('، ') // {title}
  if (s(x.name_ar)) return [x.name_ar, x.platform].map(s).filter(Boolean).join('، ') // {id,name_ar,platform,url}
  return ''
}
