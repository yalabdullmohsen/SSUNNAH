/**
 * كشف الكلام (VAD) بالطاقة وتقطيع الصوت إلى نوافذ منزلقة 1–3 ثوانٍ للتعرّف — منطق نقي بلا DOM/شبكة.
 * لا يحفظ صوتًا: يحتفظ في الذاكرة بآخر `maxMs` من الكلام الجاري فقط، ويُفرَّغ عند كل صمت.
 */

export type VadParams = {
  sampleRate: number;
  /** طول الإطار بالمللي ثانية */
  frameMs: number;
  /** الكلام يبدأ حين تعلو الطاقة أرضية الضجيج بهذا القدر (dB) */
  startDb: number;
  /** ويستمر ما دامت فوقها بهذا القدر (تخلّف لمنع التذبذب) */
  stopDb: number;
  /** مهلة الصمت قبل إعلان نهاية الكلام */
  hangoverMs: number;
  /** أدنى طاقة مطلقة (dBFS) تُعدّ كلامًا مهما انخفضت الأرضية */
  minDbfs: number;
};

export const DEFAULT_VAD_PARAMS: VadParams = {
  sampleRate: 16_000,
  frameMs: 20,
  startDb: 12,
  stopDb: 6,
  hangoverMs: 400,
  minDbfs: -50,
};

export function frameDbfs(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i]! * frame[i]!;
  const rms = Math.sqrt(sum / Math.max(1, frame.length));
  return rms > 0 ? 20 * Math.log10(rms) : -120;
}

/** VAD بالطاقة مع أرضية ضجيج متكيّفة (تتبع الصمت فقط) وتخلّف ومهلة صمت. */
export class EnergyVad {
  readonly params: VadParams;
  private floorDb = -60;
  private speaking = false;
  private silentMs = 0;
  private voiced = false;

  constructor(params: Partial<VadParams> = {}) {
    this.params = { ...DEFAULT_VAD_PARAMS, ...params };
  }

  get isSpeech(): boolean {
    return this.speaking;
  }

  /** هل الإطار الأخير صوت فعلي (لا مهلة صمت داخل الكلام) */
  get lastVoiced(): boolean {
    return this.voiced;
  }

  /** يُرجع حالة الكلام بعد هذا الإطار. */
  push(frame: Float32Array): boolean {
    const db = frameDbfs(frame);
    const p = this.params;
    this.voiced = false;
    if (!this.speaking) {
      if (db >= this.floorDb + p.startDb && db >= p.minDbfs) {
        this.speaking = true;
        this.voiced = true;
        this.silentMs = 0;
      } else {
        // الأرضية تتبع الصمت ببطء صعودًا وبسرعة نزولًا
        this.floorDb = db < this.floorDb ? db : this.floorDb * 0.95 + db * 0.05;
      }
      return this.speaking;
    }
    if (db >= this.floorDb + p.stopDb && db >= p.minDbfs) {
      this.silentMs = 0;
      this.voiced = true;
    } else {
      this.silentMs += p.frameMs;
      if (this.silentMs >= p.hangoverMs) this.speaking = false;
    }
    return this.speaking;
  }

  reset(): void {
    this.floorDb = -60;
    this.speaking = false;
    this.silentMs = 0;
    this.voiced = false;
  }
}

export type AudioWindow = {
  pcm: Float32Array;
  sampleRate: number;
  /** بداية النافذة ونهايتها من بداية الجلسة (ms) */
  startMs: number;
  endMs: number;
  /** آخر نافذة قبل صمت */
  final: boolean;
};

export type WindowParams = {
  /** أقصر نافذة تُرسل (القصيرة تُكمَّل صمتًا) */
  minMs: number;
  /** أطول نافذة (آخر maxMs من الكلام الجاري) */
  maxMs: number;
  /** كل كم تُرسل نافذة أثناء الكلام */
  hopMs: number;
  /** صوت يسبق بداية الكلام يُضمّ للنافذة (لا تُقطع أول الكلمة) */
  preRollMs: number;
  /** كلام أقصر من هذا يُهمَل (نقرة/سعال) */
  minSpeechMs: number;
};

