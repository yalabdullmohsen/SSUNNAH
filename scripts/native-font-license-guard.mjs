#!/usr/bin/env node
// حارس الخطوط المضمَّنة: كل ملف خط مُتتبَّع في git يلزمه سطر في docs/LICENSES.md وdocs/store-release/THIRD_PARTY_NOTICES.md،
// وكل خط داخل PrayerWidget/Fonts يلزمه إدخال في UIAppFonts بـPrayerWidget/Info.plist.
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename, dirname } from 'node:path'

const files = execSync('git ls-files', { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter((f) => /\.(ttf|otf|woff2?)$/i.test(f))
const docs = ['docs/LICENSES.md', 'docs/store-release/THIRD_PARTY_NOTICES.md'].map((p) => [p, readFileSync(p, 'utf8').toLowerCase()])
const plist = readFileSync('artifacts/majalis/ios/App/PrayerWidget/Info.plist', 'utf8')
const bad = []
// الوحدة = مجلد الخط؛ يكفي ذكر مساره أو اسم مجلده الأخير أو اسم ملف أحد خطوطه في السجل
const dirs = new Map()
for (const f of files) { if (!dirs.has(dirname(f))) dirs.set(dirname(f), []); dirs.get(dirname(f)).push(basename(f)) }
for (const [dir, names] of dirs) {
  const last = basename(dir).toLowerCase()
  for (const [p, txt] of docs) {
    if (!txt.includes(dir.toLowerCase()) && !txt.includes(last) && !names.some((n) => txt.includes(n.toLowerCase()))) bad.push(`خطوط «${dir}» بلا سطر في ${p}`)
  }
}
for (const f of files.filter((x) => x.includes('PrayerWidget/Fonts/'))) {
  if (!plist.includes(`<string>${basename(f)}</string>`)) bad.push(`${basename(f)} غير مسجّل في UIAppFonts بـPrayerWidget/Info.plist`)
}
if (bad.length) { console.error(bad.map((b) => `✗ ${b}`).join('\n')); process.exit(1) }
console.log(`✓ ${files.length} ملف خط (${dirs.size} مجلد) موثّقة في السجلين`)
