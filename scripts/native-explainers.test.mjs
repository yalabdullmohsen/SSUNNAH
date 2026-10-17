// يفشل عند نقص مصدر أو تكرر نص أو آية حرفية أو مرجع آية غير صالح في public/data/explainers (الشكل في docs/native/SOURCES_FIELD.md)
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

// قاعدة العرض مختصرة هنا (الكاملة في native-sources-display.mjs بعد دمج #3448): {author,book,locator|ref} أو {ref} أو {title}
const t1 = (v) => (typeof v === 'string' && v.trim().length > 1 ? v.trim() : '')
const sourceDisplay = (x) => (typeof x === 'string' ? t1(x) : !x ? '' : t1(x.book) ? [x.author, x.book, x.locator ?? x.ref].map(t1).filter(Boolean).join('، ') : t1(x.ref) || [x.title, x.author].map(t1).filter(Boolean).join('، '))

const dir = new URL('../artifacts/majalis/public/data/explainers/', import.meta.url)
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
const docs = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8')) }))
const norm = (t) => t.replace(/[ً-ٰٟ]/g, '').replace(/\s+/g, ' ').trim()

test('يوجد شرح واحد على الأقل', () => assert.ok(docs.length > 0))

test('كل مرحلة كاملة الحقول ومصادرها مفهومة', () => {
  const ids = new Set()
  for (const { f, d } of docs) {
    assert.equal(d.review_status, 'verified', f)
    assert.ok(d.stages?.length > 1, `${f}: مراحل`)
    d.stages.forEach((s, i) => {
      const w = `${f}#${s.id}`
      assert.ok(s.id && !ids.has(s.id), `${w}: id مفقود أو مكرر`)
      ids.add(s.id)
      assert.equal(s.order, i + 1, `${w}: الترتيب`)
      for (const k of ['title', 'body', 'illustrationBrief']) assert.ok(typeof s[k] === 'string' && s[k].trim().length > 5, `${w}: ${k}`)
      assert.ok(Array.isArray(s.ayahRef) && s.ayahRef.length, `${w}: ayahRef`)
      for (const r of s.ayahRef) {
        assert.ok(Number.isInteger(r.surah) && r.surah >= 1 && r.surah <= 114, `${w}: سورة`)
        assert.ok(Number.isInteger(r.from) && Number.isInteger(r.to) && r.from >= 1 && r.from <= r.to, `${w}: نطاق`)
      }
      assert.ok(Array.isArray(s.sources) && s.sources.length, `${w}: بلا مصدر`)
      for (const x of s.sources) assert.ok(sourceDisplay(x), `${w}: مصدر غير مفهوم ${JSON.stringify(x)}`)
    })
  }
})

test('لا نص آية حرفي', () => {
  for (const { f, d } of docs) assert.ok(!/[﴿﴾]/.test(JSON.stringify(d)), f)
})

test('لا تكرار نص بين المراحل والشروح', () => {
  const seen = new Map()
  for (const { f, d } of docs)
    for (const s of d.stages)
      for (const k of ['title', 'body', 'illustrationBrief']) {
        const key = norm(s[k])
        const prev = seen.get(key)
        assert.ok(!prev, `${f}#${s.id}.${k} مكرر مع ${prev}`)
        seen.set(key, `${f}#${s.id}.${k}`)
      }
})
