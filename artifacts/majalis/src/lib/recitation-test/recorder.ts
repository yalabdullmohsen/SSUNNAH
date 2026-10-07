/**
 * تسجيل صوتي قصير للتلاوة عبر MediaRecorder — بلا تخزين: الـBlob يبقى في الذاكرة ويُتلَف بعد الإرسال.
 * يختار أول صيغة يدعمها المتصفح (webm/opus في Chrome، mp4/aac في Safari/WKWebView).
 */
export const MAX_RECORDING_MS = 45_000;
export const MIN_RECORDING_MS = 1_500;

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"] as const;

export function pickRecordingMime(isSupported?: (m: string) => boolean): string | "" {
  const check =
    isSupported ??
    ((m: string) => typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m));
  return MIME_CANDIDATES.find((m) => check(m)) ?? "";
}

export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

export type RecordingResult = { blob: Blob; mimeType: string; durationMs: number };

export type RecorderSession = {
  /** يوقف التسجيل ويُرجع النتيجة (أو يرفض عند الإلغاء). */
  stop: () => Promise<RecordingResult>;
  /** يلغي ويحرّر الميكروفون فورًا بلا نتيجة. */
  cancel: () => void;
};

/** يطلب الميكروفون ويبدأ التسجيل؛ يرمي NotAllowedError/NotFoundError كما هي لتعالجها الواجهة. */
export async function startRecording(onAutoStop?: (r: RecordingResult) => void): Promise<RecorderSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const mime = pickRecordingMime();
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  const startedAt = Date.now();
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let resolveStop: ((r: RecordingResult) => void) | null = null;
  let rejectStop: ((e: Error) => void) | null = null;

  const release = () => {
    if (timer) clearTimeout(timer);
    stream.getTracks().forEach((t) => t.stop());
  };

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = () => {
    release();
    if (settled) return;
    settled = true;
    const type = recorder.mimeType || mime || "audio/webm";
    const result: RecordingResult = { blob: new Blob(chunks, { type }), mimeType: type, durationMs: Date.now() - startedAt };
    if (resolveStop) resolveStop(result);
    else onAutoStop?.(result);
  };

  recorder.start();
  timer = setTimeout(() => {
    if (recorder.state === "recording") recorder.stop();
  }, MAX_RECORDING_MS);

  return {
    stop: () =>
      new Promise<RecordingResult>((resolve, reject) => {
        resolveStop = resolve;
        rejectStop = reject;
        if (recorder.state === "recording") recorder.stop();
        else reject(new Error("لا تسجيل جارٍ."));
      }),
    cancel: () => {
      settled = true;
      rejectStop?.(new Error("أُلغي التسجيل."));
      if (recorder.state === "recording") recorder.stop();
      release();
      chunks.length = 0;
    },
  };
}

/** Blob → base64 (بدون ترويسة data:). */
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < buf.length; i += step) binary += String.fromCharCode(...buf.subarray(i, i + step));
  return btoa(binary);
}
