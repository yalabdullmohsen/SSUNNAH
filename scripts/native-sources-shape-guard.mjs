#!/usr/bin/env node
// حارس بنية حقل `sources` في ios-native/Data: البنية المعيارية {ref (العنوان), url} + اختياري {type, quote, fetched, verified}،
// أو إحالة كتاب مطبوع كاملة {author, book, locator} (المؤلف + الكتاب + الموضع: سورة/آية أو رقم حديث) — قابلة للتحقق بلا رابط.
// يفشل إن: (1) زاد عدد العناصر غير المعيارية في أي قسم عن docs/native/sources-shape-baseline.json،
// (2) وُجد عنصر معيارٍ ناقص (ref أو url فارغ) في ملف يُفترض معياريًا بالكامل (STRICT)،
// (3) ظهر قسم جديد ببنية غير معيارية. الاستعمال: node scripts/native-sources-shape-guard.mjs [--write-baseline]
import fs from 'node:fs'
import path from 'node:path'
const root = new URL('..', import.meta.url).pathname
const data = path.join(root, 'ios-native/Data')
const baseFile = path.join(root, 'docs/native/sources-shape-baseline.json')
const STRICT = ['sirah/islamic-landmarks.json'] // كل عناصر sources هنا معيارية، بلا استثناء
const str = (v) => typeof v === 'string' && v.trim().length > 1
const canonical = (s) => s && typeof s === 'object' && ((str(s.ref) && str(s.url)) || (str(s.author) && str(s.book) && str(s.locator)))
const shapeOf = (s) => (s && typeof s === 'object' ? Object.keys(s).sort().join(',') : typeof s)
const count = {}, bad = [], shapes = {}
const walk = (o, sec, file) => {
  if (Array.isArray(o)) return o.forEach((v) => walk(v, sec, file))
  if (!o || typeof o !== 'object') return
  if (Array.isArray(o.sources)) for (const s of o.sources) {
    const c = (count[sec] ??= { total: 0, nonCanonical: 0 })
    c.total++
    if (!canonical(s)) { c.nonCanonical++; (shapes[sec] ??= {})[shapeOf(s)] = ((shapes[sec] ??= {})[shapeOf(s)] ?? 0) + 1
      if (STRICT.includes(file)) bad.push(`${file}: عنصر sources غير معياري (${shapeOf(s)})`) }
  }
  for (const v of Object.values(o)) walk(v, sec, file)
}
const files = (d, o = []) => { for (const e of fs.readdirSync(d)) { const p = path.join(d, e); fs.statSync(p).isDirectory() ? files(p, o) : e.endsWith('.json') && o.push(p) } return o }
if (!fs.existsSync(data)) { console.log('ios-native/Data غير موجود (شغّل native-export-data.sh) — تخطٍّ'); process.exit(0) }
for (const f of files(data)) { const rel = path.relative(data, f); let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')) } catch { continue }; walk(j, rel.split('/')[0], rel) }
const summary = Object.fromEntries(Object.entries(count).map(([k, v]) => [k, v.nonCanonical]))
if (process.argv.includes('--write-baseline')) { fs.writeFileSync(baseFile, JSON.stringify({ about: 'سقف عناصر sources غير المعيارية لكل قسم؛ يُخفَّض فقط.', nonCanonical: summary }, null, 1) + '\n'); console.log('baseline written'); process.exit(0) }
const base = JSON.parse(fs.readFileSync(baseFile, 'utf8')).nonCanonical
for (const [sec, n] of Object.entries(summary)) if (n > (base[sec] ?? 0)) bad.push(`${sec}: ${n} عنصر sources غير معياري > السقف ${base[sec] ?? 0} ${JSON.stringify(shapes[sec])}`)
if (bad.length) { console.error(bad.slice(0, 20).join('\n')); process.exit(1) }
console.log('sources shape OK', JSON.stringify(summary))
