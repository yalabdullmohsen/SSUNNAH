# Soft Card Retirement — Wave 3

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w3` |
| Status | **RETIRED** |

## Inventory (live)

| Metric | Count |
|---|---:|
| Product TSX `soft-card` class consumers | **0** |
| `soft-cards.css` file | **deleted** |
| `main.tsx` import | **removed** |
| AppCard root classes | `cs-card ss-app-card` (+ tone modifiers) |

## Consumer graph (Wave 3)

```
[retired] soft-cards.css
    └── (was) AppCard → soft-card / soft-card--accent
            └── product pages / cards

[authority]
AppCard → cs-card + ss-app-card (+ ss-app-card--accent|muted)
SectionEntryCard / NavigationCard / InteractiveCard / StatusCard
    └── domain surfaces via card-system / ssunnah-ux-polish
```

CSS selector leftovers (`.soft-card` in page/dark polish sheets) are **COMPATIBILITY** remaps only — not TSX consumers. No product className emission.

## Migration targets used

| Target | Role |
|---|---|
| `AppCard` | Default product surface |
| `SectionEntryCard` | Section grids (prior waves) |
| `NavigationCard` | Nav/discovery (prior waves) |
| `InteractiveCard` | Interactive lists (prior waves) |
| `StatusCard` | Status strips (FORM_FEEDBACK) |

## Absorbed into authority

| Former soft-cards concern | Destination |
|---|---|
| Surface CSS vars (`--soft-card-*`) | `theme-aliases.css` |
| Accent tone | `ssunnah-ux-polish.css` → `.ss-app-card--accent` |
| Framed / FAB helpers | `ssunnah-ux-polish.css` |

## Gates

- `soft-cards-system-gate.test.ts` — retired contract (file absent + AppCard without class)
- `home-cards-appcard-gate.test.ts` — AppCard on `ss-app-card`
- Soft-domain gates assert **absence** of live `soft-card` className

## Verdict

**soft-card consumer count = 0** · `soft-cards.css` safely removed · no new card system.
