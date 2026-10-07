/**
 * غلاف Capacitor لإضافة TasmeeEngine (Swift). على الويب/غير iOS: غير مدعوم (`isTasmeeNativeAvailable()` = false).
 */
import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { isIOS, isNative } from "@/lib/capacitor-utils";
import type {
  TasmeeAlignedWord,
  TasmeeDeviceInfo,
  TasmeeEngineApi,
  TasmeePartialEvent,
  TasmeeSessionDiagnostics,
  TasmeeThermalState,
} from "./types";

type ModelCall = { manifestJson: string };

interface TasmeeEnginePlugin {
  getDeviceInfo(): Promise<TasmeeDeviceInfo>;
  getBuildChannel(): Promise<{ channel: "debug" | "testflight" | "appstore" }>;
  getModelStatus(o: ModelCall): Promise<{ installed: boolean; bytesOnDisk: number; totalBytes: number; downloading: boolean }>;
  downloadModel(o: ModelCall): Promise<{ installed: boolean }>;
  cancelDownload(): Promise<void>;
  deleteModel(o: { modelId: string }): Promise<void>;
  loadModel(o: ModelCall): Promise<{ loaded: boolean }>;
  selfTest(): Promise<{ decodeMs: number }>;
  start(o: { prompt?: string; keepSessionAudio?: boolean }): Promise<void>;
  setPrompt(o: { text?: string }): Promise<void>;
  stop(): Promise<TasmeeSessionDiagnostics>;
  alignSession(): Promise<{ words: TasmeeAlignedWord[] }>;
  releaseSessionAudio(): Promise<void>;
  addListener(event: string, cb: (data: never) => void): Promise<PluginListenerHandle>;
}

export function isTasmeeNativeAvailable(): boolean {
  return isNative && isIOS;
}

let plugin: TasmeeEnginePlugin | null = null;
function native(): TasmeeEnginePlugin {
  if (!isTasmeeNativeAvailable()) throw new Error("وضع التسميع متاح في تطبيق iOS فقط");
  plugin ??= registerPlugin<TasmeeEnginePlugin>("TasmeeEngine");
  return plugin;
}

function listen<T>(event: string, cb: (d: T) => void): () => void {
  let handle: PluginListenerHandle | null = null;
  let removed = false;
  void native()
    .addListener(event, cb as (d: never) => void)
    .then((h) => (removed ? void h.remove() : (handle = h)));
  return () => {
    removed = true;
    void handle?.remove();
  };
}

export const tasmeeNative = {
  getDeviceInfo: () => native().getDeviceInfo(),
  getBuildChannel: () => native().getBuildChannel(),
  getModelStatus: (manifestJson: string) => native().getModelStatus({ manifestJson }),
  downloadModel: (manifestJson: string) => native().downloadModel({ manifestJson }),
  cancelDownload: () => native().cancelDownload(),
  deleteModel: (modelId: string) => native().deleteModel({ modelId }),
  loadModel: (manifestJson: string) => native().loadModel({ manifestJson }),
  selfTest: () => native().selfTest(),
  onDownloadProgress: (cb: (p: { received: number; total: number }) => void) => listen("tasmeeDownloadProgress", cb),
};

export function createTasmeeEngine(): TasmeeEngineApi {
  return {
    start: (o) => native().start(o),
    setPrompt: (text) => native().setPrompt({ text: text ?? undefined }),
    stop: () => native().stop(),
    alignSession: () => native().alignSession(),
    releaseSessionAudio: () => native().releaseSessionAudio(),
    onPartial: (cb) => listen<TasmeePartialEvent>("tasmeePartial", cb),
    onInterruption: (cb) => listen("tasmeeInterruption", cb),
    onThermal: (cb) => listen<{ state: TasmeeThermalState; degraded: boolean }>("tasmeeThermal", cb),
    onUnclear: (cb) => listen("tasmeeUnclear", cb),
    onFailure: (cb) => listen("tasmeeFailure", cb),
  };
}

/** شاشة القياس المخفية: iOS في بناء Debug أو TestFlight فقط (لا App Store). */
export async function isTasmeeDiagnosticsAllowed(): Promise<boolean> {
  if (!isTasmeeNativeAvailable()) return false;
  try {
    const { channel } = await tasmeeNative.getBuildChannel();
    return channel === "debug" || channel === "testflight";
  } catch {
    return false;
  }
}
