# PR5 — Tasbeeh Confirmation / visual-snapshot Root Cause

| Field | Value |
|---|---|
| Captured | 2026-09-30 |
| Failing commit | `2424334005e85c6e4d58233831216c738a16ca05` |
| CI run (failure) | `36639585157` (workflow CI · visual-snapshot → UI layout gates) |
| Fix commit (same PR5) | `f985a069efc8db3fe0639e7547759c8e5ffc8440` |
| PR5 merge | #2368 → `109b8d961` · MERGED_AND_DEPLOYED |
| Reproduction | `pnpm --filter @workspace/majalis run test:directories-maps-ux-p0` inside `test:ui-layout-gates` |

## PHASE 1 — Reproduction

| Item | Finding |
|---|---|
| Failing job step | `UI layout gates (calendar + lessons…)` → `test:ui-layout-gates` → `test:directories-maps-ux-p0` |
| Test file | `artifacts/majalis/src/lib/__tests__/directories-maps-ux-p0-gate.test.ts` |
| Old assertions (on `2424334`) | `assert.match(tasbeeh, /window\.confirm\([\s\S]*تصفير/)` (×2) · `assert.match(tasbihView, /confirm\([\s\S]*حذف/)` |
| File under test | `src/components/reading/TasbeehCounter.tsx` (+ `TasbihView.tsx` for delete) |
| Why `window.confirm` was expected | Pre-PR5 contract used browser confirm for destructive reset |
| Implementation after PR5 product commit | `confirmReset` state · `role="alertdialog"` · Button تأكيد/إلغاء · no `window.confirm` |
| Functional delta | Same protection (two-step reset); better a11y / no blocking browser dialog |
| Accidental reset still prevented? | **Yes** — first press opens confirm; only «تأكيد» calls `reset()` |

Cascade: UI layout fail → Start preview skipped → Visual snapshot gates skipped → must-not-skip fail → Verify build / ci-required fail.

## PHASE 2 — Classification (one)

**A. STALE_IMPLEMENTATION_ASSERTION**

Product migration to in-page confirmation is correct. The gate still required the old `window.confirm` technique.

Residual gaps after the assertion fix (Escape / focus restore) are addressed in the closure hardening commit — not a reason to restore `window.confirm`.
