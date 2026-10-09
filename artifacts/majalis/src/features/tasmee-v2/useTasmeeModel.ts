/** حالة نموذج التسميع على الجهاز: فحص → موافقة → تنزيل (Wi-Fi فقط، مستأنف) → جاهز. */
import { useCallback, useEffect, useReducer, useRef } from "react";
import { isTasmeeNativeAvailable, tasmeeNative } from "@/lib/tasmee/engine-plugin";
import { bundledTasmeeManifest, resolveTasmeeManifest, type TasmeeManifest } from "@/lib/tasmee/model-config";

export type ModelPhase = "unsupported" | "checking" | "missing" | "paused" | "downloading" | "ready" | "error";

export type ModelState = {
  phase: ModelPhase;
  received: number;
  total: number;
  error: "wifi" | "other" | null;
};

export type ModelAction =
  | { type: "status"; installed: boolean; bytesOnDisk: number; total: number; downloading: boolean }
  | { type: "start" }
  | { type: "progress"; received: number; total: number }
  | { type: "done" }
  | { type: "failed"; code?: string };

export const initialModelState = (supported: boolean): ModelState => ({
  phase: supported ? "checking" : "unsupported",
  received: 0,
  total: bundledTasmeeManifest.archive.size,
  error: null,
});

export function modelReducer(s: ModelState, a: ModelAction): ModelState {
  switch (a.type) {
    case "status":
      if (a.installed) return { phase: "ready", received: a.total, total: a.total, error: null };
      return {
        phase: a.downloading ? "downloading" : a.bytesOnDisk > 0 ? "paused" : "missing",
        received: a.bytesOnDisk,
        total: a.total,
        error: null,
      };
    case "start":
      return { ...s, phase: "downloading", error: null };
    case "progress":
      return s.phase === "downloading" ? { ...s, received: Math.max(s.received, a.received), total: a.total } : s;
    case "done":
      return { ...s, phase: "ready", received: s.total, error: null };
    case "failed":
      if (a.code === "cancelled") return { ...s, phase: s.received > 0 ? "paused" : "missing", error: null };
      return { ...s, phase: "error", error: a.code === "wifi_required" ? "wifi" : "other" };
  }
}

/** نسبة التقدّم 0–100. */
export function modelPercent(s: Pick<ModelState, "received" | "total">): number {
  return s.total > 0 ? Math.min(100, Math.floor((s.received / s.total) * 100)) : 0;
}

export function useTasmeeModel() {
  const supported = isTasmeeNativeAvailable();
  const [state, dispatch] = useReducer(modelReducer, supported, initialModelState);
  const manifestRef = useRef<TasmeeManifest | null>(null);

  const manifest = useCallback(async () => {
    manifestRef.current ??= await resolveTasmeeManifest(true);
    return manifestRef.current;
  }, []);

  const refresh = useCallback(async () => {
    if (!supported) return;
    try {
      const m = await manifest();
      const st = await tasmeeNative.getModelStatus(JSON.stringify(m));
      dispatch({ type: "status", installed: st.installed, bytesOnDisk: st.bytesOnDisk, total: m.archive.size, downloading: st.downloading });
    } catch {
      dispatch({ type: "failed" });
    }
  }, [supported, manifest]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supported) return;
    return tasmeeNative.onDownloadProgress((p) => dispatch({ type: "progress", received: p.received, total: p.total }));
  }, [supported]);

  const download = useCallback(async () => {
    if (!supported) return;
    dispatch({ type: "start" });
    try {
      const m = await manifest();
      await tasmeeNative.downloadModel(JSON.stringify(m));
      dispatch({ type: "done" });
    } catch (e) {
      dispatch({ type: "failed", code: (e as { code?: string } | null)?.code });
    }
  }, [supported, manifest]);

  const cancel = useCallback(() => {
    void tasmeeNative.cancelDownload();
  }, []);

  return { state, download, cancel, refresh };
}
