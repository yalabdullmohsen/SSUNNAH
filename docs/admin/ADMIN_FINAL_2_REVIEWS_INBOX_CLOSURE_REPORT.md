# ADMIN-FINAL-2 — Reviews Inbox Unify

| Field | Value |
|---|---|
| Status | **ADMIN_FINAL_2** (pending MERGED_AND_DEPLOYED) |
| Canonical | `/admin/v3/reviews` · `ReviewInboxPage` |
| API | `/api/admin/submissions` (+ `queue`) |
| Gate | `admin-final-2-reviews-inbox-gate.test.ts` |
| Base tip | `4db59aa62` |

## Official queues

Pending · Assigned to me · Urgent · Scientific · Editorial · Approved · Rejected · Published · Archived

## Guarantees

| Requirement | Implementation |
|---|---|
| No duplicate rows | `dedupeRows` by `id` |
| No double approve/reject | `busy` lock + server `status=pending` + `already_reviewed` 409 |
| Server authorization | `requireAdminAccess` + permission checks |
| Audit | `logGovernanceEvent` / `emitAdminV3AuditEvent` |
| Conflict | `expectedUpdatedAt` → 409 |
| Reject reason | required ≥3 chars (UI + API 422) |
| Filter/page persistence | URL `?queue=&type=&q=&page=` |
| No raw API/DB errors | `userMessageAr` + `sendSafeError` |
| RTL / keyboard | Admin v3 primitives + Button/FormFields |

## Legacy classification

| Surface | Status |
|---|---|
| `/admin/v3/reviews` | **V3_CANONICAL** |
| `/admin/v3/review` | **V3_ALIAS** → reviews |
| `/admin/review-hub` | **LEGACY_KEEP** (audio hub — different domain) |
| `/admin/review-center` | **LEGACY_KEEP** (automation queue) |
| `/admin?section=submissions` | **LEGACY_KEEP** / same submissions API |

## OWNER_ACTION

`assigned_to_me` UI ready; needs assignee column/schema before live assignment (not applied to production SQL here).

## Closure

`ADMIN_FINAL_2_MERGED_AND_DEPLOYED` after merge · deploy · version MATCH · smoke `/admin` 404 public.
