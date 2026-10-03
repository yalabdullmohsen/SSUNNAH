# ACCESSIBILITY_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `ACCESSIBILITY_STANDARDIZED` |
| Baseline | `docs/design/ACCESSIBILITY_STANDARD.md` |
| Target | WCAG 2.2 AA (+ stricter project contrast/on-brand gates) |

## Approved patterns

| Area | Rule |
|---|---|
| Keyboard | All interactive controls focusable · logical order · Escape closes dialogs/sheets |
| Focus | `focus-visible` ring via `--sf2-focus-ring` — never remove without replacement |
| Labels | Visible or `aria-label` / `aria-labelledby` on icon-only & search |
| Semantics | `Button` / `Link` / native form controls — not clickable `div` when a control fits |
| Dialogs | Radix Dialog/AlertDialog focus trap + restore (modal authority) |
| Navigation | `aria-current` on active routes · BottomNav labels |
| Tables | `TableHead` / scope · caption when helpful |
| Search / filters | labelled fields · `aria-selected` on tabs/chips · live regions for result counts |
| States | Feedback V2 announces via roles / polite live where needed |
| Motion | `prefers-reduced-motion` |
| Touch | ≥ `--touch-min` |
| Meaning | Not color-only (pair with text/icon/marker) |

## Classification

| Surface | Class |
|---|---|
| Button/Link/Form/Dialog/Feedback V2 patterns | APPROVED |
| Native long lists (e.g. 114 surahs) with documented exception | SPECIAL_CASE (NATIVE_JUSTIFIED) |
| Mushaf reader a11y contracts | SPECIAL_CASE |
| Unlabelled icon buttons / div-as-button | LEGACY — fix when touched |

## Forbidden

- Lowering contrast/a11y thresholds
- `continue-on-error` on a11y CI jobs
- Snapshot updates to hide defects

## Gates

`test:spacing-size-a11y-contrast-authority` · a11y-contrast · islamic-sects-a11y · form/button authorities
