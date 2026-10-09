/**
 * مزوّد Groq (whisper-large-v3 عبر الوسيط عديم الحالة /api/recitation-transcribe) — **خامل** في 1.1.0.
 * لا يُرسل شيئًا إلا إن فُتح العلم `tasmee_cloud_asr` (مغلق ثابتًا في الكود) **و**وافق المستخدم صراحة.
 * فتحه مشروط بـ: تفعيل ZDR في Groq (OWNER_ACTION) + إعادة AudioData إلى PrivacyInfo + تحديث صفحة الخصوصية،
 * في نسخة متجر جديدة. لا يستورده أي كود في الواجهة (يفرضه tasmee-v2-no-audio-egress.test.ts).
 */
import { isTasmeeCloudAsrEnabled } from "../flags";
import { encodeWav, type AsrProvider, type WindowTranscript } from "./asr-providers";
import type { AudioWindow } from "./vad";

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export type GroqProviderDeps = {
  hasConsent: () => boolean;
  /** العلم `tasmee_cloud_asr` — مغلق في 1.1.0؛ يُحقن في الاختبار فقط */
  cloudEnabled?: () => boolean;
  fetchImpl?: typeof fetch;
  endpoint?: string;
  now?: () => number;
};

/** Groq عبر الوسيط القائم — لا مفتاح على العميل، ولا يُرسل شيء دون موافقة. */
export class GroqWindowProvider implements AsrProvider {
  readonly id = "groq" as const;
  readonly requiresNetwork = true;
  readonly leavesDevice = true;
  constructor(private readonly deps: GroqProviderDeps) {}

  private get allowed(): boolean {
    return (this.deps.cloudEnabled ?? isTasmeeCloudAsrEnabled)() && this.deps.hasConsent();
  }

  private get fetch(): typeof fetch {
    return this.deps.fetchImpl ?? fetch;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.allowed) return false;
    try {
      const res = await this.fetch(this.deps.endpoint ?? "/api/recitation-transcribe", { method: "GET" });
      const data = (await res.json().catch(() => ({}))) as { configured?: boolean };
      return res.ok && data.configured === true;
    } catch {
      return false;
    }
  }

  async transcribe(w: AudioWindow): Promise<WindowTranscript> {
    if (!this.allowed) throw new Error("cloud_asr_disabled_or_no_consent");
    const now = this.deps.now ?? (() => Date.now());
    const t0 = now();
    const res = await this.fetch(this.deps.endpoint ?? "/api/recitation-transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64: toBase64(encodeWav(w.pcm, w.sampleRate)),
        mimeType: "audio/wav",
        durationMs: Math.round((w.pcm.length * 1000) / w.sampleRate),
        consent: true,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; transcript?: string; code?: string };
    if (!res.ok || !data.ok) throw new Error(data.code || `asr_${res.status}`);
    return { text: data.transcript ?? "", providerId: this.id, decodeMs: now() - t0 };
  }
}
