# SUNNAH FINAL Program — Phase 4: Identity Bridges Absorb

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (Delivery = merge + MATCH) |
| Base | `origin/main` @ `ac0218d87` (Phase 3 Dark deferred absorb MATCH) |
| Branch | `cursor/identity-bridges-absorb-p4` |
| Authority | `docs/design/DESIGN_TOKEN_AUTHORITY.md` · `DARK_MODE_AUTHORITY.md` |

## Live truth at start

| Probe | Result |
|---|---|
| `origin/main` | `ac0218d87` |
| Production `version.json` | `ac0218d8` **MATCH** |

## Root cause

`brand-v4.css` dark block still declared a competing night canvas (`#131A18`) and unreadable `--brand-deep: #0E1C17`, while `design-tokens.css` re-declared surface/border hex that already live in `theme.css` product night contract. That forked identity after first paint and inflated `hexInCss`.

## Fix

| File | Absorb |
|---|---|
| `brand-v4.css` dark | `--bg/--surface*/--border/--brand-deep/--accent*` → `--surface-app` / `--mj-*` |
| `design-tokens.css` dark | `--bg/--surface*/--border/--ss-*` → theme contract vars (no competing canvas hex) |
| `ssunnah-ux-polish.css` | remove `#131A18` fallback on `--surface-app` |

## Debt (measured)

| Metric | Before | After |
|---|---:|---:|
| `hexInCss` ceiling | 8931 | **8905** (−26) |
| `important` ceiling | 4787 | 4787 (unchanged) |

## Gates

```bash
pnpm --filter @workspace/majalis run test:identity-bridges-absorb
pnpm --filter @workspace/majalis run test:dark-mode-authority
pnpm --filter @workspace/majalis run test:visual-system-debt-budget
```

## Explicit non-claims

- لا حذف `brand-v4` / `design-tokens` (KEEP consumers)
- لا عائلة توكن جديدة
- لا `ZERO_INTERNAL_DEBT` / STORE GO
