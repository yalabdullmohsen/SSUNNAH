/**
 * مطابِق «تسميع»: كشف فوري، خطأ، تجاوز، تجاهل ما قبل المؤشّر — على نص حقيقي (سورة الملك ١–٣).
 * تشغيل: node --import tsx src/lib/__tests__/tasmee-matcher.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TasmeeMatcher } from "../tasmee/matcher.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const page = JSON.parse(readFileSync(resolve(root, "public/data/quran-v2/pages/page-562.json"), "utf8")) as Array<{
  verse_key: string;
  verse_number: number;
  words: Array<{ char_type_name: string; position: number; text_uthmani: string; page_number: number; line_number: number }>;
}>;
const ref = page
  .filter((v) => v.verse_key.startsWith("67:") && v.verse_number <= 2)
  .flatMap((v) =>
    v.words.filter((w) => w.char_type_name === "word").map((w) => ({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani })),
  );
assert.ok(ref.length >= 20, `كلمات مرجعية: ${ref.length}`);
assert.match(ref[0]!.id, /^562:\d+:1$/, "معرّف page:line:position");
const spoken = "تبارك الذي بيده الملك وهو على كل شيء قدير الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور".split(" ");

console.log("=== كشف فوري كلمة بكلمة (نتائج جزئية تتراكم) ===");
{
  const m = new TasmeeMatcher(ref);
  const revealedAt: number[] = [];
  spoken.forEach((_, k) => {
    for (const e of m.ingest(spoken.slice(0, k + 1).join(" "), (k + 1) * 400)) {
      assert.equal(e.state, "correct");
      revealedAt[e.index] = e.timeMs;
    }
  });
  assert.equal(m.next, ref.length, "كُشفت كل الكلمات");
  assert.equal(m.state.filter((s) => s === "correct").length, ref.length);
  assert.equal(revealedAt[0], 400, "الكلمة الأولى فور نطقها (أول نتيجة جزئية)");
  assert.equal(revealedAt[3], 1600);
}

console.log("=== الألف الخنجرية: «تَبَٰرَكَ» تُطابق «تبارك» ===");
{
  const m = new TasmeeMatcher(ref);
  assert.equal(m.ingest("تبارك", 100)[0]?.state, "correct");
}

console.log("=== نافذة متحركة: نص يبدأ من منتصف ما كُشف لا يكسر المحاذاة ===");
{
  const m = new TasmeeMatcher(ref);
  m.ingest(spoken.slice(0, 6).join(" "), 1000);
  assert.equal(m.next, 5, "الكشف ضمن نافذة الكلمات الخمس القادمة فقط");
  const ev = m.ingest(spoken.slice(3, 9).join(" "), 2000); // النافذة تحوي كلمتين سبق كشفهما (٣،٤)
  assert.deepEqual(ev.map((e) => e.index), [5, 6, 7, 8]);
}

console.log("=== تجاوز: كلمة لم تُقرأ تُعلَّم «skipped» ولا يتوقف التسميع ===");
{
  const m = new TasmeeMatcher(ref);
  const words = [...spoken.slice(0, 4), ...spoken.slice(5, 9)]; // حذف الكلمة 5 (وهو)
  m.ingest(words.slice(0, 4).join(" "), 2500); // الكلمات الأربع الأولى بالتتابع
  assert.equal(m.next, 4);
  const ev = m.ingest(words.join(" "), 3000);
  assert.equal(m.state[4], "skipped");
  assert.equal(m.state[3], "correct");
  assert.equal(m.state[5], "correct", "ما بعد المتجاوزة يُكشف");
  assert.equal(ev.find((e) => e.index === 4)?.state, "skipped");
  assert.ok(m.next >= 8);
}

console.log("=== خطأ: كلمة مسموعة بعيدة عن المطلوبة تُعلَّم «wrong» ===");
{
  const m = new TasmeeMatcher(ref);
  const wrongOne = [...spoken.slice(0, 3), "الركب", ...spoken.slice(4, 8)]; // «الملك» ← «الركب»
  const ev = m.ingest(wrongOne.join(" "), 4000);
  assert.equal(m.state[3], "wrong");
  assert.equal(ev.find((e) => e.index === 3)?.state, "wrong");
  assert.equal(m.state[4], "correct", "ما بعد الخطأ يُكشف");
}

console.log("=== ضجيج: كلام خارج النص لا يكشف شيئًا ===");
{
  const m = new TasmeeMatcher(ref);
  assert.deepEqual(m.ingest("السلام عليكم ورحمة الله", 100), []);
  assert.equal(m.next, 0);
  assert.deepEqual(m.ingest("", 200), []);
}

console.log("=== استقرار: stableHyps=2 يؤخّر الكشف حتى تتكرر النتيجة ===");
{
  const m = new TasmeeMatcher(ref, { stableHyps: 2 });
  assert.deepEqual(m.ingest("تبارك الذي", 100), []);
  const ev = m.ingest("تبارك الذي بيده", 200);
  assert.ok(ev.length >= 1 && m.next >= 2);
}

console.log("tasmee-matcher.test.ts: ok");
