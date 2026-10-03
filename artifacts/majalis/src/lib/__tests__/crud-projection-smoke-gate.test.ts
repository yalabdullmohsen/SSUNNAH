/**
 * Non-destructive Admin/Library/Account read contracts via fixtures + projections.
 * Live Staging smoke = STAGING_REQUIRED.
 * Run: node --import tsx src/lib/__tests__/crud-projection-smoke-gate.test.ts
 */
import assert from "node:assert/strict";
import {
  AUTO_IMPORTED_CONTENT_COLS,
  AUTO_IMPORTED_CONTENT_PUBLIC_COLS,
  CATEGORIES_COLS,
  DAWAH_QUEUE_COLS,
  LEARNING_PATH_COLS,
  RESEARCHER_PROFILES_COLS,
  STUDY_SESSIONS_COLS,
  USER_NOTES_COLS,
  USER_PROGRESS_COLS,
  USER_SUBMISSIONS_COLS,
} from "@/lib/db-select-columns";

function cols(list: string): Set<string> {
  return new Set(list.split(",").map((s) => s.trim()).filter(Boolean));
}

function assertHas(set: Set<string>, required: string[], label: string) {
  for (const r of required) {
    assert.ok(set.has(r), `${label} missing ${r}`);
  }
}

function assertLacks(set: Set<string>, forbidden: string[], label: string) {
  for (const f of forbidden) {
    assert.ok(!set.has(f), `${label} must not expose ${f}`);
  }
}

// ADMIN — list/edit consumed fields
const adminAuto = cols(AUTO_IMPORTED_CONTENT_COLS);
assertHas(adminAuto, ["id", "title", "status", "ai_analysis", "structured_data", "error_details"], "admin auto");
assertHas(cols(CATEGORIES_COLS), ["id", "name", "slug", "parent_id", "status"], "categories");
assertHas(cols(LEARNING_PATH_COLS), ["id", "slug", "title", "status"], "learning_paths");
assertHas(cols(DAWAH_QUEUE_COLS.dawah_shubuhat), ["id", "title", "short_answer", "status"], "dawah queue");
assertLacks(cols(DAWAH_QUEUE_COLS.dawah_shubuhat), ["detailed_refutation", "shubha_text"], "dawah queue");

// LIBRARY — public minimal
const pub = cols(AUTO_IMPORTED_CONTENT_PUBLIC_COLS);
assertHas(pub, ["id", "title", "summary", "slug", "status", "published_at"], "library public");
assertLacks(pub, ["ai_analysis", "structured_data", "error_details"], "library public");

// ACCOUNT — ownership preserved
assertHas(cols(USER_PROGRESS_COLS), ["user_id", "content_type", "content_id", "progress_pct"], "progress");
assertHas(cols(USER_SUBMISSIONS_COLS), ["user_id", "status", "title"], "submissions");
assertHas(cols(USER_NOTES_COLS), ["user_id", "note_text"], "vault notes");
assertHas(cols(STUDY_SESSIONS_COLS), ["user_id", "duration_minutes", "session_date"], "sessions");
assertHas(cols(RESEARCHER_PROFILES_COLS), ["user_id", "display_name", "is_public"], "researcher");

// Mocked PostgREST row shapes populate forms without missing keys
const mockAdminRow: Record<string, unknown> = Object.fromEntries([...adminAuto].map((k) => [k, null]));
mockAdminRow.id = "a1";
mockAdminRow.title = "عنوان";
for (const k of ["id", "title", "status"]) assert.ok(k in mockAdminRow);

const mockPublicRow: Record<string, unknown> = Object.fromEntries([...pub].map((k) => [k, null]));
assert.ok(!("ai_analysis" in mockPublicRow));

const mockAccount = { user_id: "u1", content_type: "lesson", content_id: "l1", progress_pct: 10 };
for (const k of ["user_id", "content_type", "content_id"]) assert.ok(k in mockAccount);

console.log("crud-projection-smoke-gate: ok (ADMIN/LIBRARY/ACCOUNT contracts; live=STAGING_REQUIRED)");
