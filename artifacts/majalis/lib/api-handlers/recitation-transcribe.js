/**
 * recitation-transcribe.js — تفريغ مقطع تلاوة قصير إلى نص لاختبار الحفظ (/quran/recitation-test-ai).
 *
 * وسيط خادمي عديم الحالة إلى Groq (whisper-large-v3 العام). لا يُستعمل أي نموذج/واجهة منافس مخصّص للقرآن.
 *
 * الخصوصية: لا يُخزَّن الصوت. يُستقبل في الذاكرة، يُمرَّر للمزوّد، وتُرجَع النتيجة (النص فقط) —
 * لا كتابة ملفات ولا صفوف قاعدة بيانات ولا تسجيل لمحتوى الصوت أو النص في السجلات.
 * لا نمرّر النص المتوقَّع للمزوّد (prompt) حتى لا يُحابي الحفظَ الخاطئ فيخفي الأخطاء.
 *
 * GET: فحص تهيئة رخيص بلا استدعاء خارجي (تعرضه الواجهة بصدق).
 * POST: { audioBase64, mimeType, durationMs, consent: true } → { ok, transcript }.
 * الموافقة: لا يُرسَل أي صوت إلى المزوّد دون consent === true (يرسلها العميل بعد شاشة الموافقة الصريحة).
 * الحماية من استنزاف الرصيد: حدّ يومي لكل IP موثوق + سقف يومي إجمالي (RECITATION_GLOBAL_DAILY_LIMIT) + سقف ثوانٍ فعلية (RECITATION_GLOBAL_DAILY_SECONDS) في مخزن دائم (Upstash).
 */
import { sendJson } from "../api/_http.mjs";
import { familyOfMime, probeAudio } from "../audio-duration.mjs";
import { checkRateLimit, getTrustedClientIp } from "../rate-limit.mjs";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3";
/** سقف المقطع بعد فك الترميز — 45 ثانية Opus/AAC ≈ 0.2–0.4MB. */
export const MAX_AUDIO_BYTES = 1024 * 1024;
export const MAX_DURATION_MS = 50_000;
/** أقصى فارق بين المدة الفعلية (من الملف) والمُعلَنة. */
export const MAX_DURATION_DRIFT_MS = 3_000;
/** Groq تفوتر 10 ثوانٍ كحدّ أدنى لكل طلب. */
export const MIN_BILLED_SECONDS = 10;
export const DAILY_LIMIT = 40;
/** سقف جسم الطلب المُعلَن (base64 + غلاف JSON) — يوافق maxBodyBytes في api-dispatch. */
export const MAX_REQUEST_BYTES = 1_500_000;
export const DEFAULT_GLOBAL_DAILY_LIMIT = 400;
export const DEFAULT_GLOBAL_DAILY_SECONDS = 18_000;

function globalDailyLimit() {
  const n = Number(process.env.RECITATION_GLOBAL_DAILY_LIMIT);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_GLOBAL_DAILY_LIMIT;
}

/** سقف الثواني الإجمالي اليومي — الحماية الحقيقية للتكلفة (5 ساعات افتراضيًا). */
function globalDailySeconds() {
  const n = Number(process.env.RECITATION_GLOBAL_DAILY_SECONDS);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_GLOBAL_DAILY_SECONDS;
}
/** الصيغ التي يُنتجها العميل فقط (MediaRecorder: webm/ogg/mp4) + wav؛ لكلٍّ منها قارئ مدة فعلية. */
export const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
]);

function apiKey() {
  return String(process.env.GROQ_API_KEY || "").trim();
}

function baseMime(raw) {
  return String(raw || "").split(";")[0].trim().toLowerCase();
}

function extensionFor(mime) {
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg")) return "mp3";
  return "webm";
}

