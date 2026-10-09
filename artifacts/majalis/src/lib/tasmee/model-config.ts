/**
 * إعداد نموذج التسميع: manifest مثبَّت في التطبيق (الحجم وSHA-256 لكل ملف) + رابط أرشيف قابل للتبديل عن بُعد.
 *
 * التبديل يمرّ عبر `/data/tasmee-model.json` المنشور مع الموقع (بلا إصدار تطبيق): يغيّر `archive.url` فقط
 * وللـmodelId نفسه فقط، فالسلامة تبقى مربوطة بـSHA-256 المثبَّت هنا ويرفض المنزِّل (Swift) أي أرشيف مختلف.
 *
 * الافتراضي base-q6 (56MB). fp16 احتياطي مثبَّت غير افتراضي: لا يُختار إلا إن سمّاه الإعداد البعيد بـmodelId،
 * ولا يُنزَّل إلا بموافقة المستخدم كأي نموذج.
 */
import bundled from "../../../../../docs/tasmee/model-manifest-base-q6.json";
import fallback from "../../../../../docs/tasmee/model-manifest-base.json";
import { NATIVE_API_ORIGIN } from "@/lib/native-api-base";

export type TasmeeManifest = typeof bundled;

export type TasmeeModelRemoteConfig = { modelId?: unknown; archiveUrl?: unknown };

export const TASMEE_MODEL_REMOTE_PATH = "/data/tasmee-model.json";

/** يطبّق الإعداد البعيد على المثبَّت: رابط https للنموذج نفسه فقط، وإلا يبقى المثبَّت. */
export function applyRemoteModelConfig(base: TasmeeManifest, remote: unknown): TasmeeManifest {
  if (!remote || typeof remote !== "object") return base;
  const r = remote as TasmeeModelRemoteConfig;
  if (r.modelId !== base.modelId || typeof r.archiveUrl !== "string") return base;
  let url: URL;
  try {
    url = new URL(r.archiveUrl);
  } catch {
    return base;
  }
  if (url.protocol !== "https:") return base;
  return { ...base, archive: { ...base.archive, url: url.toString() } };
}

/** في التطبيق الأصلي الأصل محلي (capacitor://) فيُجلب الإعداد من الموقع المنشور. */
export function remoteModelConfigUrl(native: boolean, now = Date.now()): string {
  return `${native ? NATIVE_API_ORIGIN : ""}${TASMEE_MODEL_REMOTE_PATH}?t=${now}`;
}

let cached: TasmeeManifest | null = null;

/** manifest النموذج الفعّال؛ أي فشل في الجلب (بلا شبكة/مهلة) يعود إلى المثبَّت. */
export async function resolveTasmeeManifest(native: boolean, timeoutMs = 4000): Promise<TasmeeManifest> {
  if (cached) return cached;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(remoteModelConfigUrl(native), { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) return bundled;
    const remote: unknown = await res.json();
    const pick = (remote as TasmeeModelRemoteConfig | null)?.modelId === fallback.modelId ? fallback : bundled;
    cached = applyRemoteModelConfig(pick, remote);
    return cached;
  } catch {
    return bundled;
  } finally {
    clearTimeout(timer);
  }
}

export const bundledTasmeeManifest: TasmeeManifest = bundled;

/** fp16 الاحتياطي: غير افتراضي، يُختار عن بُعد بالـmodelId فقط. */
export const fallbackTasmeeManifest: TasmeeManifest = fallback;

/** حجم التنزيل بالميغابايت (أرشيف) للعرض في شاشة الموافقة. */
export function downloadSizeMB(m: TasmeeManifest): number {
  return Math.round(m.archive.size / 1_000_000);
}

/** للاختبارات فقط. */
export function __resetTasmeeManifestCache(): void {
  cached = null;
}
