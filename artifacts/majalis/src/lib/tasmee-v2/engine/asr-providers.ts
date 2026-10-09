/**
 * مزوّدو التعرّف الصوتي للتسميع v2 خلف واجهة واحدة — يختار المحرك بينهم دون معرفة تفاصيلهم.
 *
 * - «on-device»: Whisper المضبوط للقرآن (tarteel-ai/whisper-base-ar-quran، Apache-2.0) محوّلًا إلى CoreML
 *   عبر الإضافة الأصلية TasmeeEngine — تيار نتائج جزئية بلا شبكة. iOS الأصلي فقط.
 * - «groq»: في `asr-provider-groq.ts` منفصلًا وخاملًا خلف `tasmee_cloud_asr` المغلق (1.1.0 على الجهاز فقط)؛
 *   لا يستورده أي كود في الواجهة.
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
