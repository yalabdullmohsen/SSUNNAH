/**
 * Program 4 — Kuwait lesson contract (model / provenance / cancel).
 * Run: node --import tsx src/lib/__tests__/kuwait-lessons-model-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  inferCadenceKind,
  isEligibleAsUpcoming,
  normalizeAttendanceMode,
  publicScheduleLabel,
  validateKuwaitLessonContractFields,
} from "../kuwait-lesson-contract.ts";
import { mapLessonRow, splitKuwaitLessons } from "../kuwait-lessons.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const readDoc = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

for (const doc of [
  "docs/lessons/KUWAIT_LESSON_DATA_MODEL.md",
  "docs/lessons/KUWAIT_LESSON_SOURCE_MATRIX.md",
  "docs/lessons/KUWAIT_LESSON_VALIDATION.md",
  "docs/remediation/waves/WAVE_KUWAIT_LESSONS_MODEL_W1.md",
]) {
  assert.ok(existsSync(resolve(repo, doc)), `missing ${doc}`);
  assert.match(readDoc(doc), /Never fabricate|لا|Program 4|KUWAIT/i);
}

assert.equal(normalizeAttendanceMode("حضور فقط"), "in_person");
assert.equal(normalizeAttendanceMode("كلاهما"), "hybrid");
assert.equal(normalizeAttendanceMode("أونلاين"), "online");
assert.equal(normalizeAttendanceMode(""), "unknown");
assert.equal(normalizeAttendanceMode("", { hasLiveStream: true, hasMosque: true }), "hybrid");

assert.equal(inferCadenceKind({ day_of_week: "الأحد", is_recurring: true }), "weekly");
assert.equal(inferCadenceKind({ is_course: true }), "monthly");
assert.equal(inferCadenceKind({ is_recurring: false, start_date: "2026-01-01" }), "one_time");

assert.equal(publicScheduleLabel({ cancelledAt: "2026-01-01" }), "cancelled");
assert.equal(publicScheduleLabel({ scheduleChangeNote: "تأجيل ساعة" }), "changed");
assert.equal(publicScheduleLabel({}), "scheduled");

assert.equal(isEligibleAsUpcoming({ cancelledAt: "2026-01-01" }).eligible, false);
assert.equal(isEligibleAsUpcoming({}).eligible, true);

const bad = validateKuwaitLessonContractFields({
  cancelledAt: "2026-01-01",
  pipelineStatus: "PUBLISHED",
});
assert.ok(bad.some((i) => i.code === "CANCELLED_PUBLISHED"));

const chunk = JSON.parse(
  readFileSync(resolve(root, "public/data/lessons/chunk-000.json"), "utf8"),
) as Array<Record<string, unknown>>;
assert.ok(chunk.length > 0);

const mapped = chunk.map((row) => mapLessonRow({ ...row, source: "seed" }));
for (const lesson of mapped) {
  assert.ok(lesson.attendanceMode, `attendanceMode missing: ${lesson.id}`);
  assert.ok(lesson.cadenceKind, `cadenceKind missing: ${lesson.id}`);
  const issues = validateKuwaitLessonContractFields(lesson);
  assert.equal(issues.length, 0, JSON.stringify({ id: lesson.id, issues }));
  // Honesty: seed must not invent lastVerifiedAt
  assert.equal(lesson.lastVerifiedAt ?? null, null, `invented lastVerifiedAt on ${lesson.id}`);
}

const cancelled = mapLessonRow({
  ...chunk[0],
  id: "contract-cancel-probe",
  external_key: "contract-cancel-probe",
  cancelled_at: "2026-01-15T00:00:00+03:00",
  source: "seed",
});
assert.equal(cancelled.pipelineStatus, "CANCELLED");
assert.equal(publicScheduleLabel(cancelled), "cancelled");
const { active, archived } = splitKuwaitLessons([cancelled]);
assert.equal(active.length, 0);
assert.equal(archived.length, 1);

console.log("kuwait-lessons-model-contract-gate.test.ts: ok");
