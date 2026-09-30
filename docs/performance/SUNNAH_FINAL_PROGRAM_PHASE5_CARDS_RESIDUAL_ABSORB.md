# SUNNAH FINAL Program — Phase 5: Cards Residual Absorb

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (Delivery = merge + MATCH) |
| Base | `origin/main` @ `032ad8db` (Phase 4 Identity MATCH) |
| Branch | `cursor/cards-residual-absorb-p5` |
| Authority | `docs/design/CARD_SURFACE_AUTHORITY.md` |

## Fix

| Site | Before | After |
|---|---|---|
| `card-system` icon / qzg control | `10px` / `12px` | `--cs-radius-icon` / `--cs-radius-control` → Foundation |
| pills in card-system / v2 / polish | `999px` | `--sf-radius-pill` |
| empty-state dark shadow in polish | `0 12px 28px rgba(...)` | `--sf-shadow-elevated` |

## Debt

| Metric | Before | After |
|---|---:|---:|
| `borderRadiusPxDecls` | 1265 | **1258** (−7) |
| `boxShadowDecls` | 1113 | 1113 |

## Gates

```bash
pnpm --filter @workspace/majalis run test:cards-residual-absorb
pnpm --filter @workspace/majalis run test:card-surface-authority
pnpm --filter @workspace/majalis run test:visual-system-debt-budget
```

## Non-claims

لا نظام بطاقات جديد · لا MUSHAF card rewrite · لا ZERO_INTERNAL_DEBT.
