/**
 * مزامنة تقدّم مسار الحفظ مع الحساب (ضيف ← حساب) عبر جدول user_progress الموجود (RLS: صفوف المستخدم نفسه).
 * سياسة الدمج: الأحدث (updatedAt) يفوز لكل وحدة، ولا حذف لما هو محلي أو سحابي فقط — كما في guest-cloud-merge.
 * المحلي يبقى مصدر الحقيقة أولًا؛ الدفع السحابي مؤجَّل (debounce) ويتجاهل غير المسجَّلين.
 */
import {
  exportHifzProgressForSync,
  HIFZ_PROGRESS_CHANGED_EVENT,
  mergeRemoteHifzRecords,
  type HifzUnitProgressRecord,
} from "./progress-store";

export const HIFZ_CLOUD_CONTENT_TYPE = "hifz_unit";
const PUSH_DEBOUNCE_MS = 3000;

export type HifzCloudRow = {
  user_id: string;
  content_type: typeof HIFZ_CLOUD_CONTENT_TYPE;
  content_id: string;
  content_title: string;
  content_url: string;
  progress_pct: number;
  last_position: HifzUnitProgressRecord;
  updated_at: string;
};

export function hifzCloudContentId(rec: Pick<HifzUnitProgressRecord, "pathSlug" | "unitId">): string {
  return `${rec.pathSlug}:${rec.unitId}`;
}

/** نسبة تقريبية للعرض فقط (لا شهادة حفظ). */
export function hifzProgressPct(state: HifzUnitProgressRecord["state"]): number {
  switch (state) {
    case "MEMORIZED_SELF_REPORTED":
    case "REVIEWED":
    case "DUE_FOR_REVIEW":
      return 100;
    case "IN_PROGRESS":
    case "NEEDS_REINFORCEMENT":
      return 50;
    default:
      return 0;
  }
}

export function toHifzCloudRow(userId: string, rec: HifzUnitProgressRecord): HifzCloudRow {
  return {
    user_id: userId,
    content_type: HIFZ_CLOUD_CONTENT_TYPE,
    content_id: hifzCloudContentId(rec),
    content_title: rec.unitTitle,
    content_url: `/hifz-path/p/${rec.pathSlug}/u/${rec.unitId}`,
    progress_pct: hifzProgressPct(rec.state),
    last_position: rec,
    updated_at: rec.updatedAt,
  };
}

/** يستخرج سجل الوحدة من صفّ سحابي (يتجاهل الصفوف التالفة). */
export function parseHifzCloudRow(row: {
  content_type?: string;
  last_position?: unknown;
}): Partial<HifzUnitProgressRecord> | null {
  if (row?.content_type !== HIFZ_CLOUD_CONTENT_TYPE) return null;
  const pos = row.last_position;
  if (!pos || typeof pos !== "object") return null;
  return pos as Partial<HifzUnitProgressRecord>;
}

type SupabaseLike = {
  from: (t: string) => any;
  auth: { getSession: () => Promise<{ data: { session: { user: { id: string } } | null } }> };
};

/** سحابي → محلي (الأحدث يفوز). */
export async function pullHifzProgress(supabase: SupabaseLike, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("content_type,last_position")
    .eq("user_id", userId)
    .eq("content_type", HIFZ_CLOUD_CONTENT_TYPE);
  if (error || !Array.isArray(data)) return 0;
  const records = (data as Array<{ content_type?: string; last_position?: unknown }>)
    .map(parseHifzCloudRow)
    .filter((r): r is Partial<HifzUnitProgressRecord> => r != null);
  return mergeRemoteHifzRecords(records);
}

/** محلي → سحابي (upsert بلا حذف). */
export async function pushHifzProgress(supabase: SupabaseLike, userId: string): Promise<number> {
  const rows = exportHifzProgressForSync().map((r) => toHifzCloudRow(userId, r));
  if (!rows.length) return 0;
  const { error } = await supabase
    .from("user_progress")
    .upsert(rows, { onConflict: "user_id,content_type,content_id" });
  return error ? 0 : rows.length;
}

/** سحب ثم دمج ثم دفع — آمن للتكرار. */
export async function syncHifzProgressNow(userId: string): Promise<{ pulled: number; pushed: number }> {
  if (!userId) return { pulled: 0, pushed: 0 };
  const { getSupabaseClient } = await import("@/lib/supabase-bootstrap");
  const supabase = getSupabaseClient() as unknown as SupabaseLike;
  const pulled = await pullHifzProgress(supabase, userId);
  const pushed = await pushHifzProgress(supabase, userId);
  return { pulled, pushed };
}

let listening = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * يدفع التغيّرات المحلية للحساب بعد هدوء 3 ثوانٍ؛ لا شيء للضيف. يُستدعى مرة عند ظهور جلسة.
 */
export function startHifzCloudSync(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(HIFZ_PROGRESS_CHANGED_EVENT, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void (async () => {
        try {
          const { getSupabaseClient } = await import("@/lib/supabase-bootstrap");
          const supabase = getSupabaseClient() as unknown as SupabaseLike;
          const { data } = await supabase.auth.getSession();
          const uid = data.session?.user.id;
          if (uid) await pushHifzProgress(supabase, uid);
        } catch {
          /* دفع اختياري — المحلي سليم */
        }
      })();
    }, PUSH_DEBOUNCE_MS);
  });
}
