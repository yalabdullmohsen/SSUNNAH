#!/usr/bin/env node
// تحذير (لا فشل) إن عدّل PR ملفات خارج ملكية صاحبه. الاستعمال: node scripts/native-ownership-check.mjs <branch> <base-ref>
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [branch = '', base = 'origin/native-app'] = process.argv.slice(2);
const win = (branch.match(/^(n[1-4])\//) || [])[1];
if (!win) { console.log(`فرع «${branch}» ليس n1..n4/ — لا فحص.`); process.exit(0); }
const md = readFileSync('docs/native/OWNERSHIP.md', 'utf8');
const owners = {}; let cur = null;
for (const line of md.split('\n')) {
  const h = line.match(/^## (n[1-4])\b/); if (h) { cur = h[1]; owners[cur] = []; continue; }
  if (line.startsWith('## ')) { cur = null; continue; }
  const m = cur && line.match(/^- `([^`]+)`/); if (m) owners[cur].push(m[1]);
}
const rx = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*') + '$');
const own = {}; for (const [w, gs] of Object.entries(owners)) own[w] = gs.map(rx);
const files = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean);
const foreign = [];
for (const f of files) {
  if (own[win].some(r => r.test(f))) continue;
  const o = Object.keys(own).find(w => w !== win && own[w].some(r => r.test(f)));
  if (o) foreign.push([f, o]);
}
for (const [f, o] of foreign) console.log(`::warning file=${f}::ملف ملكه ${o} يعدّله فرع ${win}/ — أضف «طلبًا» في docs/native/OWNERSHIP.md أو نسّق مع ${o}`);
console.log(`${win}: ${files.length} ملفًا، ${foreign.length} خارج الملكية (تحذير فقط).`);
