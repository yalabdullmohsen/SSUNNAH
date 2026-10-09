import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ADHKAR_FADL, adhkarFadlBody } from '../adhkar-fadl';

const root = join(import.meta.dirname, '../../..');
const clean = (s: string) => s.normalize('NFC').replace(/‏/g, '').replace(/(^|\s)\.(?=\s|$)/g, ' ').replace(/\.(?=\s)/g, '').replace(/\s+/g, ' ').trim();
const stripMarks = (s: string) => s.replace(/[ً-ْٰ]/g, '');
const repo: Record<string, Map<number, string>> = {};
const load = (file: string) =>
  (repo[file] ??= new Map(
    (JSON.parse(readFileSync(join(root, file), 'utf8')).hadiths as { n: number; t: string }[]).map((h) => [h.n, clean(h.t)]),
  ));

assert.ok(ADHKAR_FADL.length >= 12, 'عدد الأزواج');
const ids = new Set<string>();
for (const it of ADHKAR_FADL) {
  const body = adhkarFadlBody(it);
  assert.ok(!ids.has(it.id), `معرّف مكرر ${it.id}`);
  ids.add(it.id);
  assert.notEqual(it.dhikr, body, `${it.id}: العنوان = النص`);
  assert.ok(body.startsWith('قال ﷺ: '), `${it.id}: بادئة`);
  assert.ok(stripMarks(body).length <= 160, `${it.id}: النص ${stripMarks(body).length} > 160`);
  assert.ok(it.source.trim() && it.grade.trim(), `${it.id}: لا مصدر/درجة مخزّنة`);
  for (const w of ['رواه', 'أخرجه', 'البخاري', 'مسلم', 'حدثنا', 'صحيح', 'عن أبي', it.source]) {
    assert.ok(!body.includes(w), `${it.id}: «${w}» في النص`);
  }
  // اللفظ حرفي: مقطع متصل من الرواية المخزّنة في المستودع.
  const full = load(it.repoFile).get(it.repoN);
  assert.ok(full, `${it.id}: الرواية غير موجودة`);
  assert.ok(full.includes(clean(it.fadl)), `${it.id}: اللفظ ليس مقطعًا حرفيًا من ${it.repoFile}#${it.repoN}`);
}
console.log(`adhkar-fadl: ${ADHKAR_FADL.length} زوجًا سليمًا`);
