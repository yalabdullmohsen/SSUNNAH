/**
 * اختبار التلاوة بالذكاء الاصطناعي (أخطاء الحفظ فقط): تطبيع ومحاذاة، خدمة التفريغ، الخصوصية، والتوصيل.
 * node --import tsx src/lib/__tests__/recitation-test-ai-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const surahJson = (n: number) =>
  JSON.parse(read(`public/data/quran/surah-${String(n).padStart(3, "0")}.json`).replace(/^\uFEFF/, "")) as {
    ayahs: Array<{ numberInSurah: number; text: string }>;
  };

const { compareRecitation, editDistance, tokenizeSpoken, wordsMatch } = await import("../recitation-test/align.ts");
const { pickRecordingMime, MAX_RECORDING_MS, MIN_RECORDING_MS } = await import("../recitation-test/recorder.ts");

const strip = (t: string) => t.replace(/[ً-ٰٟۖ-ۭـ]/g, "").replace(/ٱ/g, "ا");
const ayahsOf = (n: number, from: number, to: number) =>
  surahJson(n).ayahs.filter((a) => a.numberInSurah >= from && a.numberInSurah <= to).map((a) => ({ ayah: a.numberInSurah, text: a.text }));

console.log("=== التطبيع: تشكيل/همزات/ألف خنجرية/ٱ/ى/تطويل ===");
{
  const fatiha = ayahsOf(1, 1, 7);
  // التفريغ الحقيقي يكتب «مالك» بألف صريحة (الرسم الإملائي) لا «ملك» كما يُنتجها حذف التشكيل الآلي
  const spoken = fatiha.map((a) => strip(a.text)).join(" ").replace(/(^| )ملك( |$)/g, "$1مالك$2");
  const full = compareRecitation(1, fatiha, spoken);
  assert.equal(full.accuracy, 100, `الفاتحة بلا تشكيل = 100% (${JSON.stringify(full.counts)})`);
  assert.deepEqual(full.ayahsWithErrors, []);
  // الألف الخنجرية: الرحمن/العالمين/مالك/ذلك/هذا تطابق كتابة حديثة
  const dag = compareRecitation(1, ayahsOf(1, 2, 4), "الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين");
  assert.equal(dag.counts.expected >= 9, true);
  assert.equal(dag.accuracy, 100, "الألف الخنجرية والهمزة الوصلية لا تُحتسب خطأ");
  // همزات/ى/ي
  assert.equal(compareRecitation(112, ayahsOf(112, 1, 4), "قل هو الله احد الله الصمد لم يلد ولم يولد ولم يكن له كفوا احد").accuracy, 100);
  // تطويل وفواصل ترقيم
  assert.equal(tokenizeSpoken("الحمد، لله. رب «العالمين»").length, 4);
}

console.log("=== الأخطاء: ناقصة وزائدة ومبدّلة ===");
{
  const ikhlas = ayahsOf(112, 1, 4);
  const base = ikhlas.map((a) => strip(a.text)).join(" ");
  // ناقصة: حذف «الصمد»
  const missing = compareRecitation(112, ikhlas, base.replace("الصمد", "").replace(/\s+/g, " ").trim());
  assert.equal(missing.counts.missing, 1);
  assert.equal(missing.counts.substituted + missing.counts.extra, 0);
  assert.deepEqual(missing.ayahsWithErrors, [2], "الآية الثانية فقط");
  assert.equal(missing.words.find((w) => w.status === "missing")?.ayah, 2);
  // زائدة: إضافة كلمة
  const extra = compareRecitation(112, ikhlas, base.replace("لم يلد", "لم يلد كثيرا"));
  assert.equal(extra.counts.extra, 1);
  assert.equal(extra.extras[0]!.text, "كثيرا");
  assert.ok(extra.accuracy === 100, "الزيادة لا تنقص الكلمات الصحيحة لكنها تُعرض");
  // مبدّلة: «ولد» بدل «يلد»
  const sub = compareRecitation(112, ikhlas, base.replace("لم يلد", "لم فعل"));
  assert.equal(sub.counts.substituted, 1);
  assert.equal(sub.words.find((w) => w.status === "substituted")?.heard, "فعل");
  assert.deepEqual(sub.ayahsWithErrors, [3]);
  // مزيج
  const mix = compareRecitation(112, ikhlas, "قل هو الله احد الصمد لم فعل ولم يولد ولم يكن له كفوا احد زيادة");
  assert.deepEqual([mix.counts.missing, mix.counts.substituted, mix.counts.extra], [1, 1, 1]);
  // بلا تلاوة
  const none = compareRecitation(112, ikhlas, "");
  assert.equal(none.accuracy, 0);
  assert.equal(none.counts.missing, none.counts.expected);
}

console.log("=== البسملة المنطوقة لا تُحتسب زيادة (عدا الفاتحة والتوبة) ===");
{
  const ik = ayahsOf(112, 1, 2);
  const withB = compareRecitation(112, ik, "بسم الله الرحمن الرحيم قل هو الله احد الله الصمد");
  assert.equal(withB.counts.extra, 0);
  assert.equal(withB.accuracy, 100);
  const fatiha = compareRecitation(1, ayahsOf(1, 1, 1), "بسم الله الرحمن الرحيم");
  assert.equal(fatiha.accuracy, 100, "في الفاتحة البسملة آية فعلية");
}

console.log("=== التسامح محدود: لا يخفي أخطاء الحفظ ===");
assert.equal(wordsMatch("الصمد", "الصمدد"), false, "قصيرة: لا تسامح");
assert.equal(wordsMatch("استكبروا", "استكبرو"), true, "طويلة: حرف واحد تسامح لضجيج التفريغ");
assert.equal(wordsMatch("استكبروا", "استكبرنا"), true);
assert.equal(wordsMatch("استكبروا", "استغفروا"), false, "كلمتان مختلفتان تُكشفان");
assert.equal(editDistance("كتب", "كتاب"), 1);

console.log("=== التسجيل: حدود وصيغ ===");
assert.equal(MAX_RECORDING_MS, 45_000);
assert.ok(MIN_RECORDING_MS >= 1000);
assert.equal(pickRecordingMime((m) => m === "audio/mp4"), "audio/mp4", "Safari/iOS");
assert.equal(pickRecordingMime((m) => m.startsWith("audio/webm")), "audio/webm;codecs=opus", "Chrome");
assert.equal(pickRecordingMime(() => false), "");

console.log("=== خدمة التفريغ: حدود وخصوصية ===");
{
  delete process.env.GROQ_API_KEY;
  const calls: Array<{ url: string; form?: FormData }> = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    if (String(url).includes("api.groq.com")) {
      calls.push({ url: String(url), form: init?.body as FormData });
      return new Response(JSON.stringify({ text: "قل هو الله احد" }), { status: 200 });
    }
    return realFetch(url, init);
  }) as typeof fetch;
  const { default: handler, MAX_AUDIO_BYTES, DAILY_LIMIT } = await import("../../../lib/api-handlers/recitation-transcribe.js");

  const call = async (method: string, body?: Record<string, unknown>, ip = "198.51.100.20") => {
    const cap: { status?: number; payload?: Record<string, unknown> } = {};
    const res = {
      statusCode: 200, headersSent: false, writableEnded: false,
      setHeader() {},
      status(c: number) { cap.status = c; return this; },
      json(p: Record<string, unknown>) { cap.payload = p; this.writableEnded = true; return this; },
      end(raw?: string) { this.writableEnded = true; if (raw && !cap.payload) { try { cap.payload = JSON.parse(raw); } catch { /* */ } } },
    };
    await handler({ method, headers: { "x-forwarded-for": ip }, body: body ?? {} }, res);
    return { status: cap.status ?? res.statusCode, ...(cap.payload ?? {}) } as Record<string, unknown> & { status: number };
  };
  const audio = Buffer.alloc(5000, 1).toString("base64");

  assert.equal((await call("GET")).configured, false);
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/webm" })).status, 503, "بلا مفتاح: غير مفعّلة بصدق");
  process.env.GROQ_API_KEY = "test-key";
  assert.equal((await call("GET")).configured, true);
  assert.equal((await call("POST", {})).status, 400);
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "video/mp4" })).status, 415, "صيغ غير صوتية مرفوضة");
  assert.equal((await call("POST", { audioBase64: Buffer.alloc(100).toString("base64"), mimeType: "audio/webm" })).status, 400, "قصير جدًا");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/webm", durationMs: 61_000 })).status, 400, "أطول من 60ث");
  assert.equal(
    (await call("POST", { audioBase64: Buffer.alloc(MAX_AUDIO_BYTES + 5000, 1).toString("base64"), mimeType: "audio/webm" })).status,
    413,
  );
  const ok = await call("POST", { audioBase64: audio, mimeType: "audio/webm;codecs=opus", durationMs: 8000 });
  assert.equal(ok.status, 200);
  assert.equal(ok.transcript, "قل هو الله احد");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.form?.get("model"), "whisper-large-v3");
  assert.equal(calls[0]!.form?.get("language"), "ar");
  assert.equal(calls[0]!.form?.has("prompt"), false, "لا نمرّر النص المتوقَّع للمزوّد فيُخفي الأخطاء");
  for (let i = 0; i < DAILY_LIMIT; i++) await call("POST", { audioBase64: audio, mimeType: "audio/webm" }, "203.0.113.50");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/webm" }, "203.0.113.50")).status, 429, "الحدّ اليومي");
  globalThis.fetch = realFetch;

  const src = read("lib/api-handlers/recitation-transcribe.js");
  assert.doesNotMatch(src, /from "node:fs"|from "fs"|writeFile|createWriteStream|\.from\("transcriptions"\)|supabase/i, "لا تخزين: لا ملفات ولا قاعدة بيانات");
  assert.doesNotMatch(src, /console\.(log|info)\(/, "لا تسجيل لمحتوى الصوت أو النص");
  assert.doesNotMatch(src, /console\.error\([^)]*(transcript|audio|body)/i);
}

