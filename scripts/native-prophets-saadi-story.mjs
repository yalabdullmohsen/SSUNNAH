#!/usr/bin/env node
// يضيف لكل نبي قسم «من تفسير السعدي» من تفسير السعدي المحلي (ios-native/Data/tafsir/saadi) للآيات المرجعية الأولى المتصلة في السورة نفسها.
// النص منقول كما هو من التفسير المحلي (لا من الذاكرة)، والمصدر: السعدي، تيسير الكريم الرحمن، سورة/آية. الاستعمال: node scripts/native-prophets-saadi-story.mjs <مجلد tafsir/saadi>
import fs from 'node:fs'
import path from 'node:path'
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const dir = path.join(root, 'artifacts/majalis/public/data/knowledge/prophets')
const saadi = process.argv[2]
if (!saadi || !fs.existsSync(saadi)) { console.error('مرّر مجلد tafsir/saadi'); process.exit(1) }
const MAX_ENTRIES = 3, MAX_CHARS = 2600
let n = 0
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const p = path.join(dir, f); const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  d.sections = (d.sections ?? []).filter((s) => s.key !== 'saadi')
  const refs = (d.evidences ?? []).filter((e) => e.type === 'ayah' && e.surah)
  if (!refs.length) continue
  const s0 = refs[0].surah
  const ayat = [...new Set(refs.filter((e) => e.surah === s0).flatMap((e) => { const a = []; for (let i = e.from; i <= e.to; i++) a.push(i); return a }))].sort((a, b) => a - b)
  const t = JSON.parse(fs.readFileSync(path.join(saadi, String(s0).padStart(3, '0') + '.json'), 'utf8')).ayahs
  const parts = []; let len = 0; let first = null, last = null
  // يبدأ من أول آية لها شرح في المقطع المرجعي؛ الشرح قد يغطي آيات تالية فنتجاوز ما قبل أقرب مفتاح تالٍ
  for (const a of ayat) {
    const txt = t[String(a)]; if (!txt) continue
    if (parts.length >= MAX_ENTRIES || len + txt.length > MAX_CHARS) break
    parts.push(txt); len += txt.length; first ??= a; last = a
  }
  if (!parts.length) { console.log('بلا شرح محلي:', f); continue }
  const name = (d.title ?? f).toString()
  d.sections.push({
    key: 'saadi', title: 'من تفسير السعدي', body: parts.join('\n\n'),
    ayahRef: [{ surah: s0, from: first, to: last }],
    sources: [{ author: 'عبد الرحمن بن ناصر السعدي', book: 'تيسير الكريم الرحمن في تفسير كلام المنان', locator: `سورة رقم ${s0}، الآيات ${first}${last > first ? '–' + last : ''}` }],
  })
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); n++
}
console.log('أُضيف قسم السعدي إلى', n, 'ملفًا')