export const DEFAULT_WINDOW_PARAMS: WindowParams = {
  minMs: 1000,
  maxMs: 3000,
  hopMs: 500,
  preRollMs: 200,
  minSpeechMs: 250,
};

/** يقطّع تيار PCM أحادي إلى نوافذ كلام منزلقة. */
export class SpeechWindower {
  readonly vad: EnergyVad;
  readonly win: WindowParams;
  private readonly sr: number;
  private readonly frameLen: number;
  private pending: number[] = [];
  private buf: number[] = [];
  private preRoll: number[] = [];
  private consumed = 0;
  private bufStart = 0;
  private sinceHop = 0;
  private speechSamples = 0;

  constructor(vad: Partial<VadParams> = {}, win: Partial<WindowParams> = {}) {
    this.vad = new EnergyVad(vad);
    this.win = { ...DEFAULT_WINDOW_PARAMS, ...win };
    this.sr = this.vad.params.sampleRate;
    this.frameLen = Math.round((this.sr * this.vad.params.frameMs) / 1000);
  }

  private ms(samples: number): number {
    return (samples * 1000) / this.sr;
  }

  private samples(ms: number): number {
    return Math.round((ms * this.sr) / 1000);
  }

  private emit(final: boolean): AudioWindow | null {
    if (this.ms(this.speechSamples) < this.win.minSpeechMs) return null;
    const maxN = this.samples(this.win.maxMs);
    const minN = this.samples(this.win.minMs);
    const tail = this.buf.length > maxN ? this.buf.slice(this.buf.length - maxN) : this.buf;
    const pcm = new Float32Array(Math.max(minN, tail.length));
    pcm.set(tail, pcm.length - tail.length);
    const endMs = this.ms(this.bufStart + this.buf.length);
    return { pcm, sampleRate: this.sr, startMs: endMs - this.ms(pcm.length), endMs, final };
  }

  /** يُدخل عيّنات جديدة ويُرجع النوافذ الجاهزة. */
  push(samples: Float32Array): AudioWindow[] {
    const out: AudioWindow[] = [];
    for (let i = 0; i < samples.length; i++) this.pending.push(samples[i]!);
    const hopN = this.samples(this.win.hopMs);
    const maxKeep = this.samples(this.win.maxMs);
    const preN = this.samples(this.win.preRollMs);
    while (this.pending.length >= this.frameLen) {
      const frame = this.pending.splice(0, this.frameLen);
      const wasSpeech = this.vad.isSpeech;
      const speech = this.vad.push(Float32Array.from(frame));
      if (speech) {
        if (!wasSpeech) {
          this.buf = [...this.preRoll];
          this.bufStart = this.consumed - this.preRoll.length;
          this.sinceHop = 0;
          this.speechSamples = 0;
        }
        this.buf.push(...frame);
        if (this.vad.lastVoiced) this.speechSamples += frame.length;
        this.sinceHop += frame.length;
        if (this.buf.length > maxKeep) {
          const drop = this.buf.length - maxKeep;
          this.buf.splice(0, drop);
          this.bufStart += drop;
        }
        if (this.sinceHop >= hopN && this.buf.length >= this.samples(this.win.minMs)) {
          this.sinceHop = 0;
          const w = this.emit(false);
          if (w) out.push(w);
        }
      } else if (wasSpeech) {
        const w = this.emit(true);
        if (w) out.push(w);
        this.buf = [];
        this.speechSamples = 0;
      }
      this.preRoll.push(...frame);
      if (this.preRoll.length > preN) this.preRoll.splice(0, this.preRoll.length - preN);
      this.consumed += frame.length;
    }
    return out;
  }

  /** نهاية الجلسة: يُرسل ما تبقّى من كلام ويُفرغ كل الذاكرة. */
  flush(): AudioWindow[] {
    const w = this.vad.isSpeech ? this.emit(true) : null;
    this.buf = [];
    this.pending = [];
    this.preRoll = [];
    this.speechSamples = 0;
    this.vad.reset();
    return w ? [w] : [];
  }
}
