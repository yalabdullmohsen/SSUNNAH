/**
 * إصلاحات المحتوى الآلية (تدقيق ن8): التحويل لا يمسّ إلا نمطه، والملفات المنظَّفة تبقى نظيفة.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { mapJsonStrings, RLM_SKELETON, stripRlm } from "../../../scripts/lib/content-mechanical.mjs";

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
const RLM_CLEAN = ["public/data/knowledge/quiz/batch-003.json"];
for (const f of RLM_CLEAN) assert.ok(!fs.readFileSync(f, "utf8").includes("\u200f"), `${f}: U+200F`);

console.log("content-mechanical: ok");