export default async function handler(req, res) {
  if (req.method === "GET" || req.method === "HEAD") {
    sendJson(res, 200, { ok: true, configured: apiKey().length > 0 });
    return;
  }
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "الطريقة غير مدعومة." });
    return;
  }

  const key = apiKey();
  if (!key) {
    sendJson(res, 503, { ok: false, code: "asr_unconfigured", message: "خدمة التعرّف الصوتي غير مفعّلة بعد." });
    return;
  }

  const declared = Number(req.headers?.["content-length"]);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    sendJson(res, 413, { ok: false, message: "التسجيل كبير جدًا." });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.consent !== true) {
    sendJson(res, 403, { ok: false, code: "consent_required", message: "يلزم موافقتك على إرسال التسجيل للتفريغ قبل التسجيل." });
    return;
  }
  if (typeof body.audioBase64 !== "string" || !body.audioBase64) {
    sendJson(res, 400, { ok: false, message: "لم يصل تسجيل صوتي." });
    return;
  }
  const mime = baseMime(body.mimeType);
  if (!ALLOWED_MIME.has(mime)) {
    sendJson(res, 415, { ok: false, message: "صيغة الصوت غير مدعومة." });
    return;
  }
  const duration = Number(body.durationMs);
  if (!Number.isFinite(duration) || duration <= 0) {
    sendJson(res, 400, { ok: false, message: "مدة التسجيل غير صالحة." });
    return;
  }
  if (duration > MAX_DURATION_MS) {
    sendJson(res, 400, { ok: false, message: "التسجيل أطول من الحد المسموح (50 ثانية)." });
    return;
  }
  // حدّ الحجم قبل فك الترميز (base64 ≈ 4/3) — لا نفكّ شيئًا قبل اجتياز الحدود
  if (body.audioBase64.length > Math.ceil((MAX_AUDIO_BYTES * 4) / 3) + 8) {
    sendJson(res, 413, { ok: false, message: "التسجيل كبير جدًا." });
    return;
  }
  const approxBytes = Math.floor((body.audioBase64.length * 3) / 4);
  if (approxBytes < 800) {
    sendJson(res, 400, { ok: false, message: "التسجيل قصير جدًا أو غير صالح." });
    return;
  }

  const daily = await checkRateLimit(`recitation-daily:${getTrustedClientIp(req)}`, {
    windowMs: 24 * 60 * 60_000,
    max: DAILY_LIMIT,
  });
  if (!daily.allowed) {
    sendJson(res, 429, { ok: false, message: "بلغتَ الحدّ اليومي لاختبار التلاوة. عُد غدًا بإذن الله." });
    return;
  }
  // سقف إجمالي للتطبيق كله يحمي رصيد المزوّد؛ المخزن الدائم يغلق عند تعطّله في الإنتاج
  const global = await checkRateLimit("recitation-global-daily", { windowMs: 24 * 60 * 60_000, max: globalDailyLimit() });
  if (!global.allowed) {
    sendJson(res, 503, { ok: false, code: "asr_capacity", message: "الخدمة مشغولة الآن. حاول لاحقًا." });
    return;
  }

  const audio = Buffer.from(body.audioBase64, "base64");
  if (audio.length < 800 || audio.length > MAX_AUDIO_BYTES) {
    sendJson(res, 400, { ok: false, message: "التسجيل قصير جدًا أو غير صالح." });
    return;
  }
  // النوع الحقيقي والمدة الفعلية من الملف نفسه (لا الامتداد ولا الإعلان)
  const probe = probeAudio(audio);
  if (!probe || probe.format !== familyOfMime(mime)) {
    sendJson(res, 415, { ok: false, message: "صيغة الصوت غير مدعومة." });
    return;
  }
  if (probe.durationMs > MAX_DURATION_MS) {
    sendJson(res, 400, { ok: false, message: "التسجيل أطول من الحد المسموح (50 ثانية)." });
    return;
  }
  if (Math.abs(probe.durationMs - duration) > MAX_DURATION_DRIFT_MS) {
    sendJson(res, 400, { ok: false, message: "مدة التسجيل لا تطابق المُعلَن." });
    return;
  }
  // الاستهلاك بالثواني الفعلية (مع حدّ المزوّد الأدنى 10ث) — سقف التكلفة الحقيقي
  const seconds = Math.max(MIN_BILLED_SECONDS, Math.ceil(probe.durationMs / 1000));
  const budget = await checkRateLimit("recitation-global-seconds", {
    windowMs: 24 * 60 * 60_000,
    max: globalDailySeconds(),
    cost: seconds,
  });
  if (!budget.allowed) {
    sendJson(res, 503, { ok: false, code: "asr_capacity", message: "الخدمة مشغولة الآن. حاول لاحقًا." });
    return;
  }

  try {
    const form = new FormData();
    form.append("file", new Blob([audio], { type: mime }), `recitation.${extensionFor(mime)}`);
    form.append("model", GROQ_MODEL);
    form.append("language", "ar");
    form.append("temperature", "0");
    form.append("response_format", "json");

    const upstream = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
    if (!upstream.ok) {
      // لا نسجّل محتوى — رمز الحالة فقط
      console.error("recitation-transcribe: upstream status", upstream.status);
      sendJson(res, 502, { ok: false, message: "تعذّر التعرّف الصوتي الآن. حاول مجددًا." });
      return;
    }
    const data = await upstream.json();
    const transcript = typeof data?.text === "string" ? data.text.trim() : "";
    sendJson(res, 200, { ok: true, transcript });
  } catch {
    sendJson(res, 502, { ok: false, message: "تعذّر الاتصال بمحرك التعرّف الصوتي." });
  }
}
