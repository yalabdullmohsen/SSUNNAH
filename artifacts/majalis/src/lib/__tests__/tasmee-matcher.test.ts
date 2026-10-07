/**
 * مطابِق «تسميع»: كشف فوري، خطأ، تجاوز، تجاهل ما قبل المؤشّر — على نص حقيقي (سورة الملك ١–٣).
 * تشغيل: node --import tsx src/lib/__tests__/tasmee-matcher.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TasmeeMatcher } from "../tasmee/matcher.ts";
import { paramsForStrictness, TASMEE_STRICTNESS_LABELS, TASMEE_STRICTNESS_LEVELS } from "../tasmee/levels.ts";

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


console.log("=== إعادة كلمة أو مقطع لا تُحتسب خطأً ولا يتوقف التتبع ===");
{
  // إعادة آخر كلمة (تردد): لا خطأ ولا تراجع
  const m = new TasmeeMatcher(ref);
  m.ingest(spoken.slice(0, 4).join(" "), 100);
  const ev = m.ingest([...spoken.slice(0, 4), spoken[3]!].join(" "), 200);
  assert.deepEqual(ev, [], "تكرار الكلمة الأخيرة لا يغيّر شيئًا");
  assert.equal(m.next, 4);
  assert.ok(m.state.slice(0, 4).every((x) => x === "correct"), "ما كُشف لا يتراجع");
  // إعادة مقطع كامل ثم المتابعة (التلميذ يبدأ الآية من أولها بعد تعثّر)
  const restart = [...spoken.slice(0, 4), ...spoken.slice(0, 4), ...spoken.slice(4, 8)].join(" ");
  const ev2 = m.ingest(restart, 300);
  assert.deepEqual(ev2.map((e) => `${e.index}:${e.state}`), ["4:correct", "5:correct", "6:correct", "7:correct"], "المتابعة بعد إعادة المقطع تُكشف صحيحة");
  assert.equal(m.state.filter((x) => x === "wrong" || x === "skipped").length, 0, "الإعادة ليست خطأً");
  // تردد: حشو «اااا/إمم» لا يؤثر
  const m2 = new TasmeeMatcher(ref);
  assert.deepEqual(m2.ingest("اااا امم", 10), []);
  m2.ingest(["اااا", spoken[0]!, "امم", spoken[1]!].join(" "), 20);
  assert.equal(m2.next, 2);
}

console.log("=== التصحيح الذاتي: خطأ ثم الصواب لا يُعدّ خطأً ===");
{
  // في نتيجة جزئية واحدة: كلمة خاطئة ثم الصحيحة
  const m = new TasmeeMatcher(ref);
  m.ingest(spoken.slice(0, 3).join(" "), 10);
  const ev = m.ingest([...spoken.slice(0, 3), "الركب", spoken[3]!].join(" "), 20);
  assert.equal(ev.find((e) => e.index === 3)?.state, "correct");
  assert.equal(m.state[3], "correct");
  assert.equal(m.state.filter((x) => x === "wrong").length, 0, "التصحيح الذاتي في الوقت نفسه ليس خطأً");
  // عبر نتيجتين: الخطأ وحده لا يحسم شيئًا، ثم يأتي الصواب
  const m2 = new TasmeeMatcher(ref);
  m2.ingest(spoken.slice(0, 3).join(" "), 10);
  assert.deepEqual(m2.ingest([...spoken.slice(0, 3), "الركب"].join(" "), 20), [], "الكلمة الخاطئة وحدها لا تُحسم بعد");
  const ev2 = m2.ingest([...spoken.slice(0, 3), "الركب", spoken[3]!, spoken[4]!].join(" "), 30);
  assert.deepEqual(ev2.map((e) => `${e.index}:${e.state}`), ["3:correct", "4:correct"]);
  assert.equal(m2.state.includes("wrong"), false);
  // وإن تابع دون تصحيح فالخطأ يُسجَّل (غير تصحيح ذاتي)
  const m3 = new TasmeeMatcher(ref);
  m3.ingest(spoken.slice(0, 3).join(" "), 10);
  m3.ingest([...spoken.slice(0, 3), "الركب", spoken[4]!].join(" "), 20);
  assert.equal(m3.state[3], "wrong");
}

console.log("=== مستويات الصرامة: متسامح · عادي · دقيق ===");
{
  assert.deepEqual([...TASMEE_STRICTNESS_LEVELS], ["lenient", "normal", "strict"]);
  assert.deepEqual(Object.values(TASMEE_STRICTNESS_LABELS), ["متسامح", "عادي", "دقيق"]);
  const fatiha = JSON.parse(readFileSync(resolve(root, "public/data/quran-v2/pages/page-001.json"), "utf8")) as typeof page;
  const fref = fatiha
    .filter((v) => v.verse_key === "1:1" || v.verse_key === "1:3")
    .flatMap((v) => v.words.filter((w) => w.char_type_name === "word").map((w) => ({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani })));
  // «الرحمن» ← «الرحيم» (قريبتا الشكل): تشابه ≈ 0.67
  const heard = "بسم الله الرحيم";
  const run = (level: "lenient" | "normal" | "strict", text: string) => {
    const m = new TasmeeMatcher(fref, paramsForStrictness(level));
    m.ingest(text, 1);
    return m;
  };
  const lenient = run("lenient", heard + " الرحيم");
  const normal = run("normal", heard + " الرحيم");
  assert.equal(lenient.state[2], "correct", "المتسامح يقبل الرحيم مكان الرحمن (تشابه 0.67 ≥ 0.6)");
  assert.notEqual(normal.state[2], "correct", "العادي لا يقبله");
  // كلمة طويلة بحرف ناقص (تشابه ≈ 0.83): العادي يقبل، الدقيق لا
  const longRef = [{ id: "x:1:1", text: "ٱلْعَزِيزُ" }, { id: "x:1:2", text: "ٱلْغَفُورُ" }];
  const n = new TasmeeMatcher(longRef, paramsForStrictness("normal"));
  n.ingest("العزيز الغفر", 1);
  assert.equal(n.state[1], "correct", "العادي: الغفر ≈ الغفور");
  const st = new TasmeeMatcher(longRef, paramsForStrictness("strict"));
  st.ingest("العزيز الغفر", 1);
  st.ingest("العزيز الغفر ثم", 2);
  assert.notEqual(st.state[1], "correct", "الدقيق لا يقبل نقص حرف");
  // الكلمات القصيرة تُطابَق تامة في كل المستويات
  for (const lvl of TASMEE_STRICTNESS_LEVELS) {
    const sm = new TasmeeMatcher([{ id: "y:1:1", text: "مِن" }], paramsForStrictness(lvl));
    assert.deepEqual(sm.ingest("عن", 1), [], `${lvl}: «عن» ليست «من»`);
  }
}

console.log("tasmee-matcher.test.ts: ok");
