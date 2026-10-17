// مطابِق شظايا ﴿…﴾ مع نص المصحف المحمي (قراءة فقط من public/data/quran/surah-NNN.json): يعيد مواضع (سورة، من، إلى) أو يرفض عند الغموض.
// التطبيع: حذف التشكيل وعلامات المصحف والألف والهمزات والمسافات، فيتطابق «العالمين» مع «ٱلْعَٰلَمِينَ» و«يا أيها» مع «يَٰٓأَيُّهَا».
import fs from 'node:fs'
import path from 'node:path'
export const norm = (s) => s.replace(/[ً-ٰٟۖ-ۭـ﻿‌-‏]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '').replace(/ة/g, 'ه').replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim()
const flat = (s) => norm(s).replace(/ا/g, '').replace(/ /g, '')
export function loadQuran(dir) {
  const out = []
  for (let i = 1; i <= 114; i++) { const d = JSON.parse(fs.readFileSync(path.join(dir, `surah-${String(i).padStart(3, '0')}.json`), 'utf8')); out.push({ n: i, name: d.name.replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/ٱ/g, 'ا').replace(/^سورة\s+/, '').replace(/^ال (?=عمران)/, 'آل ').trim(), ay: d.ayahs.map((a) => flat(a.text)) }) }
  return out
}
export function makeMatcher(quran, { minWords = 3, maxSpan = 8 } = {}) {
  const cache = new Map()
  return function match(frag) {
    if (norm(frag).split(' ').length < minWords) return []
    const f = flat(frag); if (cache.has(f)) return cache.get(f)
    const hits = []
    for (const s of quran) for (let a = 0; a < s.ay.length; a++) {
      let acc = ''
      for (let b = a; b < Math.min(s.ay.length, a + maxSpan); b++) {
        acc += s.ay[b]
        if (acc.includes(f)) { if (!s.ay.slice(a + 1, b + 1).join('').includes(f) && !s.ay.slice(a, b).join('').includes(f)) hits.push({ surah: s.n, from: a + 1, to: b + 1 }); break }
      }
    }
    cache.set(f, hits); return hits
  }
}

const surahName = (n, quran) => quran[n - 1].name
/** يحوّل كل ﴿شظية﴾ ذات موضع وحيد في المصحف إلى «(السورة: ن)» أو «(السورة: ن-م)»؛ الملتبس والمجهول يُترك كما هو (يُعدّ في stats). */
export function convertVerses(raw, quran, match, stats = { done: 0, ambiguous: 0, unmatched: 0 }) {
  return raw.replace(/﴿([^﴾]*)﴾/g, (all, frag) => {
    let f; try { f = JSON.parse('"' + frag.replace(/\\(?!["\\/bfnrtu])/g, '\\\\') + '"') } catch { stats.unmatched++; return all }
    const h = match(f)
    if (h.length === 0) { stats.unmatched++; return all }
    if (h.length > 1) { stats.ambiguous++; return all }
    stats.done++
    const { surah, from, to } = h[0]
    return `(${surahName(surah, quran)}: ${from}${to > from ? '-' + to : ''})`
  })
}
