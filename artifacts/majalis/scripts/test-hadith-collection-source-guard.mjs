#!/usr/bin/env node
/**
 * بوابة: أي حديث في public/data/hadith-verified/ حقل collection فيه mutafaq أو bukhari أو muslim
 * يجب أن يبدأ source_name بصحيح البخاري أو صحيح مسلم (وإلا ظهر تحت عنوان «متفق عليه» في السجل وهو من كتاب آخر).
 * آلية بلا مصدر خارجي؛ التصحيح بتغيير collection فقط وفق أول كتاب مذكور.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { firstBookCollection, SAHIHAYN_COLLECTIONS } from "./lib-hadith-first-book.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../public/data/hadith-verified");
const bad = [];
let checked = 0;
for (const f of readdirSync(dir).filter((x) => /^(sahih|daif|mawdu)-\d+\.json$/.test(x))) {
  for (const h of JSON.parse(readFileSync(join(dir, f), "utf8"))) {
    if (!SAHIHAYN_COLLECTIONS.has(h.collection)) continue;
    checked++;
    const first = firstBookCollection(h.source_name);
    if (first !== "bukhari" && first !== "muslim") {
      bad.push(`${f} ${h.id}: collection=${h.collection} لكن source_name="${h.source_name}" → ${first}`);
    }
  }
}
if (bad.length) {
  console.error(`✗ ${bad.length} حديثًا collection فيه صحيحيّ والمصدر كتاب آخر:\n  ` + bad.join("\n  "));
  process.exit(1);
}
console.log(`hadith-collection-source-guard: OK — ${checked} حديثًا`);
