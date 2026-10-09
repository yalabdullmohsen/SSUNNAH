/**
 * بوابة المصادر: كل نوع محتوى يظهر في التطبيق (مجلدات public/data وأقسام sections.registry)
 * يجب أن يملك مدخلًا في src/data/content-sources.ts؛ ولا ترخيص مفتوح لما لم يُحسم.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  CONTENT_TYPES,
  COPYRIGHT_NOTICE,
  DATA_DIR_CONTENT,
  RIGHTS_SENTENCE,
  SECTION_CONTENT,
  unknownLicenseEntries,
} from "../../data/content-sources";

const root = path.resolve(import.meta.dirname, "../../..");
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

const typeIds = new Set(CONTENT_TYPES.map((t) => t.id));

// 1) كل نوع له مدخل واحد على الأقل بحقول كاملة
for (const t of CONTENT_TYPES) {
  assert.ok(t.entries.length > 0, `نوع المحتوى بلا مصدر: ${t.id}`);
  for (const e of t.entries) {
    assert.ok(e.name && e.took && e.license, `مدخل ناقص في ${t.id}: ${e.name}`);
    if (e.url) assert.match(e.url, /^https:\/\//, `رابط غير آمن: ${e.url}`);
  }
}

// 2) كل مجلد/ملف في public/data مُصنَّف
const dataDir = path.join(root, "public/data");
for (const name of fs.readdirSync(dataDir)) {
  const t = DATA_DIR_CONTENT[name];
  assert.ok(t, `public/data/${name} بلا نوع محتوى في content-sources.ts (DATA_DIR_CONTENT)`);
  assert.ok(t === "technical" || typeIds.has(t), `نوع غير معروف لـ ${name}: ${t}`);
}

// 3) كل قسم في السجل مُصنَّف
const registry = read("src/config/sections.registry.ts");
const ids = [...registry.matchAll(/^\s{2,6}id:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
assert.ok(ids.length > 50, "تعذّر استخراج معرّفات الأقسام");
for (const id of new Set(ids)) {
  const t = SECTION_CONTENT[id];
  assert.ok(t, `القسم «${id}» بلا نوع محتوى في SECTION_CONTENT`);
  assert.ok(t === "none" || typeIds.has(t), `نوع غير معروف للقسم ${id}: ${t}`);
}

// 4) لا ادّعاء ترخيص مفتوح لمصدر غير محسوم، وعدم ظهور CC0/MIT في مدخل unknown
for (const e of unknownLicenseEntries()) {
  assert.doesNotMatch(e.license, /^(MIT|CC0|Apache|ISC|OFL)/, `ادّعاء ترخيص مفتوح لمصدر غير محسوم: ${e.name}`);
}

// 5) الجملة الحرفية والتذييل
assert.equal(
  RIGHTS_SENTENCE,
  "ما أنشأناه في سُنّة حقوقه غير محفوظة لوجه الله، وما نقلناه عن المصادر المذكورة تعود حقوقه لأصحابه وفق تراخيصهم",
);
assert.equal(COPYRIGHT_NOTICE, "الحقوق غير محفوظة — لوجه الله");
assert.match(read("src/components/SiteFooter.tsx"), /COPYRIGHT_NOTICE/);
assert.doesNotMatch(read("src/components/SiteFooter.tsx"), /©/);
assert.match(read("src/pages/sources/SourcesDirectoryPage.tsx"), /RIGHTS_SENTENCE/);
assert.match(read("src/views/SourcesLicensesPage.tsx"), /RIGHTS_SENTENCE/);
assert.match(read("src/views/SourcesLicensesPage.tsx"), /CONTENT_TYPES/);

console.log("content-sources-gate: ok");
