// يبرهن أن كل عنصر في sources في ios-native/Data له نص عرض غير فارغ بقاعدة SOURCES_FIELD.md؛ يفشل عند عنصر فارغ/غير مفهوم.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { sourceDisplay } from './native-sources-display.mjs'
const data = new URL('../ios-native/Data', import.meta.url).pathname
const files = (d, o = []) => { for (const e of fs.readdirSync(d)) { const p = path.join(d, e); fs.statSync(p).isDirectory() ? files(p, o) : e.endsWith('.json') && o.push(p) } return o }
test('كل عنصر sources له نص عرض', { skip: !fs.existsSync(data) && 'ios-native/Data غير موجود' }, () => {
  const bad = []; let n = 0
  const walk = (o, rel) => {
    if (Array.isArray(o)) return o.forEach((v) => walk(v, rel))
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o.sources)) for (const x of o.sources) { n++; if (!sourceDisplay(x)) bad.push(`${rel} [${o.id ?? o.slug ?? '?'}]: ${JSON.stringify(x).slice(0, 100)}`) }
    for (const v of Object.values(o)) walk(v, rel)
  }
  for (const f of files(data)) { try { walk(JSON.parse(fs.readFileSync(f, 'utf8')), path.relative(data, f)) } catch {} }
  assert.ok(n > 0, 'لا عناصر sources')
  assert.equal(bad.length, 0, `${bad.length} عنصر بلا نص عرض:\n${bad.slice(0, 15).join('\n')}`)
})
test('بنيات التركيب', () => {
  assert.equal(sourceDisplay({ ref: 'ويكيبيديا', url: 'https://x' }), 'ويكيبيديا')
  assert.equal(sourceDisplay({ author: 'النووي', book: 'رياض الصالحين', locator: 'ص8' }), 'النووي، رياض الصالحين، ص8')
  assert.equal(sourceDisplay({ author: 'ابن القيم', book: 'الوابل', ref: '98' }).includes('الوابل'), true)
  assert.equal(sourceDisplay({ title: 'مصدر' }), 'مصدر')
  assert.equal(sourceDisplay({}), '')
})
