/**
 * اختبار التلاوة بالذكاء الاصطناعي (أخطاء الحفظ فقط): تطبيع ومحاذاة، خدمة التفريغ، الخصوصية، والتوصيل.
 * node --import tsx src/lib/__tests__/recitation-test-ai-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fmp4, oggOpus, wav, webm, webmUnreadable } from "./fixtures/audio-fixtures.ts";
const { probeAudio } = await import("../../../lib/audio-duration.mjs");

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
  const { default: handler, MAX_AUDIO_BYTES, DAILY_LIMIT, MAX_REQUEST_BYTES } = await import("../../../lib/api-handlers/recitation-transcribe.js");

  const call = async (method: string, body?: Record<string, unknown>, ip = "198.51.100.20", extraHeaders: Record<string, string> = {}) => {
    const cap: { status?: number; payload?: Record<string, unknown> } = {};
    const res = {
      statusCode: 200, headersSent: false, writableEnded: false,
      setHeader() {},
      status(c: number) { cap.status = c; return this; },
      json(p: Record<string, unknown>) { cap.payload = p; this.writableEnded = true; return this; },
      end(raw?: string) { this.writableEnded = true; if (raw && !cap.payload) { try { cap.payload = JSON.parse(raw); } catch { /* */ } } },
    };
    await handler({ method, headers: { "x-forwarded-for": ip, ...extraHeaders }, body: body ?? {} }, res);
    return { status: cap.status ?? res.statusCode, ...(cap.payload ?? {}) } as Record<string, unknown> & { status: number };
  };
  const audio = wav(8).toString("base64");

  assert.equal((await call("GET")).configured, false);
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true })).status, 503, "بلا مفتاح: غير مفعّلة بصدق");
  process.env.GROQ_API_KEY = "test-key";
  assert.equal((await call("GET")).configured, true);
  assert.equal((await call("POST", { consent: true })).status, 400);
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "video/mp4", durationMs: 8000, consent: true })).status, 415, "صيغ غير صوتية مرفوضة");
  assert.equal((await call("POST", { audioBase64: Buffer.alloc(100).toString("base64"), mimeType: "audio/wav", durationMs: 8000, consent: true })).status, 400, "قصير جدًا");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 51_000, consent: true })).status, 400, "أطول من 60ث");
  assert.equal(
    (await call("POST", { audioBase64: Buffer.alloc(MAX_AUDIO_BYTES + 5000, 1).toString("base64"), mimeType: "audio/wav", durationMs: 8000, consent: true })).status,
    413,
  );
  const ok = await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true });
  assert.equal(ok.status, 200);
  assert.equal(ok.transcript, "قل هو الله احد");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.form?.get("model"), "whisper-large-v3");
  assert.equal(calls[0]!.form?.get("language"), "ar");
  assert.equal(calls[0]!.form?.has("prompt"), false, "لا نمرّر النص المتوقَّع للمزوّد فيُخفي الأخطاء");
  for (let i = 0; i < DAILY_LIMIT; i++) await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true }, "203.0.113.50");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true }, "203.0.113.50")).status, 429, "الحدّ اليومي");
  // الموافقة: بلا consent لا يصل شيء للمزوّد
  const before = calls.length;
  const noConsent = await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000 });
  assert.equal(noConsent.status, 403, "بلا موافقة: مرفوض");
  assert.equal(noConsent.code, "consent_required");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: "yes" })).status, 403, "الموافقة قيمة true حصرًا");
  assert.equal(calls.length, before, "لا استدعاء للمزوّد دون موافقة");
  assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", consent: true })).status, 400, "المدة إلزامية");
  // رفض الحجم المُعلَن قبل قراءة الجسم (الحارس يرفض دون لمس الدفق)
  {
    const { readJsonBodyLimited } = await import("../../../lib/api-security-guard.mjs");
    let touched = false;
    const req = {
      headers: { "content-length": String(MAX_REQUEST_BYTES + 1) },
      on() {},
      [Symbol.asyncIterator]() { touched = true; return { next: async () => ({ done: true, value: undefined }) }; },
    };
    const r = await readJsonBodyLimited(req, MAX_REQUEST_BYTES);
    assert.equal(r.ok, false);
    assert.equal(r.error, "payload_too_large");
    assert.equal(touched, false, "لم يُقرأ الجسم");
    assert.equal((await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true }, "198.51.100.21", { "content-length": String(MAX_REQUEST_BYTES + 1) })).status, 413, "الحدّ في المعالج أيضًا");
  }
  // IP موثوق: تزييف x-forwarded-for لا يتجاوز الحدّ عند وجود ترويسة المنصة
  {
    const body = { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true };
    for (let i = 0; i < DAILY_LIMIT; i++) await call("POST", body, `spoof-${i}`, { "x-real-ip": "192.0.2.77" });
    assert.equal((await call("POST", body, "spoof-new", { "x-real-ip": "192.0.2.77" })).status, 429, "تدوير x-forwarded-for لا يفتح حدًّا جديدًا");
    assert.equal((await call("POST", body, "198.51.100.99", { "x-vercel-forwarded-for": "192.0.2.78" })).status, 200, "عميل آخر موثوق يمرّ");
  }

  // المدة الفعلية على الخادم: قارئ الترويسات لكل صيغة
  {
    const near = (a: number | undefined, b: number, tol = 60) => assert.ok(a !== undefined && Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
    near(probeAudio(wav(12))?.durationMs, 12_000);
    near(probeAudio(oggOpus(9))?.durationMs, 9_000);
    near(probeAudio(webm(23))?.durationMs, 23_000);
    near(probeAudio(fmp4(14))?.durationMs, 14_000);
    assert.equal(probeAudio(webm(23))?.format, "webm");
    assert.equal(probeAudio(Buffer.alloc(5000, 1)), null, "ملف عشوائي لا صيغة له");
  }
  const goodBody = (mimeType: string, durationMs: number, buf: Buffer) => ({ audioBase64: buf.toString("base64"), mimeType, durationMs, consent: true });
  // كل صيغة حقيقية متوقَّعة تمرّ بمدتها الفعلية
  for (const [mimeType, buf] of [["audio/webm", webm(10)], ["audio/ogg", oggOpus(10)], ["audio/mp4", fmp4(10)], ["audio/wav", wav(10)]] as const) {
    assert.equal((await call("POST", goodBody(mimeType, 10_000, buf), "198.51.100.30")).status, 200, `${mimeType} حقيقي يمرّ`);
  }
  // المدة الفعلية هي المعتمدة: عدم التطابق لا يُرفض بل يُسجَّل، والرفض فقط لما زاد عن 50ث فعليًا
  {
    const warns: unknown[][] = [];
    const realWarn = console.warn;
    console.warn = (...a: unknown[]) => { warns.push(a); };
    assert.equal((await call("POST", goodBody("audio/wav", 8_000, wav(20)), "198.51.100.31")).status, 200, "فعلي 20ث ومُعلَن 8ث: يمرّ");
    assert.equal(warns.length, 1, "سُجّل عدم التطابق");
    assert.match(JSON.stringify(warns[0]), /declaredMs":8000,"actualMs":20000/);
    assert.equal((await call("POST", goodBody("audio/webm", 10_000, webm(30)), "198.51.100.31")).status, 200, "webm أطول من المُعلَن: يمرّ");
    assert.equal((await call("POST", goodBody("audio/wav", 20_000, wav(11)), "198.51.100.31")).status, 200, "الفارق في الاتجاه الآخر: يمرّ");
    assert.equal((await call("POST", goodBody("audio/wav", 10_000, wav(12)), "198.51.100.32")).status, 200);
    assert.equal(warns.length, 3, "فارق ≤ 3ث لا يُسجَّل");
    console.warn = realWarn;
    const long = await call("POST", goodBody("audio/wav", 49_000, wav(55)), "198.51.100.31");
    assert.equal(long.status, 400, "فعلي أكبر من 50ث يُرفض ولو أعلن 49ث");
    assert.equal((await call("POST", goodBody("audio/wav", 10_000, wav(51)), "198.51.100.31")).status, 400, "الإعلان لا يُنقص المدة الفعلية");
  }
  // WebM بلا Duration (Chrome): تُحسب من آخر timestamp في الـclusters؛ والترويسة المزوَّرة لا تُنقص
  {
    assert.ok(Math.abs((probeAudio(webm(40))?.durationMs ?? 0) - 40_000) <= 60, "بلا Duration: من الكتل");
    assert.ok(Math.abs((probeAudio(webm(40, 5_000))?.durationMs ?? 0) - 40_000) <= 60, "Duration مزوَّرة قصيرة: تُهمَل لصالح الكتل");
    assert.equal((await call("POST", goodBody("audio/webm", 10_000, webm(60)), "198.51.100.35")).status, 400, "webm بلا Duration فعليًا 60ث يُرفض");
    assert.equal((await call("POST", goodBody("audio/webm", 30_000, webm(30)), "198.51.100.35")).status, 200);
  }
  // تعذّر استخراج المدة: تقدير متحفظ من الحجم يُحتسب في سقف الثواني
  {
    const unreadable = webmUnreadable(300_000);
    const p = probeAudio(unreadable);
    assert.equal(p?.format, "webm");
    assert.equal(p?.durationMs, null, "لا مدة قابلة للقراءة");
    process.env.RECITATION_GLOBAL_DAILY_SECONDS = "50"; // 300KB ≈ 100ث مقدَّرة عند 24kbps > 50
    const est = await call("POST", goodBody("audio/webm", 20_000, unreadable), "198.51.100.36");
    assert.equal(est.status, 503, "التقدير من الحجم يُحتسب (لا 10ث الدنيا)");
    assert.equal(est.code, "asr_capacity");
    delete process.env.RECITATION_GLOBAL_DAILY_SECONDS;
    assert.equal((await call("POST", goodBody("audio/webm", 20_000, unreadable), "198.51.100.36")).status, 200, "ضمن السقف الافتراضي يمرّ");
  }
  // صيغة مزيفة: امتداد/mime يخالف النوع الحقيقي، أو بايتات عشوائية
  {
    assert.equal((await call("POST", goodBody("audio/webm", 8_000, wav(8)), "198.51.100.33")).status, 415, "WAV معلَن webm");
    assert.equal((await call("POST", goodBody("audio/mp4", 8_000, Buffer.alloc(5000, 1)), "198.51.100.33")).status, 415, "بايتات عشوائية");
    assert.equal((await call("POST", goodBody("audio/ogg", 8_000, Buffer.concat([Buffer.from("MZ"), Buffer.alloc(5000, 1)])), "198.51.100.33")).status, 415, "تنفيذي متنكّر");
    assert.equal((await call("POST", goodBody("audio/mpeg", 8_000, wav(8)), "198.51.100.33")).status, 415, "mp3/aac الخام غير متوقَّع");
  }
  // سقف الثواني الإجمالي: يُستهلك بالفعلي (≥10ث) وتجاوزه يعيد asr_capacity
  {
    process.env.RECITATION_GLOBAL_DAILY_SECONDS = "5";
    const cap = await call("POST", goodBody("audio/wav", 8_000, wav(8)), "198.51.100.34");
    assert.equal(cap.status, 503, "10ث مفوترة > سقف 5ث");
    assert.equal(cap.code, "asr_capacity");
    delete process.env.RECITATION_GLOBAL_DAILY_SECONDS;
    assert.match(read("lib/api-handlers/recitation-transcribe.js"), /Math\.ceil\(actualMs \/ 1000\)[\s\S]{0,400}cost: seconds/, "الاستهلاك بالمدة الفعلية/المقدَّرة لا المُعلَنة");
  }
  // السقف اليومي الإجمالي يحمي الرصيد
  {
    process.env.RECITATION_GLOBAL_DAILY_LIMIT = "1";
    const cap = await call("POST", { audioBase64: audio, mimeType: "audio/wav", durationMs: 8000, consent: true }, "198.51.100.150");
    assert.equal(cap.status, 503, "تجاوز السقف الإجمالي");
    assert.equal(cap.code, "asr_capacity");
    delete process.env.RECITATION_GLOBAL_DAILY_LIMIT;
  }
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
  assert.match(d, /prefix: "\/api\/recitation-transcribe"[\s\S]{0,260}maxBodyBytes: 1_500_000/);
  assert.match(d, /recitationTranscribeRateLimit = createRateLimiter\(\{[\s\S]{0,80}max: 6/, "حدّ الدقيقة");
}

console.log("=== الواجهة والتوصيل والخصوصية ===");
{
  const routes = read("src/AppRoutes.tsx");
  assert.match(routes, /path="\/quran\/recitation-test-ai"><Redirect to="\/mushaf\?tasmee=1"/, "المسار القديم يحوّل إلى المصحف بوضع التسميع");
  assert.equal(existsSync(resolve(root, "src/pages/quran/RecitationTestAiPage.tsx")), false, "صفحة التسميع القديمة محذوفة");
  assert.doesNotMatch(read("src/config/sections.registry.ts"), /from: "\/quran\/recitation-test-ai"/, "لا تحويل قديم في السجل");
  assert.match(read("src/lib/feature-registry.ts"), /id:\s*"recitation-test-ai"[^}]*status:\s*"active"/, "مسجّلة في feature-registry");
  assert.match(read("src/design-system/screens/QuranHubScreen.tsx"), /href="\/mushaf\?tasmee=1"/, "مدخل في تبويب القرآن");

  const apiSrc = read("src/lib/recitation-test/api.ts");
  assert.match(apiSrc, /if \(!hasRecitationConsent\(\)\) throw new AsrError\([^)]*"consent"\)[\s\S]*await blobToBase64/, "العميل لا يرسل صوتًا دون موافقة");

  const plist = read("ios/App/App/Info.plist");
  const micText = read("scripts/mic-usage-description.txt").trim();
  const micMatch = plist.match(/<key>NSMicrophoneUsageDescription<\/key>\s*<string>([^<]*)<\/string>/);
  assert.equal(micMatch?.[1], micText, "نص إذن الميكروفون = النص الموحَّد حرفيًا (يغطي التسميع على الجهاز واختبار التلاوة المُرسَل بعد الموافقة)");
  assert.match(micText, /في وضع التسميع تُعالج التلاوة على جهازك فقط ولا تُرسل/);
  assert.match(micText, /في اختبار التلاوة تُرسل إلى خدمة خارجية[^.]*بعد موافقتك/);
  assert.doesNotMatch(plist, /NSSpeechRecognitionUsageDescription/, "لا تعرّف صوتي أصلي");

  const privacy = read("src/views/PrivacyPage.tsx");
  assert.match(privacy, /لا يُخزَّن التسجيل بعد المعالجة/);
  assert.match(privacy, /Groq/, "الخصوصية تسمّي Groq");
  assert.match(privacy, /موافقتك الصريحة/, "الخصوصية تذكر الموافقة");
  assert.doesNotMatch(privacy, /Apple Speech/, "نص الخصوصية القديم أُزيل");
}

console.log("recitation-test-ai-gate: ok");
