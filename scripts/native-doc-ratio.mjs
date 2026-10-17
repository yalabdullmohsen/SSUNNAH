#!/usr/bin/env node
// قياس التوثيق: موثّق (مصدر برابط/مرجع) / جزئي (اسم مصدر بلا رابط) / بلا مصدر، لكل قسم وللمجموع.
// الاستعمال: node scripts/native-doc-ratio.mjs [--check] [--write-baseline]
// --check يفشل إن زاد عدد «بلا مصدر» في أي قسم عن docs/native/doc-ratio-baseline.json (لا يُرفع السقف).
import fs from 'node:fs'
import path from 'node:path'
const root = new URL('..', import.meta.url).pathname
const data = path.join(root, 'ios-native/Data')
const baseFile = path.join(root, 'docs/native/doc-ratio-baseline.json')
const hidden = JSON.parse(fs.readFileSync(path.join(root, 'docs/native/ios-hidden.json'), 'utf8'))
const hiddenSet = new Set(Object.keys(hidden.items ?? {}))
const str = (v) => typeof v === 'string' && v.trim().length > 1
const link = (o) => ['source_url', 'sourceUrl', 'url'].some((k) => str(o[k]))
const strong = (s) => s && typeof s === 'object' && (str(s.url) || str(s.ref) || str(s.reference))
const SKIP = new Set(['mushaf', 'quran', 'audio', 'tafsir', 'MANIFEST.json']) // نص محمي/هيكلي لا يُقاس هنا
function classify(r) {
  if (r.origin === 'editorial') return 'exempt' // قرار المالك 2026-10-16
  if (Array.isArray(r.sources) && r.sources.some(strong)) return 'doc'
  if (link(r) && ['source', 'source_name', 'sourceName', 'reference', 'ref'].some((k) => str(r[k]))) return 'doc'
  if (str(r.hadithSource) || str(r.reference) || str(r.ref) || str(r.source) || str(r.source_name) ||
      str(r.sourceName) || link(r) || (Array.isArray(r.sources) && r.sources.length)) return 'part'
  return 'none'
}
const out = {}
function walk(x, sec, file) {
  if (Array.isArray(x)) {
    for (const i of x) {
      if (i && typeof i === 'object' && !Array.isArray(i) && i.id != null && !i.hidden) {
        const key = `${path.relative(data, file)}/${i.id}`
        if (hiddenSet.has(key)) continue
        const c = (out[sec] ??= { doc: 0, part: 0, none: 0, exempt: 0 })
        c[classify(i)]++
      } else walk(i, sec, file)
    }
  } else if (x && typeof x === 'object') for (const v of Object.values(x)) walk(v, sec, file)
}
function files(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : [])
}
for (const f of files(data)) {
  const sec = path.relative(data, f).split(path.sep)[0]
  if (SKIP.has(sec)) continue
  try { walk(JSON.parse(fs.readFileSync(f, 'utf8')), sec, f) } catch {}
}
const tot = { doc: 0, part: 0, none: 0, exempt: 0 }
for (const c of Object.values(out)) for (const k of Object.keys(tot)) tot[k] += c[k]
const pct = (c) => { const n = c.doc + c.part + c.none || 1; return `${(100 * c.doc / n).toFixed(1)} / ${(100 * c.part / n).toFixed(1)} / ${(100 * c.none / n).toFixed(1)}` }
for (const [s, c] of Object.entries(out).sort()) console.log(`${s.padEnd(10)} n=${c.doc + c.part + c.none} معفى=${c.exempt}  موثّق/جزئي/بلا: ${pct(c)}  (بلا=${c.none})`)
console.log(`TOTAL      n=${tot.doc + tot.part + tot.none}  موثّق/جزئي/بلا: ${pct(tot)}  (بلا=${tot.none})`)
if (process.argv.includes('--write-baseline')) {
  fs.writeFileSync(baseFile, JSON.stringify(Object.fromEntries(Object.entries(out).map(([s, c]) => [s, c.none])), null, 2) + '\n')
}
if (process.argv.includes('--check')) {
  const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'))
  const bad = Object.entries(out).filter(([s, c]) => c.none > (base[s] ?? 0))
  if (bad.length) { console.error('زاد «بلا مصدر»:', bad.map(([s, c]) => `${s} ${base[s] ?? 0}→${c.none}`).join(', ')); process.exit(1) }
}
