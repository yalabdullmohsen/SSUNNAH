/**
 * Program 4 — Kuwait lesson event contract helpers.
 * Deterministic mapping/validation only — never invents events or verification timestamps.
 */

export const LESSON_ATTENDANCE_MODES = ["in_person", "online", "hybrid", "unknown"] as const;
export type LessonAttendanceMode = (typeof LESSON_ATTENDANCE_MODES)[number];

export const LESSON_CADENCE_KINDS = [
  "daily",
  "weekly",
  "monthly",
  "one_time",
  "recurring_other",
  "unknown",
] as const;
export type LessonCadenceKind = (typeof LESSON_CADENCE_KINDS)[number];

export const LESSON_EVENT_PIPELINE_STATUSES = [
  "SOURCE_APPROVED",
  "LICENSE_APPROVED",
  "VERSION_PINNED",
  "STRUCTURE_VALIDATED",
  "REFERENCE_VALIDATED",
  "PROVENANCE_COMPLETE",
  "READY_FOR_PUBLICATION",
  "PUBLISHED",
  "BLOCKED_SOURCE",
  "BLOCKED_LICENSE",
  "BLOCKED_REFERENCE",
  "BLOCKED_ATTRIBUTION",
  "BLOCKED_CONFLICT",
  "BLOCKED_INCOMPLETE",
  "BLOCKED_INTEGRITY",
  "BLOCKED_UNKNOWN",
  "CANCELLED",
  "SCHEDULE_CHANGED",
] as const;
export type LessonEventPipelineStatus = (typeof LESSON_EVENT_PIPELINE_STATUSES)[number];

export interface KuwaitLessonContractFields {
  attendanceMode: LessonAttendanceMode;
  cadenceKind: LessonCadenceKind;
  lastVerifiedAt?: string | null;
  sourceId?: string | null;
  sourceUrl?: string | null;
  cancelledAt?: string | null;
  scheduleChangeNote?: string | null;
  bookTitle?: string | null;
  subject?: string | null;
  pipelineStatus?: LessonEventPipelineStatus | null;
}

export function normalizeAttendanceMode(
  delivery: unknown,
  opts?: { hasLiveStream?: boolean; hasMosque?: boolean },
): LessonAttendanceMode {
  const raw = String(delivery || "").trim();
  if (/كلاهما|هجين|hybrid/iu.test(raw)) return "hybrid";
  if (/حضور\s*فقط|حضوري|in[_\s-]?person/iu.test(raw)) return "in_person";
  if (/أونلاين|عن\s*بعد|online|إلكتروني/iu.test(raw)) return "online";
  if (opts?.hasLiveStream && opts?.hasMosque) return "hybrid";
  if (opts?.hasLiveStream && !opts?.hasMosque) return "online";
  if (opts?.hasMosque) return "in_person";
  return "unknown";
}

export function inferCadenceKind(row: {
  is_recurring?: unknown;
  is_course?: unknown;
  activity_type?: unknown;
  end_date?: unknown;
  start_date?: unknown;
  day_of_week?: unknown;
  day?: unknown;
}): LessonCadenceKind {
  const activity = String(row.activity_type || "");
  if (/يومي|daily/iu.test(activity)) return "daily";
  if (/شهري|monthly/iu.test(activity) || row.is_course) return "monthly";
  if (row.is_recurring === false && (row.start_date || row.end_date)) return "one_time";
  if (row.day_of_week || row.day) return "weekly";
  if (row.is_recurring !== false) return "recurring_other";
  return "unknown";
}

export interface KuwaitLessonContractIssue {
  code: string;
  message: string;
  field?: string;
}

/** Structural checks on mapped contract fields — does not invent missing provenance. */
export function validateKuwaitLessonContractFields(
  fields: Partial<KuwaitLessonContractFields> & { id?: string; title?: string },
): KuwaitLessonContractIssue[] {
  const issues: KuwaitLessonContractIssue[] = [];
  if (fields.attendanceMode && !LESSON_ATTENDANCE_MODES.includes(fields.attendanceMode)) {
    issues.push({ code: "BAD_ATTENDANCE", field: "attendanceMode", message: String(fields.attendanceMode) });
  }
  if (fields.cadenceKind && !LESSON_CADENCE_KINDS.includes(fields.cadenceKind)) {
    issues.push({ code: "BAD_CADENCE", field: "cadenceKind", message: String(fields.cadenceKind) });
  }
  if (fields.pipelineStatus && !LESSON_EVENT_PIPELINE_STATUSES.includes(fields.pipelineStatus)) {
    issues.push({ code: "BAD_PIPELINE", field: "pipelineStatus", message: String(fields.pipelineStatus) });
  }
  if (fields.lastVerifiedAt) {
    const t = Date.parse(fields.lastVerifiedAt);
    if (Number.isNaN(t)) {
      issues.push({ code: "BAD_VERIFIED_AT", field: "lastVerifiedAt", message: fields.lastVerifiedAt });
    }
  }
  if (fields.cancelledAt && fields.pipelineStatus && fields.pipelineStatus === "PUBLISHED") {
    issues.push({
      code: "CANCELLED_PUBLISHED",
      field: "pipelineStatus",
      message: "cancelled events must not remain PUBLISHED as upcoming",
    });
  }
  return issues;
}

/** Upcoming list eligibility — cancelled/expired must not appear as upcoming. */
export function isEligibleAsUpcoming(input: {
  cancelledAt?: string | null;
  archivedAt?: string | null;
  scheduleChangeNote?: string | null;
}): { eligible: boolean; reason?: string } {
  if (input.cancelledAt) return { eligible: false, reason: "CANCELLED" };
  if (input.archivedAt) return { eligible: false, reason: "ARCHIVED" };
  return { eligible: true };
}

export function publicScheduleLabel(input: {
  cancelledAt?: string | null;
  scheduleChangeNote?: string | null;
}): "cancelled" | "changed" | "scheduled" {
  if (input.cancelledAt) return "cancelled";
  if (input.scheduleChangeNote?.trim()) return "changed";
  return "scheduled";
}
