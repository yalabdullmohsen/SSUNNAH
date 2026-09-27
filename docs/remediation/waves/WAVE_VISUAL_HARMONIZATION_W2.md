# WAVE — Visual Harmonization Wave 2 (Nav / safe-area)

| Field | Value |
|---|---|
| Branch | `cursor/visual-harmonization-w2-nav` |
| Base | Wave 1 tip (`visual-harmonization-w1`) |
| Depends on | #2317 Calm Wave 1 |
| State | **local · push after W1 merge** |

## Delivered in this slice

- `--sf2-content-bottom-inset` + `.sf2-page-end` (+ `__nav`, `__meta`)
- Bottom nav calmer: no drop shadow, emerald selected (light), Foundation border
- Preserves `--surface-app: #F7F3EB` splash/meta contract (no theme churn)
- Docs: `NAVIGATION_AND_SAFE_AREA`, `PAGE_ENDING_SYSTEM`
- Gate: `visual-harmonization-w2-nav-safe-area-gate.test.ts`

## Explicit non-changes

- Bottom-nav height / touch targets unchanged
- Dark selected gold remains via `dark-mode-recovery` (allowed on dark surfaces)
- No FloatingBack removal (B2)
- No page-local padding migration yet

## Explicit follow-ups (B2)

- Fold `WAVE_NAVIGATION_PRAYER_STABILITY` (route-surface) after rebase onto main+W1
- Reduce FloatingBack dependency route-by-route
- Drawer selected/expanded polish
- Page-level migration of ad-hoc `padding-bottom` formulas
