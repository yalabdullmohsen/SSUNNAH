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
  // طيّ ثانٍ لاختلاف الإملاء عن رسم المصحف (يبصط/يبسط، يبدؤا/يبدأ): يُجرَّب فقط عند انعدام التطابق الأول
  const fold2 = (s) => s.replace(/ص/g, 'س').replace(/[وي]/g, '')
  const folded = quran.map((s) => s.ay.map(fold2))
  const scan = (f, ays) => {
    const hits = []
    quran.forEach((s, si) => { const A = ays(si); for (let a = 0; a < A.length; a++) {
      let acc = ''
      for (let b = a; b < Math.min(A.length, a + maxSpan); b++) {
        acc += A[b]
        if (acc.includes(f)) { if (!A.slice(a + 1, b + 1).join('').includes(f) && !A.slice(a, b).join('').includes(f)) hits.push({ surah: s.n, from: a + 1, to: b + 1 }); break }
      }
    } })
    return hits
  }
  return function match(frag) {
    if (norm(frag).split(' ').length < minWords) return []
    const f = flat(frag); if (cache.has(f)) return cache.get(f)
    let hits = scan(f, (i) => quran[i].ay)
    if (!hits.length) hits = scan(fold2(f), (i) => folded[i])
    cache.set(f, hits); return hits
  }
}

const BISMILLAH = flat('بسم الله الرحمن الرحيم')
const surahName = (n, quran) => quran[n - 1].name
/** يحوّل كل ﴿شظية﴾ ذات موضع وحيد في المصحف إلى «(السورة: ن)» أو «(السورة: ن-م)»؛ الملتبس والمجهول يُترك كما هو (يُعدّ في stats). */
export function convertVerses(raw, quran, match, stats = { done: 0, ambiguous: 0, unmatched: 0 }) {
  return raw.replace(/﴿([^﴾]*)﴾/g, (all, frag) => {
    let f; try { f = JSON.parse('"' + frag.replace(/\\(?!["\\/bfnrtu])/g, '\\\\') + '"') } catch { stats.unmatched++; return all }
    const ws = f.trim().split(/\s+/)
    if (ws.length > 4 && flat(ws.slice(0, 4).join(' ')) === BISMILLAH) f = ws.slice(4).join(' ')
    const h = match(f)
    if (h.length === 0) { stats.unmatched++; return all }
    if (h.length > 1) {
      /* آية مكرّرة: تُذكر مواضعها كلها إن قلّت (≤3 سور و≤10 مواضع)؛ لا اختيار لموضع بالتخمين */
      const by = new Map(); for (const x of h) by.set(x.surah, [...(by.get(x.surah) || []), x.from + (x.to > x.from ? '-' + x.to : '')])
      if (by.size === 1 && h.length > 10) { stats.repeated = (stats.repeated || 0) + 1; return `(${surahName([...by.keys()][0], quran)})` }
      if (by.size > 3 || h.length > 10) { stats.ambiguous++; return all }
      stats.repeated = (stats.repeated || 0) + 1
      return `(${[...by].map(([s, v]) => `${surahName(s, quran)}: ${v.join('، ')}`).join('؛ ')})`
    }
    stats.done++
    const { surah, from, to } = h[0]
    return `(${surahName(surah, quran)}: ${from}${to > from ? '-' + to : ''})`
  })
}

/** سياق المدخل (tafsir-ayah-S-A / tafsir-surah-NNN) يعيّن الآية: ﴿…﴾ التي تطابق نصَّ تلك الآية بعينها (ولو كلمة أو كلمتين، أو مسبوقة بالبسملة) تُحوَّل لمرجعها؛ غير المطابق يُترك. */
export function convertByContext(raw, quran) {
  let d; try { d = JSON.parse(raw) } catch { return raw }
  if (!Array.isArray(d?.items)) return raw
  let changed = false
  for (const it of d.items) {
    const m = /^tafsir-(?:ayah-(\d+)-(\d+)|surah-(\d+))/.exec(it?.id ?? ''); if (!m || typeof it.body !== 'string' || !it.body.includes('﴿')) continue
    const s = Number(m[1] ?? m[3]), a = m[2] ? Number(m[2]) : 1; const ays = quran[s - 1]?.ay; if (!ays?.[a - 1]) continue
    it.body = it.body.replace(/﴿([^﴾]*)﴾/g, (all, frag) => {
      let f = frag.trim(); const ws = f.split(/\s+/)
      if (s === 1 && flat(f) === BISMILLAH) return changed = true, `(${surahName(1, quran)}: 1)`
      if (ws.length >= 4 && flat(ws.slice(0, 4).join(' ')) === BISMILLAH) f = ws.slice(4).join(' ')
      const tgt = s !== 1 && ays[a - 1].startsWith(BISMILLAH) ? ays[a - 1].slice(BISMILLAH.length) : ays[a - 1]
      if (f && flat(f) === tgt) { changed = true; return `(${surahName(s, quran)}: ${a})` }
      return all
    })
  }
  return changed ? JSON.stringify(d, null, /^[\[{]\n/.test(raw) ? 2 : 0) + (raw.endsWith('\n') ? '\n' : '') : raw
}
