/**
 * علم `tasmee_v2` — التسميع داخل المصحف. له مفتاح إيقاف طارئ محلي
 * (`localStorage["ssunnah-tasmee-v2"] = "0"`) أو عبر متغير البناء VITE_TASMEE_V2=0،
 * وفوقهما سياسة القناة والملف الحي `/data/tasmee-flags.json` (انظر decideTasmeeV2).
 */
import { fetchLiveJson } from "@/lib/live-config/fetch-live-json";
import { getTasmeeBuildChannel, type TasmeeBuildChannel } from "@/lib/tasmee/engine-plugin";

export const TASMEE_V2_FLAG_KEY = "ssunnah-tasmee-v2";

export function isTasmeeV2Enabled(): boolean {
  try {
    if ((import.meta.env as Record<string, string | undefined> | undefined)?.VITE_TASMEE_V2 === "0") return false;
  } catch {
    /* بيئة بلا import.meta.env */
  }
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem(TASMEE_V2_FLAG_KEY) === "0") {
      return false;
    }
  } catch {
    /* التخزين غير متاح */
  }
  return true;
}

export const TASMEE_FLAGS_REMOTE_PATH = "/data/tasmee-flags.json";

/**
 * سياسة الإطلاق: Debug/TestFlight مفعّل افتراضيًا والملف الحي يغلقه فقط (`testflight: false`)؛
 * App Store مغلق افتراضيًا ولا يُفتح إلا بـ`appStore: true` صريح، فأي تعذّر في الجلب يُبقيه مغلقًا.
 */
export function decideTasmeeV2(channel: TasmeeBuildChannel, remote: unknown): boolean {
  const r = remote && typeof remote === "object" ? (remote as { testflight?: unknown; appStore?: unknown }) : {};
  if (channel === "appstore") return r.appStore === true;
  if (channel === "web") return true;
  return r.testflight !== false;
}

let resolved: Promise<boolean> | null = null;

/** القيمة الفعّالة مرة لكل تشغيل: مفاتيح الإيقاف المحلية أولًا، ثم القناة والملف الحي. */
export function resolveTasmeeV2Enabled(timeoutMs = 4000): Promise<boolean> {
  if (!isTasmeeV2Enabled()) return Promise.resolve(false);
  resolved ??= getTasmeeBuildChannel().then(async (channel) =>
    channel === "web" ? true : decideTasmeeV2(channel, await fetchLiveJson(TASMEE_FLAGS_REMOTE_PATH, true, timeoutMs)),
  );
  return resolved;
}

/** للاختبارات فقط. */
export function __resetTasmeeV2Flag(): void {
  resolved = null;
}

/** هل يطلب الرابط وضع التسميع؟ (`?tasmee=1`) */
export function wantsTasmeeFromSearch(search: string): boolean {
  const qs = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return qs.get("tasmee") === "1";
}

/**
 * علم `tasmee_cloud_asr` — إرسال نوافذ صوت إلى مزوّد سحابي. **مغلق** في 1.1.0 (التسميع على الجهاز فقط)،
 * ولا مفتاح تشغيل له خارج الكود: فتحه تغيير كود مع ZDR وتصريح AudioData ونسخة متجر.
 */
export const TASMEE_CLOUD_ASR_ENABLED = false as const;

export function isTasmeeCloudAsrEnabled(): boolean {
  return TASMEE_CLOUD_ASR_ENABLED;
}
