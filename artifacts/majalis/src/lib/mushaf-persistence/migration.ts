/**
 * ترحيل مفاتيح المصحف — idempotent · versioned · لا يحذف legacy · لا يستبدل أحدث بأقدم بلا قاعدة.
 */
import {
  MUSHAF_AYAH_MARKS_KEY,
  MUSHAF_AYAH_MARKS_LEGACY_KEY,
  MUSHAF_KHATMAH_PLANS_LEGACY_KEY,
  MUSHAF_KHATMAH_TRACKER_KEY,
  MUSHAF_PERSISTENCE_CONTRACT_VERSION,
  MUSHAF_PERSISTENCE_VERSION_KEY,
} from "./keys";
import { trackOps } from "@/lib/ops-telemetry";

function lsGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* quota */
  }
}

export type MushafMigrationReport = {
  version: number;
  ayahMarksMigrated: boolean;
  khatmaNoted: boolean;
  skipped: boolean;
};

/**
 * شغّل ترحيلات المصحف مرة لكل عقد.
 * - ayah marks: legacy → canonical إن كان الكانوني فارغًا فقط.
 * - khatma: يُبقي المفتاحين؛ يسجّل وجود legacy دون دمج تدميري.
 */
export function runMushafPersistenceMigration(): MushafMigrationReport {
  const report: MushafMigrationReport = {
    version: MUSHAF_PERSISTENCE_CONTRACT_VERSION,
    ayahMarksMigrated: false,
    khatmaNoted: false,
    skipped: false,
  };

  try {
    const applied = lsGet(MUSHAF_PERSISTENCE_VERSION_KEY);
    const appliedN = applied ? Number.parseInt(applied, 10) : 0;
    if (Number.isFinite(appliedN) && appliedN >= MUSHAF_PERSISTENCE_CONTRACT_VERSION) {
      // ما زلنا نعيد تطبيق خطوات idempotent آمنة (لا ضرر)
      report.skipped = false;
    }

    // Ayah marks: لا تستبدل قيمة كانونية موجودة
    const canonical = lsGet(MUSHAF_AYAH_MARKS_KEY);
    const legacy = lsGet(MUSHAF_AYAH_MARKS_LEGACY_KEY);
    if ((canonical == null || canonical === "") && legacy != null && legacy !== "") {
      lsSet(MUSHAF_AYAH_MARKS_KEY, legacy === "1" || legacy === "true" ? "1" : "0");
      report.ayahMarksMigrated = true;
    }

    // Khatma: وثّق التعارض المحتمل دون حذف
    const tracker = lsGet(MUSHAF_KHATMAH_TRACKER_KEY);
    const plans = lsGet(MUSHAF_KHATMAH_PLANS_LEGACY_KEY);
    if (plans != null && plans !== "" && (tracker == null || tracker === "")) {
      // لا نسخ تدميري لشكل JSON مختلف — أبقِ legacy وا defer unification لمرحلة لاحقة
      report.khatmaNoted = true;
    } else if (plans != null && tracker != null && plans !== tracker) {
      report.khatmaNoted = true;
    }

    lsSet(MUSHAF_PERSISTENCE_VERSION_KEY, String(MUSHAF_PERSISTENCE_CONTRACT_VERSION));

    trackOps("bookmark.migration", {
      version: report.version,
      ayahMarksMigrated: report.ayahMarksMigrated,
      khatmaNoted: report.khatmaNoted,
    });
  } catch {
    /* never throw */
  }

  return report;
}
