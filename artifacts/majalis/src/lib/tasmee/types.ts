/** عقد جسر Swift ↔ JS لوضع «تسميع» (ios/App/App/Tasmee/TasmeeEnginePlugin.swift). */

export type TasmeePartialEvent = {
  seq: number;
  text: string;
  /** ms من بدء الجلسة */
  windowStartMs: number;
  windowEndMs: number;
  computeMs: number;
  finishedAtMs: number;
};

export type TasmeeThermalState = "nominal" | "fair" | "serious" | "critical" | "unknown";

export type TasmeeDeviceInfo = {
  model: string;
  osVersion: string;
  physicalMemoryMB: number;
  thermalState: TasmeeThermalState;
  lowPowerMode: boolean;
  loaded: boolean;
  running: boolean;
};

export type TasmeeSessionDiagnostics = {
  durationSec: number;
  decodes: number;
  decodeMeanMs: number;
  decodeP95Ms: number;
  decodeMaxMs: number;
  cpuMeanPercent: number;
  cpuPeakPercent: number;
  thermalStart: TasmeeThermalState;
  thermalEnd: TasmeeThermalState;
  thermalMax: TasmeeThermalState;
  thermalTrace: Array<{ tSec: number; state: TasmeeThermalState }>;
  /** 0..1، أو -1 إن تعذّرت القراءة */
  batteryStart: number;
  batteryEnd: number;
  batteryState: string;
  vadSkippedTicks: number;
  /** نوافذ سُمع فيها كلام (VAD) وعاد النموذج بنص فارغ — لمعرفة هل تظهر مشكلة «النص الفارغ» على الجهاز */
  speechWithoutTextWindows: number;
  /** لحظات (ث من بدء الجلسة) ظهر فيها تلميح «لم يتضح الصوت» */
  unclearHintsAtSec: number[];
  deviceModel: string;
  osVersion: string;
};

export type TasmeeAlignedWord = { word: string; startMs: number; endMs: number };

/** الواجهة التي تستهلكها TasmeeSession — يمكن استبدالها بمحاكٍ في الاختبارات. */
export interface TasmeeEngineApi {
  start(opts: { prompt?: string; keepSessionAudio?: boolean }): Promise<void>;
  setPrompt(text: string | null): Promise<void>;
  stop(): Promise<TasmeeSessionDiagnostics>;
  alignSession(): Promise<{ words: TasmeeAlignedWord[] }>;
  releaseSessionAudio(): Promise<void>;
  onPartial(cb: (p: TasmeePartialEvent) => void): () => void;
  onInterruption(cb: (e: { began: boolean; shouldResume: boolean }) => void): () => void;
  onThermal(cb: (e: { state: TasmeeThermalState; degraded: boolean }) => void): () => void;
  /** كلام مرصود ≥ 4ث متتالية والنموذج يعيد نصًا فارغًا */
  onUnclear(cb: (e: { voicedSeconds: number }) => void): () => void;
  onFailure(cb: (e: { message: string }) => void): () => void;
}
