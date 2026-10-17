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
