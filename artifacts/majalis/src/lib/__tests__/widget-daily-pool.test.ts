/**
 * بوابة مخزون الويدجت اليومي — تشغيل: node --import tsx src/lib/__tests__/widget-daily-pool.test.ts
 * تتحقق أن كل آية حرفية من المصحف المعتمد وأن كل حديث صحيح موثّق في hadith-verified، وأن الانتقاء يدور.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { isWidgetReadyHadith, pickByDay } from "../widget-daily-pick.ts";

const root = new URL("../../../", import.meta.url);
const readJson = (rel: string) => JSON.parse(readFileSync(new URL(rel, root), "utf8"));
const pool = readJson("src/data/widget-daily-pool.generated.json") as {
  ayahs: { id: string; key: string; surah: string; ayahNumber: number; text: string; reference: string }[];
  hadiths: { id: string; text: string; narrator: string; source: string; grade: string }[];
};

// ── الآيات: حرفية من المصحف المعتمد ──
const quran = new Map<string, string>();
for (const f of readdirSync(new URL("public/data/quran-v2/pages/", root)).sort()) {
  for (const v of readJson(`public/data/quran-v2/pages/${f}`)) {
    quran.set(
      v.verse_key,
      v.words.filter((w: { char_type_name: string }) => w.char_type_name === "word")
        .map((w: { text_uthmani: string }) => w.text_uthmani).join(" "),
    );
  }
}
assert.ok(pool.ayahs.length >= 150, `مخزون الآيات ${pool.ayahs.length} < 150`);
const seenAyah = new Set<string>();
for (const a of pool.ayahs) {
  assert.equal(a.text, quran.get(a.key), `نص ${a.key} ليس حرفيًا من المصحف المعتمد`);
  assert.ok(!seenAyah.has(a.key), `آية مكررة ${a.key}`);
  seenAyah.add(a.key);
  assert.match(a.reference, /\d+:\d+$/, `${a.key}: مرجع غير صالح`);
  assert.ok(a.text.length >= 28 && a.text.length <= 170, `${a.key}: طول غير مناسب للويدجت`);
  assert.ok(a.text.split(" ").length >= 4, `${a.key}: آية مبتورة/قصيرة`);
}

// ── الأحاديث: موجودة في hadith-verified بدرجة «صحيح» ──
const verified = new Map<string, { text: string; grade: string }>();
for (const f of readdirSync(new URL("public/data/hadith-verified/", root)).filter((n) => /^sahih-\d+\.json$/.test(n))) {
  for (const r of readJson(`public/data/hadith-verified/${f}`)) verified.set(String(r.id), r);
}
assert.ok(pool.hadiths.length >= 200, `مخزون الأحاديث ${pool.hadiths.length} < 200`);
const seenH = new Set<string>();
for (const h of pool.hadiths) {
  const src = verified.get(h.id);
  assert.ok(src, `${h.id}: غير موجود في hadith-verified`);
  assert.equal(src.grade, "صحيح", `${h.id}: الدرجة ليست «صحيح»`);
  assert.equal(h.text, String(src.text).trim(), `${h.id}: نص الحديث غُيّر`);
  assert.ok(isWidgetReadyHadith(h), `${h.id}: ينقصه راوٍ/مصدر/درجة`);
  assert.ok(h.text.length <= 200, `${h.id}: أطول مما يتسع له الويدجت`);
  assert.ok(!seenH.has(h.id), `حديث مكرر ${h.id}`);
  seenH.add(h.id);
}

// ── الانتقاء ──
assert.equal(pickByDay([], 5), undefined);
assert.equal(pickByDay(["a", "b", "c"], 4), "b");
assert.equal(pickByDay(["a", "b", "c"], -1), "c");
const days = 120;
const uniq = new Set(Array.from({ length: days }, (_, i) => pickByDay(pool.hadiths, 20000 + i)!.id));
assert.equal(uniq.size, days, "حديث اليوم يتكرر خلال 120 يومًا");
assert.equal(isWidgetReadyHadith({ text: "x", source: "s", narrator: "n", grade: "حسن" }), false);

console.log(`widget-daily-pool: OK — ${pool.ayahs.length} آية، ${pool.hadiths.length} حديثًا`);
