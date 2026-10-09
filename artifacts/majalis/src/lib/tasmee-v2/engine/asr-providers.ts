/**
 * مزوّدو التعرّف الصوتي للتسميع v2 خلف واجهة واحدة — يختار المحرك بينهم دون معرفة تفاصيلهم.
 *
 * - «on-device»: Whisper المضبوط للقرآن (tarteel-ai/whisper-base-ar-quran، Apache-2.0) محوّلًا إلى CoreML
 *   عبر الإضافة الأصلية TasmeeEngine — تيار نتائج جزئية بلا شبكة. iOS الأصلي فقط.
 * - «groq»: whisper-large-v3 عبر الوسيط عديم الحالة /api/recitation-transcribe — نافذة كاملة لكل طلب،
 *   بموافقة صريحة فقط. Groq تفوتر 10ث كحد أدنى لكل طلب، فلا يُستعمل للعرض الحي بل لتأكيد خطأ مشتبه.
 * - «apple-speech»: SFSpeechRecognizer ar-SA — غير مُضمَّن بعد (يحتاج Swift ونسخة متجر بإذن المالك).
 *
 * لا مزوّد هنا يحفظ صوتًا: النافذة تُرمَّز في الذاكرة وتُرسل ثم تُترك للمجمِّع.
 */
import type { AudioWindow } from "./vad";

export type AsrProviderId = "on-device" | "groq" | "apple-speech";

export type WindowTranscript = { text: string; providerId: AsrProviderId; decodeMs: number };

export interface AsrProvider {
  readonly id: AsrProviderId;
  /** يحتاج شبكة (ويُسقط عند انقطاعها) */
  readonly requiresNetwork: boolean;
  /** هل يُرسل الصوت خارج الجهاز (يتطلب موافقة صريحة) */
  readonly leavesDevice: boolean;
  isAvailable(): Promise<boolean>;
  transcribe(window: AudioWindow): Promise<WindowTranscript>;
}

/** ترميز PCM أحادي 16-bit WAV في الذاكرة (صيغة يقبلها الوسيط ويقرأ مدتها الفعلية). */
export function encodeWav(pcm: Float32Array, sampleRate: number): Uint8Array {
  const data = pcm.length * 2;
  const out = new Uint8Array(44 + data);
  const v = new DataView(out.buffer);
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  v.setUint32(4, 36 + data, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, data, true);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]!));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export type GroqProviderDeps = {
  hasConsent: () => boolean;
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

  private get fetch(): typeof fetch {
    return this.deps.fetchImpl ?? fetch;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.deps.hasConsent()) return false;
    try {
      const res = await this.fetch(this.deps.endpoint ?? "/api/recitation-transcribe", { method: "GET" });
      const data = (await res.json().catch(() => ({}))) as { configured?: boolean };
      return res.ok && data.configured === true;
    } catch {
      return false;
    }
  }

  async transcribe(w: AudioWindow): Promise<WindowTranscript> {
    if (!this.deps.hasConsent()) throw new Error("consent_required");
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

/** Apple Speech ar-SA — محوّل حاضر للواجهة، غير متاح حتى تُضاف إضافة Swift بنسخة متجر. */
export class AppleSpeechProvider implements AsrProvider {
  readonly id = "apple-speech" as const;
  readonly requiresNetwork = false;
  readonly leavesDevice = false;
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async transcribe(): Promise<WindowTranscript> {
    throw new Error("apple_speech_unavailable");
  }
}

/** يغلّف مزوّدًا على الجهاز بدالة تفريغ نافذة (الإضافة الأصلية أو محاكاة في الاختبار). */
export class OnDeviceProvider implements AsrProvider {
  readonly id = "on-device" as const;
  readonly requiresNetwork = false;
  readonly leavesDevice = false;
  constructor(
    private readonly available: () => boolean,
    private readonly run: (w: AudioWindow) => Promise<string>,
    private readonly now: () => number = () => Date.now(),
  ) {}
  async isAvailable(): Promise<boolean> {
    return this.available();
  }
  async transcribe(w: AudioWindow): Promise<WindowTranscript> {
    const t0 = this.now();
    const text = await this.run(w);
    return { text, providerId: this.id, decodeMs: this.now() - t0 };
  }
}

/**
 * سلسلة احتياط: أول مزوّد متاح يُستعمل؛ عند فشله (انقطاع شبكة/سقف) يُجرَّب التالي.
 * المزوّدون الذين يُخرجون الصوت يُتخطَّون حين `offline`.
 */
export class FallbackChain {
  constructor(
    readonly providers: readonly AsrProvider[],
    private readonly isOnline: () => boolean = () => true,
  ) {}

  async pick(): Promise<AsrProvider | null> {
    for (const p of this.providers) {
      if (p.requiresNetwork && !this.isOnline()) continue;
      if (await p.isAvailable()) return p;
    }
    return null;
  }

  async transcribe(w: AudioWindow): Promise<WindowTranscript | null> {
    for (const p of this.providers) {
      if (p.requiresNetwork && !this.isOnline()) continue;
      if (!(await p.isAvailable())) continue;
      try {
        return await p.transcribe(w);
      } catch {
        // التالي
      }
    }
    return null;
  }
}
