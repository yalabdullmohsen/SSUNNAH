#!/usr/bin/env node
// يضيف لكل نبي قسم «من السنة» من صحيح البخاري المحلي (ios-native/Data/hadith/bukhari.json): المتن المنقول بين علامتي الاقتباس كما في الملف، ورقم الحديث.
// الدرجة على مستوى الكتاب فقط: «صحيح بإدراجه في صحيح البخاري» (لا درجة فردية في الملف المحلي). القائمة منتقاة يدويًا بعد التحقق من أن المتن يذكر النبي.
// الاستعمال: node scripts/native-prophets-sunnah.mjs <مسار bukhari.json>
import fs from 'node:fs'
import path from 'node:path'
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const dir = path.join(root, 'artifacts/majalis/public/data/knowledge/prophets')
const src = process.argv[2]
if (!src || !fs.existsSync(src)) { console.error('مرّر مسار bukhari.json'); process.exit(1) }
const PICK = { harun: [3706], sulayman: [3424], yaqub: [3382], 'is-haq': [3382], yahya: [3430], adam: [3326, 3409], ibrahim: [3350, 3356, 3372], ismail: [3362], lut: [3387], yusuf: [3382], ayyub: [3391], musa: [3405, 3404], yunus: [3413], dawud: [3420], isa: [3442, 3444] }
const H = new Map(JSON.parse(fs.readFileSync(src, 'utf8')).hadiths.map((h) => [h.n, h]))
const quoted = (t) => { const m = t.match(/‏\s*"‏\s*([\s\S]+?)\s*‏"‏/); return m ? m[1].trim() : null }
let n = 0
for (const [slug, nums] of Object.entries(PICK)) {
  const p = path.join(dir, slug + '.json'); const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  d.sections = (d.sections ?? []).filter((s) => s.key !== 'sunnah')
  const parts = [], sources = []
  for (const k of nums) {
    const h = H.get(k); const m = h && quoted(h.t)
    if (!m) { console.error('بلا متن مقتبس:', slug, k); process.exit(1) }
    parts.push(`«${m}»\n— صحيح البخاري، حديث رقم ${k}. الدرجة: صحيح بإدراجه في صحيح البخاري.`)
    sources.push({ author: 'محمد بن إسماعيل البخاري', book: 'الجامع الصحيح', locator: `حديث رقم ${k}` })
  }
  d.sections.push({ key: 'sunnah', title: 'من السنة', body: parts.join('\n\n'), sources })
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); n++
}
console.log('أُضيف قسم السنة إلى', n, 'ملفًا')
