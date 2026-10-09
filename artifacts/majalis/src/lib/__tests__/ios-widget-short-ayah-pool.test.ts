import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { WIDGET_AYAH_MAX_WORDS, WIDGET_SHORT_AYAH_POOL } from "../widget-daily-pool";

const pagesDir = "public/data/quran-v2/pages";
const allVerses = (() => {
  const map = new Map<string, string>();
  for (const f of readdirSync(pagesDir).sort()) {
    for (const v of JSON.parse(readFileSync(`${pagesDir}/${f}`, "utf8"))) {
      map.set(
        v.verse_key,
        v.words.filter((w: { char_type_name: string }) => w.char_type_name === "word").map((w: { text_uthmani: string }) => w.text_uthmani).join(" "),
      );
    }
  }
  return map;
})();

test("آيات ودجت الآية: قصيرة، حرفية من quran-v2، لاتينية الأرقام، بلا تكرار", () => {
  assert.ok(WIDGET_SHORT_AYAH_POOL.length >= 60, "مخزون كافٍ بلا تكرار قريب");
  assert.equal(new Set(WIDGET_SHORT_AYAH_POOL.map((a) => a.id)).size, WIDGET_SHORT_AYAH_POOL.length);
  for (const a of WIDGET_SHORT_AYAH_POOL) {
    assert.ok(a.text.trim().split(/\s+/).length <= WIDGET_AYAH_MAX_WORDS, a.id);
    const [, sura, num] = a.id.split("-");
    const key = `${sura}:${num}`;
    assert.equal(allVerses.get(key)?.trim(), a.text.trim(), `نص الآية يطابق المصدر المحمي حرفيًا: ${key}`);
  }
});
