#!/usr/bin/env node
/**
 * يطبّق إصلاحًا آليًا من lib/content-mechanical.mjs على ملفات بيانات، ويرفض الكتابة إن تغيّر الهيكل خارج النمط.
 * الاستعمال: node scripts/content-mechanical-fix.mjs <rlm|digits|title-id> [--lines a-b] <ملف.json>...
 * --lines: يقصر الإصلاح على أسطر محددة لتقسيم ملف كبير على أكثر من PR (حد 400 سطر محذوف).
 */
import fs from "node:fs";
import { stripRlm, mapJsonStrings, RLM_SKELETON, latinDigits, DIGITS_SKELETON, stripTitleId, TITLE_ID_SKELETON } from "./lib/content-mechanical.mjs";

const FIXES = {
  rlm: { fn: stripRlm, skeleton: RLM_SKELETON },
  digits: { fn: latinDigits, skeleton: DIGITS_SKELETON },
  "title-id": { fn: stripTitleId, skeleton: TITLE_ID_SKELETON },
};
const args = process.argv.slice(2);
const li = args.indexOf("--lines");
const [lo, hi] = li < 0 ? [1, Infinity] : args.splice(li, 2)[1].split("-").map(Number);
const [kind, ...files] = args;
const fix = FIXES[kind];
if (!fix || !files.length) {
  console.error(`الاستعمال: content-mechanical-fix.mjs <${Object.keys(FIXES).join("|")}> <files…>`);
  process.exit(2);
}
let fields = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  /* بدايات الأسطر مرة واحدة لكل ملف: رقم سطر الحقل ببحث ثنائي (لا مسح من أول الملف لكل حقل) */
  const starts = li < 0 ? null : [0, ...[...raw.matchAll(/\n/g)].map((m) => m.index + 1)];
  const lineAt = (at) => {
    let [a, b] = [0, starts.length - 1];
    while (a < b) {
      const m = (a + b + 1) >> 1;
      if (starts[m] <= at) a = m;
      else b = m - 1;
    }
    return a + 1;
  };
  const next = mapJsonStrings(raw, (body, at) => {
    if (starts && (lineAt(at) < lo || lineAt(at) > hi)) return body;
    const out = fix.fn(body);
    if (out !== body) {
      fields += 1;
      if (fix.skeleton(out) !== fix.skeleton(body)) throw new Error(`${f}: تغيّر خارج النمط: ${body.slice(0, 60)}`);
    }
    return out;
  });
  JSON.parse(next);
  if (next !== raw) fs.writeFileSync(f, next);
}
console.log(`${kind}: ${fields} حقلًا في ${files.length} ملفات`);
