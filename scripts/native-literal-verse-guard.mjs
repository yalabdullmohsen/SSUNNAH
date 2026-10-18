#!/usr/bin/env node
// سقف ﴿﴾ الحرفية: الآيات تُخزَّن مراجع (سورة/من/إلى) لا نصًا. يعدّ ﴿ في ios-native/Data لكل مجلد علوي.
// الاستعمال: node scripts/native-literal-verse-guard.mjs [--check] [--write-baseline]
// --check يفشل إن زاد العدد في أي مجلد عن docs/native/literal-verse-baseline.json (السقف يُخفَّض فقط). المحمي (mushaf/quran/tafsir/audio) مستثنى.
import fs from 'node:fs'
import path from 'node:path'
const root = new URL('..', import.meta.url).pathname
const data = path.join(root, 'ios-native/Data')
const baseFile = path.join(root, 'docs/native/literal-verse-baseline.json')
const SKIP = new Set(['mushaf', 'quran', 'audio', 'tafsir', 'MANIFEST.json'])
const files = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? files(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : [])
const out = {}
for (const f of files(data)) {
  const sec = path.relative(data, f).split(path.sep)[0]
  if (SKIP.has(sec)) continue
  const n = (fs.readFileSync(f, 'utf8').match(/﴿/g) ?? []).length
  if (n) { const c = (out[sec] ??= { files: 0, count: 0 }); c.files++; c.count += n }
}
let tf = 0, tc = 0
for (const [s, c] of Object.entries(out).sort()) { console.log(`${s.padEnd(14)} ملفات=${c.files} ﴿=${c.count}`); tf += c.files; tc += c.count }
console.log(`TOTAL          ملفات=${tf} ﴿=${tc}`)
if (process.argv.includes('--write-baseline')) fs.writeFileSync(baseFile, JSON.stringify(Object.fromEntries(Object.entries(out).map(([s, c]) => [s, c.count])), null, 2) + '\n')
if (process.argv.includes('--check')) {
  const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'))
  const bad = Object.entries(out).filter(([s, c]) => c.count > (base[s] ?? 0))
  if (bad.length) { console.error('زادت ﴿ الحرفية:', bad.map(([s, c]) => `${s} ${base[s] ?? 0}→${c.count}`).join(', ')); process.exit(1) }
}
