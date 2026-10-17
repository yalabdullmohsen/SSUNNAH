#!/usr/bin/env node
// هل يُعفى PR من needs-owner؟ نعم فقط إن حمل وسم visually-verified وكان كل ملف محمي فيه ملكًا (في OWNERSHIP.md) للنافذة صاحبة الفرع nX/.
// الاستعمال: node scripts/native-owner-verified.mjs <branch> <labels-csv> < ملفات-محمية (سطر لكل ملف). يخرج 0 = أعفِه، 1 = أضف needs-owner.
import { readFileSync } from 'node:fs';
const [branch = '', labels = ''] = process.argv.slice(2);
const win = (branch.match(/^(n[1-4])\//) || [])[1];
if (!win || !labels.split(',').includes('visually-verified')) process.exit(1);
const md = readFileSync(process.env.OWNERSHIP_MD || 'docs/native/OWNERSHIP.md', 'utf8');
const globs = []; let cur = null;
for (const line of md.split('\n')) {
  const h = line.match(/^## (n[1-4])\b/); if (h) { cur = h[1]; continue; }
  if (line.startsWith('## ')) { cur = null; continue; }
  const m = cur === win && line.match(/^- `([^`]+)`/); if (m) globs.push(m[1]);
}
const rx = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*') + '$');
const own = globs.map(rx);
const files = readFileSync(0, 'utf8').split('\n').filter(Boolean);
process.exit(files.length && files.every(f => own.some(r => r.test(f))) ? 0 : 1);
