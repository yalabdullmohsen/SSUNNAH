# ADMIN-FINAL-5 — Dialogs and Forms Closure

| Field | Value |
|---|---|
| Status | **ADMIN_FINAL_5** (pending MERGED_AND_DEPLOYED) |
| Base tip | `bb436b24` (ADMIN-FINAL-4 MATCH) |
| Gate | `admin-final-5-dialogs-forms-gate.test.ts` |
| Authority | `components/admin/AdminConfirmDialog.tsx` — `useAdminConfirm` · `useAdminAlert` · `useAdminPrompt` |

## Before → After

| Metric | Before | After |
|---|---|---|
| Browser `confirm/prompt/alert` in live Admin (`views/admin` + `admin-v3`) | 54 call sites | **0** |
| Authority hooks | confirm only (partial Categories/Tree) | confirm + alert + prompt |

## Replacements

| Pattern | Replacement |
|---|---|
| `confirm("…")` / `window.confirm` | `await confirm({ title, body, danger, confirmLabel })` |
| `alert("…")` / `window.alert` | `await alert("…")` via `useAdminAlert` |
| `prompt("…")` / `window.prompt` | `await prompt({ title, label, confirmLabel, required })` via `useAdminPrompt` |

## Contracts enforced

- Validation before submit (existing forms + alert on missing fields).
- Focus to Cancel (confirm) / OK (alert) / input (prompt); Escape cancels confirm/prompt/alert.
- Destructive confirm is not default focus (Cancel focused first).
- No double-submit via busy flags on existing save paths; confirm awaits before mutation.
- Inputs preserved on network failure (forms unchanged; alert only).
- RTL · Admin shell geometry · no Feedback V3 · no new design system.
- Safe Arabic messages — no raw stack traces from new dialogs.

## Surfaces migrated (Legacy live Admin)

Qa · Quiz · Lessons · Sheikhs · Fawaid · Library · Miracles · Arbaeen · WeekDayFacts · Adhkar · AnnualCourses · Updates · Relationships · LearningPaths · AssessmentManager · LearningPathTreeEditor · Categories · Telegram (Channels/Review) · AutoContent · Rulings

Admin v3 Entity/Taxonomy/Users already used `AdminConfirmDialog` (FINAL-3/4) — no browser dialogs.

## Gate

`admin-final-5-dialogs-forms-gate.test.ts` fails on any new:

- `window.confirm|prompt|alert`
- bare `confirm("…")` / `prompt("…")`
- bare `alert(` (allows `await alert(` from `useAdminAlert`)

## Prior phase seal

ADMIN-FINAL-4 = **MERGED_AND_DEPLOYED** · tip `bb436b24` · production MATCH · Auto Deploy success · `/admin` 404 public.

## Closure

`ADMIN_FINAL_5_MERGED_AND_DEPLOYED` after focused tests · verify:preflight · verify:ci · merge · deploy · version MATCH · smoke.
