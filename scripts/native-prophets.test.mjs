// اختبار ملفات الأنبياء: 25 نبيًّا بلا تكرار، لا قوالب مكررة، لا ﴿﴾، الآيات مراجع فقط، لا قسم بلا مصدر.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../artifacts/majalis/public/data/knowledge/prophets");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
const items = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) }));
const TEMPLATES = ["أصل الدعوة", "المعجزات والآيات البينات", "ملاحظة منهجية", "الزمان والمكان"];

test("25 نبيًّا قرآنيًّا بلا تكرار", () => {
  assert.equal(items.length, 25);
  assert.equal(new Set(items.map((x) => x.d.meta?.slug ?? x.f)).size, 25);
  assert.equal(new Set(items.map((x) => x.d.meta?.name_ar ?? x.d.title ?? x.f)).size, 25);
});

test("لا قوالب مكررة ولا نص آية حرفي ﴿﴾", () => {
  for (const { f } of items) {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    assert.ok(!/[﴿﴾]/.test(raw), `${f}: نص آية حرفي`);
    for (const t of TEMPLATES) assert.ok(!raw.includes(t), `${f}: قالب مكرر «${t}»`);
  }
});

test("الآيات مراجع فقط وكل قسم له مصدر", () => {
  for (const { f, d } of items) {
    assert.ok(d.sections?.length > 0, `${f}: بلا أقسام`);
    for (const s of d.sections) assert.ok(s.sources?.length > 0, `${f}/${s.key}: قسم بلا مصدر`);
    for (const e of d.evidences ?? []) {
      assert.equal(e.text, "", `${f}: نص آية`);
      assert.ok(Number.isInteger(e.surah) && Number.isInteger(e.from) && Number.isInteger(e.to), `${f}: مرجع ناقص`);
    }
  }
});