console.log("=== الأمان والتوجيه ===");
{
  assert.match(read("lib/api-security-registry.mjs"), /"\/api\/recitation-transcribe":\s*"PUBLIC_WRITE"/);
  const d = read("lib/api-dispatch.mjs");
  assert.match(d, /prefix: "\/api\/recitation-transcribe"[\s\S]{0,260}maxBodyBytes: 3_000_000/);
  assert.match(d, /recitationTranscribeRateLimit = createRateLimiter\(\{[\s\S]{0,80}max: 6/, "حدّ الدقيقة");
}

console.log("=== الواجهة والتوصيل والخصوصية ===");
{
  const routes = read("src/AppRoutes.tsx");
  assert.match(routes, /path="\/quran\/recitation-test-ai"><SafeLazyRoute component=\{RecitationTestAiPage\}/);
  assert.doesNotMatch(routes, /recitation-test-ai"><Redirect/, "حُذف التحويل");
  assert.doesNotMatch(read("src/config/sections.registry.ts"), /from: "\/quran\/recitation-test-ai"/, "لا تحويل قديم في السجل");
  assert.match(read("src/lib/feature-registry.ts"), /id:\s*"recitation-test-ai"[^}]*status:\s*"active"/, "مسجّلة في feature-registry");
  assert.match(read("src/design-system/screens/QuranHubScreen.tsx"), /href="\/quran\/recitation-test-ai"/, "مدخل في تبويب القرآن");

  const page = read("src/pages/quran/RecitationTestAiPage.tsx");
  assert.match(page, /لا يقيّم أحكام التجويد/, "إعلان صريح: لا تجويد");
  assert.match(page, /لا يُخزَّن/, "إعلان الخصوصية في الواجهة");
  assert.match(page, /أخطاء <strong>الحفظ<\/strong> فقط/);
  assert.doesNotMatch(page, /localStorage|sessionStorage|indexedDB|createObjectURL|FileReader|saveAs/, "لا يحتفظ بالتسجيل");
  for (const word of ["ناقصة", "مبدّلة", "زائدة", "صحيحة"]) assert.match(page, new RegExp(word), `تسمية ${word}`);
  assert.match(page, /resolveCanonicalAyahHref/, "انتقال للآية في المصحف");
  assert.match(page, /NotAllowedError/, "معالجة رفض الميكروفون");

  const plist = read("ios/App/App/Info.plist");
  assert.match(plist, /<key>NSMicrophoneUsageDescription<\/key>\s*<string>[^<]*الميكروفون[^<]*<\/string>/, "وصف عربي لإذن الميكروفون");
  assert.doesNotMatch(plist, /NSSpeechRecognitionUsageDescription/, "لا تعرّف صوتي أصلي");

  const privacy = read("src/views/PrivacyPage.tsx");
  assert.match(privacy, /لا يُخزَّن التسجيل بعد المعالجة/);
  assert.doesNotMatch(privacy, /Apple Speech/, "نص الخصوصية القديم أُزيل");
}

console.log("recitation-test-ai-gate: ok");
