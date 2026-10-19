// اختبار مطابِق ﴿…﴾: الوحيد يتحوّل لمرجع، والملتبس/المجهول يبقى، والمدى عبر آيتين.
import test from 'node:test'
import assert from 'node:assert/strict'
import { loadQuran, makeMatcher, convertVerses } from '../artifacts/majalis/scripts/native/lib/verse-match.mjs'
const q = loadQuran(new URL('../artifacts/majalis/public/data/quran', import.meta.url).pathname)
const m = makeMatcher(q)
const conv = (s) => { const st = { done: 0, ambiguous: 0, unmatched: 0 }; return [convertVerses(s, q, m, st), st] }
test('وحيد → مرجع', () => { const [o, s] = conv('قال ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ ثم'); assert.match(o, /^قال \(الإخلاص: 1\) ثم$/); assert.equal(s.done, 1) })
test('ملتبس يبقى', () => { const [o, s] = conv('﴿إِنَّ اللَّهَ عَزِيزٌ حَكِيمٌ﴾'); assert.equal(o, '﴿إِنَّ اللَّهَ عَزِيزٌ حَكِيمٌ﴾'); assert.equal(s.ambiguous, 1) })
test('مجهول يبقى', () => { const [o, s] = conv('﴿كلام ليس من القرآن أبدا﴾'); assert.match(o, /﴿/); assert.equal(s.unmatched, 1) })
test('مكرّرة بمواضع قليلة تُذكر مواضعها كلها', () => { const [o, s] = conv('﴿إِنِّى لَكُمْ رَسُولٌ أَمِينٌ﴾'); assert.match(o, /^\(الشعراء: 107، 125/); assert.doesNotMatch(o, /﴿/); assert.equal(s.repeated, 1) })
import { convertByContext } from '../artifacts/majalis/scripts/native/lib/verse-match.mjs'
test('سياق الآية: مطابقة نص الآية نفسها تتحوّل ولو قصيرة، وغيرها يبقى', () => {
  const raw = JSON.stringify({ items: [
    { id: 'tafsir-ayah-78-4', body: '## النص\n﴿كَلَّا سَيَعْلَمُونَ﴾\n' },
    { id: 'tafsir-ayah-78-4', body: '## النص\n﴿وَٱلْجِبَالَ أَوْتَادًۭا﴾\n' },
    { id: 'tafsir-surah-001', body: '﴿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ﴾' },
    { id: 'tafsir-surah-002', body: '﴿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ﴾' },
    { id: 'tafsir-surah-002', body: '﴿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓصٓ﴾' }] }, null, 2) + '\n'
  const it = JSON.parse(convertByContext(raw, q)).items
  assert.match(it[0].body, /^## النص\n\(النبإ: 4\)/); assert.match(it[1].body, /﴿/)
  assert.equal(it[2].body, '(الفاتحة: 1)'); assert.equal(it[3].body, '(البقرة: 1)'); assert.match(it[4].body, /﴿/)
})
