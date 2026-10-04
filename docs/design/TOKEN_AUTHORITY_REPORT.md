# TOKEN_AUTHORITY_REPORT

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Scope | `design-system.css` foundation + extracted consumers |
| Rule | Foundation tokens remain in design-system authority. Feature files may consume, not redefine. |

## Families declared in the original mega-file

| Prefix | Definition count |
|---|---:|
| `--ds-*` | 65 |
| `--mj-*` | 0 |
| `--msk-*` | 0 |
| `--sf-*` | 0 |
| `--ss-*` | 0 |

DS file **consumes** `--mj-*` / `--msk-*` / `--sf-*` / `--ss-*` via `var()` but does not own their literals (owners: `index.css`, `theme-aliases.css`, `sunnah-foundation-tokens.css`).

## Duplicated definitions inside the original file (shadow / cascade)

| Token | Lines | Resolution |
|---|---|---|
| `--ds-transition` | 360, 1186 | FOUNDATION_WINNER — last `:root` (v5 @ 1103) wins; earlier alias kept as compatibility bridge |
| `--ds-transition-slow` | 361, 1188 | FOUNDATION_WINNER — last `:root` (v5 @ 1103) wins; earlier alias kept as compatibility bridge |

## Compatibility bridges (keep)

- `--ds-emerald` → `var(--msk-gold, var(--mj-brand))`
- `--ds-radius` → `var(--radius-control, 0.875rem)`
- `--ds-radius-xl` / `--card-radius` → `var(--radius-card, 1.5rem)`
- Early `:root` (lines 17–24) aliases `--card-radius`, `--card-padding`, `--mobile-gap` — shadowed by v5; kept because consumers may read them before/after v5 in the same sheet after inlining.

## Feature redefinition check

After extraction, feature CSS must not contain `:root { --ds-*` or `:root { --mj-*` declarations. Enforced by `css-authority-graph-gate`.
