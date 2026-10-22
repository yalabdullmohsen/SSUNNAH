#!/usr/bin/env node
// هل يُعفى PR من needs-owner؟ نعم فقط إن حمل وسم visually-verified، وفرعه nX/، وكان كل ملف محمي فيه ملكًا (في OWNERSHIP.md) لنافذة n1–n4 (نافذة الفرع أو نافذة أخرى: اختبارات حارس القرآن مثلًا لـn3 وPR الأنبياء من n1). ملف بلا مالك ⇒ needs-owner.
// الاستعمال: node scripts/native-owner-verified.mjs <branch> <labels-csv> < ملفات-محمية (سطر لكل ملف). يخرج 0 = أعفِه، 1 = أضف needs-owner.
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
const [branch = '', labels = ''] = process.argv.slice(2);
const win = (branch.match(/^(n[1-5])\//) || [])[1];
if (!win || !labels.split(',').includes('visually-verified')) process.exit(1);
// موافقة المالك الدائمة (orders/OWNER_APPROVAL.md): تُعفي PR فرعه nX/ وعليه visually-verified من needs-owner، إلا إن مسّ بيانات القرآن نفسها (نص/آيات/صفحات/خطوط QPC): ملف بيانات أو خط داخل Data/Resources أو مسار فيه quran|mushaf|qpc|ayah|ayat|pages|fonts. الواجهة (.swift وغيرها) تُعفى.
const approval = process.env.OWNER_APPROVAL_FILE || `${homedir()}/.majalis-tools/orders/OWNER_APPROVAL.md`;
const isQuranData = f => /\.(json|sqlite3?|db|ttf|otf|woff2?|txt|csv|bin|gz|plist)$/i.test(f) && /(^|\/)(ios-native\/Data|Resources)\/|quran|mushaf|qpc|ayah|ayat|pages|fonts/i.test(f);
const files = readFileSync(0, 'utf8').split('\n').filter(Boolean);
if (existsSync(approval) && files.length && !files.some(isQuranData)) process.exit(0);
const md = readFileSync(process.env.OWNERSHIP_MD || 'docs/native/OWNERSHIP.md', 'utf8');
const globs = []; let cur = null;
for (const line of md.split('\n')) {
  const h = line.match(/^## (n[1-4])\b/); if (h) { cur = h[1]; continue; }
  if (line.startsWith('## ')) { cur = null; continue; }
  const m = cur && line.match(/^- `([^`]+)`/); if (m) globs.push(m[1]);
}
const rx = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*') + '$');
const own = globs.map(rx);
process.exit(files.length && files.every(f => own.some(r => r.test(f))) ? 0 : 1);
