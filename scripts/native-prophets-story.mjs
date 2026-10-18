#!/usr/bin/env node
// يضيف لكل نبي قسم «القصة» (sections[].key=story): مراحل بعناوين وصفية قصيرة فقط، ولكل مرحلة مرجع الآيات (ayahRef)
// ونص تفسير السعدي المحلي حرفيًا لآيات المرحلة؛ لا نص آيات ولا سرد من الذاكرة. الاستعمال: node scripts/native-prophets-story.mjs <مجلد tafsir/saadi> [slug…]
import fs from 'node:fs'
import path from 'node:path'
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const dir = path.join(root, 'artifacts/majalis/public/data/knowledge/prophets')
const saadi = process.argv[2]
if (!saadi || !fs.existsSync(saadi)) { console.error('مرّر مجلد tafsir/saadi'); process.exit(1) }
// [سورة، من، إلى، عنوان]؛ مرحلة بعدة مقاطع: مصفوفة مقاطع
export const STAGES = {
  yusuf: [[12, 4, 6, 'الرؤيا'], [12, 7, 10, 'حسد الإخوة وتآمرهم'], [12, 11, 18, 'الجبّ وقميص الدم'], [12, 19, 22, 'البيع في مصر والتمكين'], [12, 23, 29, 'المراودة في بيت العزيز'], [12, 30, 34, 'النسوة والتخيير بين المعصية والسجن'], [12, 35, 42, 'السجن وتأويل رؤيا الفتيين'], [12, 43, 49, 'رؤيا الملك وتأويلها'], [12, 50, 57, 'ظهور البراءة والتمكين'], [12, 58, 68, 'مجيء الإخوة إلى مصر'], [12, 69, 79, 'أخوه والصواع'], [12, 80, 87, 'حزن يعقوب وطلب الخبر'], [12, 88, 93, 'تعريفه بنفسه وإرسال القميص'], [12, 94, 101, 'لقاء الأهل وتأويل الرؤيا']],
  musa: [[28, 3, 6, 'مطلع القصة وطغيان فرعون'], [28, 7, 13, 'اليمّ وردّه إلى أمه'], [28, 14, 21, 'بلوغ الأشدّ والخروج من مصر'], [28, 22, 28, 'في مدين'], [28, 29, 35, 'النار والنداء والآيتان'], [28, 36, 42, 'الدعوة أمام فرعون ومآله']],
  ibrahim: [[2, 124, 124, 'الابتلاء والإمامة'], [2, 125, 129, 'البيت وبناؤه مع إسماعيل'], [6, 74, 79, 'أبوه والنظر في الملكوت'], [6, 80, 83, 'محاجّة قومه'], [21, 51, 56, 'دعوته أباه وقومه'], [21, 57, 67, 'تحطيم الأصنام'], [21, 68, 70, 'النار'], [37, 99, 111, 'الذبح والفداء']],
  nuh: [[11, 25, 31, 'الدعوة وجدال قومه'], [11, 32, 35, 'استعجالهم العذاب'], [11, 36, 41, 'الأمر بصنع السفينة'], [11, 42, 44, 'الطوفان'], [11, 45, 47, 'نداء ابنه'], [11, 48, 49, 'النزول والبشرى']],
  isa: [[3, 42, 44, 'اصطفاء مريم'], [3, 45, 47, 'البشارة بالمسيح'], [19, 16, 26, 'الحمل والولادة'], [19, 27, 33, 'الكلام في المهد'], [3, 48, 51, 'الرسالة والآيات'], [3, 52, 54, 'الحواريون ومكر بني إسرائيل'], [5, 112, 115, 'المائدة'], [[3, 55, 55], [4, 157, 158], 'رفعه إلى الله'], [5, 116, 118, 'سؤال الله له يوم القيامة']],
  adam: [[2, 30, 33, 'الاستخلاف وتعليم الأسماء'], [2, 34, 36, 'السجود والإسكان في الجنة'], [2, 37, 39, 'التوبة والهبوط']],
  hud: [[11, 50, 56, 'دعوة هود لقومه عاد'], [11, 57, 60, 'إعراضهم وهلاكهم']],
  salih: [[11, 61, 64, 'دعوة صالح والناقة'], [11, 65, 68, 'عقر الناقة والهلاك']],
  lut: [[11, 77, 81, 'الضيوف وقوم لوط'], [11, 82, 83, 'العذاب']],
  shuayb: [[11, 84, 90, 'دعوة شعيب في مدين'], [11, 91, 95, 'ردّ قومه وهلاكهم']],
  ayyub: [[21, 83, 84, 'النداء والاستجابة'], [38, 41, 42, 'الدعاء والأمر بالركض'], [38, 43, 44, 'العوض والصبر']],
  idris: [[19, 56, 57, 'الصدّيق المرفوع مكانًا عليًّا']],
  ismail: [[14, 37, 37, 'إسكان الذرية عند البيت'], [19, 54, 55, 'صادق الوعد'], [37, 102, 107, 'الذبح والفداء']],
  'is-haq': [[11, 69, 73, 'البشارة بإسحاق'], [37, 112, 113, 'المبشَّر به والبركة'], [2, 132, 133, 'وصية يعقوب لبنيه']],
  yaqub: [[12, 63, 67, 'إرسال بنيامين وتوصية الأبناء'], [12, 83, 87, 'الصبر على فقد يوسف'], [12, 93, 96, 'القميص وردّ البصر']],
}
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])
const cache = {}
const tx = (s) => (cache[s] ??= JSON.parse(fs.readFileSync(path.join(saadi, String(s).padStart(3, '0') + '.json'), 'utf8')).ayahs)
const rng = (a, b) => (b > a ? `${a}–${b}` : `${a}`)
export function build(stages) {
  const lines = [], ayahRef = [], sources = []
  stages.forEach((st, i) => {
    const title = st[st.length - 1]; const segs = Array.isArray(st[0]) ? st.slice(0, -1) : [st.slice(0, 3)]
    const parts = []
    for (const [s, a, b] of segs) {
      for (let k = a; k <= b; k++) { const t = tx(s)[String(k)]; if (t && !parts.includes(t)) parts.push(t) }
      ayahRef.push({ surah: s, from: a, to: b })
      sources.push({ author: 'عبد الرحمن بن ناصر السعدي', book: 'تيسير الكريم الرحمن في تفسير كلام المنان', locator: `سورة رقم ${s}، الآيات ${rng(a, b)}` })
    }
    if (!parts.length) throw new Error('بلا شرح محلي: ' + title)
    lines.push(`${AR(i + 1)}. ${title}`, ...parts.join('\n').split('\n').map((x) => x.trim()).filter(Boolean))
  })
  return { key: 'story', title: 'القصة', body: lines.join('\n'), ayahRef, sources }
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const only = process.argv.slice(3); let n = 0
  for (const [slug, st] of Object.entries(STAGES)) {
    if (only.length && !only.includes(slug)) continue
    const p = path.join(dir, slug + '.json'); const d = JSON.parse(fs.readFileSync(p, 'utf8'))
    d.sections = (d.sections ?? []).filter((s) => s.key !== 'story'); d.sections.push(build(st))
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); n++
  }
  console.log('أُضيف قسم القصة إلى', n, 'ملفًا')
}
