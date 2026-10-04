# MODAL_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-04 |
| Exit | `MODAL_AUTHORITY_ONLY` (product) |
| Wave | Eradication **PR H / Wave 5** |

No parallel modal kit. Compose Radix/shadcn primitives + product façades.

## Approved

| Intent | Component | Source |
|---|---|---|
| Centered dialog / form modal | `Dialog` (+ Content/Header/Footer) | `ui/dialog.tsx` |
| Destructive / confirm | `AlertDialog` · product `ConfirmDialog` | `ui/alert-dialog.tsx` · `design-system/ConfirmDialog.tsx` |
| Mobile sheet / filters / more | `AppBottomSheet` · `Sheet` | `ui/AppBottomSheet.tsx` · `ui/sheet.tsx` |
| Info / selection in sheet | `AppBottomSheet` + `Button` actions | same |
| Actions row | `FormActions` + `Button` | Form authority |

## Classification

| Surface | Class |
|---|---|
| Product Dialog / AlertDialog / ConfirmDialog / AppBottomSheet | **CANONICAL_AUTHORITY** / APPROVED |
| `VaultPage` AddNoteModal | APPROVED (`Dialog` + `Textarea`) |
| `AsmaaHusnaPage` name detail | APPROVED (`AppBottomSheet`) |
| `QuranNumbersView` stat sheet | APPROVED (`AppBottomSheet` — prior) |
| Filter / More / Update sheets using AppBottomSheet | APPROVED |
| `AdminConfirmDialog` + `.adm-modal*` | SPECIAL_CASE (ADMIN_ONLY) |
| Mushaf ayah sheets / bookmark editor portals | SPECIAL_CASE (MUSHAF_SPECIAL) |
| Remaining page-local `role=dialog` DIY | LEGACY — migrate when touched |
| `window.confirm` / `window.alert` in product | FORBIDDEN (NativeBack system exit · AdminConfirmDialog internals held) |

## Visual / behavior contract

| Rule | Value |
|---|---|
| Max width (center) | `max-w-lg` default · override sparingly |
| Padding | `p-6` rhythm on AlertDialog/Dialog content |
| Radius | `sm:rounded-lg` / `--radius-card` on sheets |
| Backdrop | dimmed overlay · click dismiss only if dismissible |
| Close | Escape · explicit cancel · optional backdrop · sheet drag |
| Focus | trap + restore · initial focus on cancel for destructive |
| Mobile | prefer `AppBottomSheet` for tall / filter UIs |
| z-index | `--z-overlay-*` / FloatingLayer policy — no raw stacking wars |

## Gates

`test:overlay-feedback-authority`
