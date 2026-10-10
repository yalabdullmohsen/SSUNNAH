/**
 * إصلاحات المحتوى الآلية (تدقيق ن8): التحويل لا يمسّ إلا نمطه، والملفات المنظَّفة تبقى نظيفة.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { DIGITS_SKELETON, latinDigits, mapJsonStrings, RLM_SKELETON, stripRlm, titleIdToRef, hadithTitleRef, TITLE_ID_SKELETON } from "../../../scripts/lib/content-mechanical.mjs";

/* U+200F: يُحذف مع مسافاته عند علامات الفتح/الإغلاق وطرفي النص، ويبقى بين كلمتين مسافة واحدة */
const rlm: Array<[string, string]> = [
  ["حديث x: \u200f يُقْبَضُ الْعِلْمُ", "حديث x: يُقْبَضُ الْعِلْمُ"],
  ["«\u200f يُقْبَضُ»", "«يُقْبَضُ»"],
  ['\\"\u200f لا\\"', '\\"لا\\"'],
  ["بِالْمَاءِ \u200f.", "بِالْمَاءِ."],
  ["الْعِلْمُ \u200f \u200f وَيَظْهَرُ", "الْعِلْمُ وَيَظْهَرُ"],
  ["\u200f بداية ونهاية \u200f", "بداية ونهاية"],
  ["بلا علامة  مسافتان", "بلا علامة  مسافتان"],
];
for (const [input, want] of rlm) {
  const got = stripRlm(input);
  assert.equal(got, want);
  assert.equal(RLM_SKELETON(got), RLM_SKELETON(input), "لا تغيير خارج المسافات وU+200F");
}

/* التطبيق على JSON خام: المفاتيح والهروب والتنسيق كما هي */
const raw = '{\n  "a": "\u200f نص \\"x\\"",\n  "b": 1\n}\n';
assert.equal(mapJsonStrings(raw, stripRlm), '{\n  "a": "نص \\"x\\"",\n  "b": 1\n}\n');

/* الملفات المنظَّفة: لا U+200F */
const RLM_CLEAN = ["public/data/knowledge/quiz/batch-003.json", "public/data/knowledge/quiz/batch-005.json"];
for (const f of RLM_CLEAN) assert.ok(!fs.readFileSync(f, "utf8").includes("\u200f"), `${f}: U+200F`);

/* batch-004 \u0645\u0642\u0633\u0648\u0645 \u0639\u0644\u0649 PR\u064a\u0646 (\u062d\u062f 400 \u0633\u0637\u0631 \u0645\u062d\u0630\u0648\u0641): \u0627\u0644\u0623\u0633\u0637\u0631 1\u20136605 \u0646\u0638\u064a\u0641\u0629 */
const b004 = fs.readFileSync("public/data/knowledge/quiz/batch-004.json", "utf8").split("\n").slice(0, 6605).join("\n");
assert.ok(!b004.includes("\u200f"), "batch-004 (1\u20136605): U+200F");

/* الأرقام الهندية → لاتينية خارج ﴿…﴾ فقط؛ نص الآية لا يُمسّ */
const digits: Array<[string, string]> = [
  ["النساء: ٥٩", "النساء: 59"],
  ["۱۲ سؤالًا", "12 سؤالًا"],
  ["﴿ وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ١٦٣ ﴾ [البقرة: ١٦٣]", "﴿ وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ١٦٣ ﴾ [البقرة: 163]"],
  ["٢ ﴿ ٣ ﴾ ٤ ﴿ ٥", "2 ﴿ ٣ ﴾ 4 ﴿ ٥"],
  ["بلا أرقام", "بلا أرقام"],
];
for (const [input, want] of digits) {
  const got = latinDigits(input);
  assert.equal(got, want);
  assert.equal(DIGITS_SKELETON(got), DIGITS_SKELETON(input), "لا تغيير خارج الأرقام، و﴿…﴾ حرفيًا");
}
assert.notEqual(DIGITS_SKELETON("﴿ ١ ﴾"), DIGITS_SKELETON("﴿ 1 ﴾"), "الهيكل يكشف أي مساس بما داخل ﴿…﴾");

/* ملفات qa/quiz: لا رقم هندي خارج ﴿…﴾ */
for (const dir of ["public/data/qa", "public/data/quiz", "public/data/knowledge/quiz"]) {
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const s = fs.readFileSync(`${dir}/${name}`, "utf8").replace(/﴿[^﴾]*(?:﴾|$)/gm, "");
    assert.ok(!/[٠-٩۰-۹]/.test(s), `${dir}/${name}: رقم هندي خارج ﴿…﴾`);
  }
}

const TITLE_ID_CLEAN = ["public/data/knowledge/quiz/batch-003.json"];

/* المعرّف الداخلي في عنوان سؤال الحديث يُستبدل بمرجع المصدر وحده؛ ما بعده حرفيًا */
const refs: Array<[string, string]> = [
  ["البخاري 405", "البخاري 405"],
  ["صحيح البخاري (6) وصحيح مسلم (7)", "البخاري 6 ومسلم 7"],
  ["سنن الترمذي (2) وقال: حسن صحيح؛ وأبو داود (3)", "الترمذي 2"],
  ["صحيح مسلم (9) — هذا اللفظ الصحيح؛ أما «x» فضعيف", "مسلم 9"],
];
for (const [book, want] of refs) assert.equal(hadithTitleRef(book), want);
const titleIds: Array<[string, string]> = [
  ["حديث sahih-fill-309: مَا رَأَيْتُ", "حديث (البخاري 1): مَا رَأَيْتُ"],
  ["حديث sahih-b3-513:", "حديث (البخاري 1)"],
  ["حديث: بلا معرّف", "حديث: بلا معرّف"],
  ["قال: حديث sahih-b3-1: لا يُمسّ وسط النص", "قال: حديث sahih-b3-1: لا يُمسّ وسط النص"],
  ["آية 7:135", "آية 7:135"],
];
for (const [input, want] of titleIds) {
  const got = titleIdToRef(input, "البخاري 1");
  assert.equal(got, want);
  assert.equal(TITLE_ID_SKELETON(got), TITLE_ID_SKELETON(input), "لا تغيير خارج بادئة المعرّف");
}
assert.notEqual(TITLE_ID_SKELETON("حديث: أ"), TITLE_ID_SKELETON("حديث: ب"), "الهيكل يكشف أي مساس بالنص");

/* الملفات المنظَّفة: لا عنوان بمعرّف داخلي، والعناوين فريدة (بوابة test:content-quality) */
for (const f of TITLE_ID_CLEAN) {
  const titles: string[] = JSON.parse(fs.readFileSync(f, "utf8")).items.map((q: { title: string }) => q.title);
  assert.equal(titles.filter((t) => /^حديث [a-z]/.test(t)).length, 0, `${f}: معرّف داخلي في العنوان`);
  assert.equal(new Set(titles).size, titles.length, `${f}: عنوان مكرر`);
}

console.log("content-mechanical: ok");
