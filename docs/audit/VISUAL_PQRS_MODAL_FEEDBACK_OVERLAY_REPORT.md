# Visual P–S — Modal · Feedback · Status · Overlay

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave`

## Phase P — MODAL_AUTHORITY_ONLY

| Class | Surfaces |
|---|---|
| APPROVED | Dialog · AlertDialog · product `ConfirmDialog` · AppBottomSheet / Sheet |
| SPECIAL_CASE | AdminConfirmDialog · Mushaf sheets |
| LEGACY | page-local dialog markup |

Map: `docs/design/MODAL_AUTHORITY_MAP.md`

## Phase Q — FEEDBACK_AUTHORITY_ONLY

Map: `docs/design/FEEDBACK_AUTHORITY_MAP.md`  
APPROVED: Alert · FieldError · Feedback V2 · product toasts · StatusCard

## Phase R — STATUS_AUTHORITY_ONLY

Map: `docs/design/STATUS_AUTHORITY_MAP.md`  
Loading/Empty/NoResults/Error/Offline/Stale/Permission/RateLimited + StatusBadge

## Phase S — OVERLAY_SYSTEM_UNIFIED

Map: `docs/design/OVERLAY_AUTHORITY_MAP.md`  
tooltip · modal overlays · FloatingLayerManager · Radix menus

## Implementation

- `ConfirmDialog` façade over AlertDialog
- `.ss-confirm-dialog` in `ssunnah-card-unify.css`
- Gate: `test:overlay-feedback-authority`

## Non-claims

لا rewrite لشيتات المصحف/Admin · لا نظام toast جديد · لا UNIFIED_100
