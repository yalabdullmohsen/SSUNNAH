/**
 * عميل خدمة التفريغ الصوتي لاختبار التلاوة. الصوت يُرسَل مرة واحدة ولا يُخزَّن بعد المعالجة (لا هنا ولا على الخادم).
 * في الحزمة المحلية يُعاد توجيه `/api/*` تلقائيًا إلى الخادم (native-api-base).
 */
import { hasRecitationConsent } from "./consent";
import { blobToBase64, type RecordingResult } from "./recorder";

export const RECITATION_API = "/api/recitation-transcribe";

export type AsrAvailability = "available" | "unconfigured" | "offline";

export async function checkAsrAvailability(): Promise<AsrAvailability> {
  try {
    const res = await fetch(RECITATION_API, { method: "GET", cache: "no-store" });
    if (!res.ok) return "unconfigured";
    const data = (await res.json()) as { configured?: boolean };
    return data.configured ? "available" : "unconfigured";
  } catch {
    return "offline";
  }
}

export class AsrError extends Error {
  constructor(
    message: string,
    readonly code: "unconfigured" | "limit" | "server" | "network" | "consent",
  ) {
    super(message);
  }
}

export async function transcribeRecitation(rec: RecordingResult): Promise<string> {
  // لا يغادر أي صوت الجهاز دون موافقة صريحة محفوظة
  if (!hasRecitationConsent()) throw new AsrError("يلزم موافقتك على إرسال التسجيل للتفريغ أولًا.", "consent");
  let res: Response;
  try {
    res = await fetch(RECITATION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64: await blobToBase64(rec.blob),
        mimeType: rec.mimeType,
        durationMs: rec.durationMs,
        consent: true,
      }),
    });
  } catch {
    throw new AsrError("تعذّر الاتصال بالإنترنت. اختبار التلاوة يحتاج اتصالًا.", "network");
  }
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; transcript?: string; message?: string; code?: string };
  if (data.code === "asr_capacity") throw new AsrError(data.message || "الخدمة مشغولة الآن. حاول لاحقًا.", "limit");
  if (res.status === 503 || data.code === "asr_unconfigured") {
    throw new AsrError(data.message || "خدمة التعرّف الصوتي غير مفعّلة بعد.", "unconfigured");
  }
  if (res.status === 403 && data.code === "consent_required") throw new AsrError(data.message || "يلزم موافقتك أولًا.", "consent");
  if (res.status === 429) throw new AsrError(data.message || "بلغتَ الحدّ المسموح الآن. حاول لاحقًا.", "limit");
  if (!res.ok || !data.ok) throw new AsrError(data.message || "تعذّر التعرّف الصوتي. حاول مجددًا.", "server");
  return data.transcript ?? "";
}
