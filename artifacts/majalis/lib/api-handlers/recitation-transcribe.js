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
 * POST: { audioBase64, mimeType, durationMs? } → { ok, transcript }.
 */
import { sendJson } from "../api/_http.mjs";
import { checkRateLimit } from "../rate-limit.mjs";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3";
/** سقف المقطع بعد فك الترميز — 45 ثانية Opus/AAC ≈ 0.4MB، فهذا هامش أمان. */
export const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
export const MAX_DURATION_MS = 60_000;
export const DAILY_LIMIT = 40;
export const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
]);

function apiKey() {
  return String(process.env.GROQ_API_KEY || "").trim();
}

function clientIp(req) {
  return (
    req.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
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

  const body = req.body && typeof req.body === "object" ? req.body : {};
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
  if (Number.isFinite(duration) && duration > MAX_DURATION_MS) {
    sendJson(res, 400, { ok: false, message: "التسجيل أطول من الحد المسموح (60 ثانية)." });
    return;
  }
  // حدّ الحجم قبل فك الترميز (base64 ≈ 4/3)
  if (body.audioBase64.length > Math.ceil((MAX_AUDIO_BYTES * 4) / 3) + 8) {
    sendJson(res, 413, { ok: false, message: "التسجيل كبير جدًا." });
    return;
  }
  const audio = Buffer.from(body.audioBase64, "base64");
  if (audio.length < 800 || audio.length > MAX_AUDIO_BYTES) {
    sendJson(res, 400, { ok: false, message: "التسجيل قصير جدًا أو غير صالح." });
    return;
  }

  const daily = await checkRateLimit(`recitation-daily:${clientIp(req)}`, {
    windowMs: 24 * 60 * 60_000,
    max: DAILY_LIMIT,
  });
  if (!daily.allowed) {
    sendJson(res, 429, { ok: false, message: "بلغتَ الحدّ اليومي لاختبار التلاوة. عُد غدًا بإذن الله." });
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
