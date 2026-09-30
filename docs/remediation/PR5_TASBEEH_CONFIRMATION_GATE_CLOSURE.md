# PR5 — Tasbeeh Confirmation Gate Closure

## STATUS

- PARTIAL — hardening committed locally; awaiting CI green + merge/deploy of follow-up branch
  (`cursor/pr5-tasbeeh-confirm-gate-closure`). Original CI failure on PR5 (#2368 / `2424334`)
  was already fixed in-PR (`f985a069`) and merged as `109b8d961`.

## ROOT CAUSE

| Field | Value |
|---|---|
| test file | `artifacts/majalis/src/lib/__tests__/directories-maps-ux-p0-gate.test.ts` (via `test:ui-layout-gates`) |
| old assertion | `assert.match(tasbeeh, /window\.confirm\([\s\S]*تصفير/)` |
| new implementation | `confirmReset` + `role="alertdialog"` + Button تأكيد/إلغاء · no `window.confirm` |
| classification | **A. STALE_IMPLEMENTATION_ASSERTION** |

Cascade: UI layout fail → Start preview skipped → Visual snapshot gates skipped → must-not-skip → Verify build / ci-required.

## BEHAVIOR CONTRACT

| Action | Behavior |
|---|---|
| open confirmation | First press on «تصفير» → `openResetConfirm` · alertdialog visible · count unchanged |
| confirm | «تأكيد» / «تأكيد التصفير» → `confirmAndReset` → `reset()` once · dialog closes |
| cancel | «إلغاء» or Escape → `cancelResetConfirm` · count unchanged · dialog closes |
| keyboard | Escape cancels while confirming; Space/Enter increment only when not confirming |
| focus | On open → confirm action; on cancel/confirm → back to reset trigger |
| accessibility | `role="alertdialog"` · `aria-modal` · `aria-label="تأكيد التصفير"` · Button authority · named reset |

## FIX IMPLEMENTED

### files changed

- `artifacts/majalis/src/components/reading/TasbeehCounter.tsx` — Escape, focus restore, named handlers, keyboard hint while confirming
- `artifacts/majalis/src/lib/__tests__/directories-maps-ux-p0-gate.test.ts` — contract asserts alertdialog / no window.confirm / focus handlers
- `artifacts/majalis/src/lib/__tests__/tasbeeh-reset-confirmation-gate.test.ts` — dedicated regression gate
- `artifacts/majalis/package.json` — wire gate into `test:directories-maps-ux-p0`
- `docs/remediation/PR5_TASBEEH_CONFIRMATION_VISUAL_GATE_ROOT_CAUSE.md`
- `docs/remediation/PR5_TASBEEH_CONFIRMATION_GATE_CLOSURE.md`

### tests changed

Static contract + regression gate (no RTL/jsdom in package). Asserts two-step reset, cancel without reset, Escape, focus refs, Button authority, listener cleanup, PR5 forms gate alignment.

### behavior changes

Product already used in-page confirm (PR5). Hardening adds Escape cancel, focus move to confirm / restore to reset, and keyboard hint sync. Does **not** restore `window.confirm`.

### why correct

In-page alertdialog is the Forms/Feedback authority after PR5. Gate must assert that contract, not the old browser dialog technique.

## GATE RESULTS

| Gate | Result |
|---|---|
| UI layout gates | PASS (local) |
| Start preview | deferred to CI visual-snapshot job |
| Visual snapshot gates | deferred to CI (`test:visual` after preview) |
| must-not-skip | deferred to CI |
| visual-snapshot | deferred to CI |
| Color contrast | deferred to CI (unchanged scope) |
| Verify build | deferred to CI |
| ci-required | deferred to CI |
| verify:preflight | pending |
| verify:ci | pending |
| release:verify | pending if required |

## DEBT CHECK

| Metric | Before (this branch) | After |
|---|---|---|
| raw `<button` in TasbeehCounter | presets/ring only (pre-existing) | same · reset path uses `Button` |
| div/span onClick for reset | none | none |
| `!important` in tasbih.css | unchanged | unchanged |
| raw hex in this diff | none | none |
| `window.confirm` in TasbeehCounter | 0 | 0 |
| snapshots auto-updated | n/a | none (calendar/scroll artifacts reverted) |

## DELIVERY

| Field | Value |
|---|---|
| branch | `cursor/pr5-tasbeeh-confirm-gate-closure` |
| commit | pending |
| PR | pending |
| merge commit | original PR5 = `109b8d961` (#2368); hardening = pending |
| deployment | original PR5 already on production; hardening pending |
| version.json | pending post-deploy |
| smoke result | pending post-deploy `/tasbih` |

## FINAL DECISION

READY_FOR_MERGE — after local verify:ci + PR CI green (will update to MERGED_AND_DEPLOYED on success).
