// عرض الفوائد: (1) عنوان مقتطع لا ينتهي وسط كلمة (2) سطر المصدر لا يكرر نص الفائدة نفسه.
import assert from "node:assert/strict";
import fs from "node:fs";
import { titleOf } from "./native/lib/fawaid-title.mjs";
import { dedupSourceQuote, isDuplicateQuote } from "./native/lib/source-dedup.mjs";

const long = "صلاة الجماعة أفضل من صلاة الفذ بسبع وعشرين درجة، ففيها تظهر وحدة الأمة ويُضاعف الأجر بمشاركة المسلمين.";
assert.equal(titleOf("نص قصير"), "نص قصير");
const t = titleOf(long);
assert.ok(t.endsWith("…") && !/مشا…$/.test(t) && long.startsWith(t.slice(0, -1)), t);
assert.match(long.slice(t.length - 1), /^[\s،؛:.]/, "القصّ وسط كلمة: " + t);
assert.ok(titleOf("كلمة".repeat(40)).length <= 91);

const hadith = "المسلم من سلم المسلمون من لسانه ويده";
assert.equal(dedupSourceQuote(hadith, "صحيح مسلم (2699) عن أبي هريرة: «الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ»"), "صحيح مسلم (2699) عن أبي هريرة");
const fuller = "متفق عليه: «الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ»";
assert.equal(dedupSourceQuote(hadith, fuller), fuller, "اللفظ الأطول شاهد يبقى");
assert.equal(dedupSourceQuote(hadith, "بلا اقتباس (1)"), "بلا اقتباس (1)");

const f = new URL("../../../ios-native/Data/learn/fawaid.json", import.meta.url).pathname, file = process.env.NATIVE_FAWAID ?? f;
const bad = [];
if (fs.existsSync(file)) {
  for (const r of JSON.parse(fs.readFileSync(file, "utf8"))) {
    const ps = String(r.body ?? "").split(/\n\s*\n/), p0 = ps[0].replace(/\s+/g, " ").trim();
    if (r.title?.endsWith("…")) { const pre = r.title.slice(0, -1); if (!p0.startsWith(pre) || /^[\p{L}\p{M}]/u.test(p0.slice(pre.length))) bad.push(`${r.id}: عنوان ينتهي وسط كلمة «${r.title.slice(-14)}»`); }
    for (const q of ps.slice(1).join("\n").matchAll(/«([^»]+)»/g)) if (isDuplicateQuote(p0, q[1])) bad.push(`${r.id}: سطر المصدر يكرر نص الفائدة`);
  }
} else console.log("ios-native/Data غير مُولَّد — تخطٍّ");
assert.equal(bad.length, 0, `مخالفات عرض الفوائد (${bad.length}):\n${bad.slice(0, 10).join("\n")}`);
console.log("OK fawaid-display");
