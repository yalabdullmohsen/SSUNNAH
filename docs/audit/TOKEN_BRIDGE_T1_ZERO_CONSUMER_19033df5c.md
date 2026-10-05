# T1 — Zero-consumer token alias removal

TASK_CLASSIFICATION: SHARED_PLATFORM

## Result (honest count)

Candidates evaluated: **29** alias-only `--ds-*` / `--majalis-*` declarations.

| Outcome | Count | Tokens |
|---|---:|---|
| **RETIRED_WITH_PROOF** | **26** | see list below |
| **RESTORE_COMPATIBILITY_ALIAS** (KEEP_COMPATIBILITY_WITH_EVIDENCE) | **3** | `--ds-muted`, `--ds-danger`, `--ds-success` |

Do **not** claim all 29 were retired. The three kept aliases exist solely for the
quality-campaign Design Token contract (`scripts/test-quality-campaign-gate.mjs`).

Excluded after live recount (not in the 29): `--ds-text` (743 uses), `--majalis-bg` (2 uses).

## Kept compatibility aliases

| Alias | Canonical destination | Role | Contract | Retirement trigger |
|---|---|---|---|---|
| `--ds-muted` | `var(--text-muted)` → `--mj-muted` | MUTED_TEXT | quality-campaign required list | migrate gate to `--text-muted` / `--mj-muted`, then delete |
| `--ds-danger` | `var(--danger)` → `--mj-danger` | DANGER_TEXT / DANGER_SOLID | quality-campaign required list | migrate gate to `--danger` / `--mj-danger`, then delete |
| `--ds-success` | `var(--success)` → `--mj-brand` (success maps to brand green) | SUCCESS_SOLID | quality-campaign required list | migrate gate to `--success` / semantic success owner, then delete |

- Runtime `var(--ds-muted|danger|success)` consumers: **0**
- Classification: **PUBLIC_API_CONTRACT** + **TEST_CONTRACT** (compatibility-only)
- New product code must not adopt these aliases (enforced by T1 gate)

## Retired (26) — zero `var()` consumers proven

`--ds-bg` · `--ds-divider` · `--ds-error` · `--ds-font-bold` · `--ds-font-medium` ·
`--ds-font-regular` · `--ds-font-semibold` · `--ds-gold` · `--ds-gold-soft` ·
`--ds-iconPrimary` · `--ds-iconSecondary` · `--ds-line-strong` · `--ds-onPrimary` ·
`--ds-primary` · `--ds-primaryContainer` · `--ds-primaryHover` · `--ds-selected` ·
`--ds-successContainer` · `--ds-surfaceSecondary` · `--ds-text-muted` ·
`--ds-textOnColor` · `--ds-warning` · `--majalis-green` · `--majalis-primary` ·
`--majalis-secondary` · `--majalis-text`

## Metrics

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5571 | **5569** (−2) |
| important | 4720 | 4720 |
| cssFiles | 353 | 353 |
| aliases retired | — | **26** |
| aliases retained (compat) | — | **3** |

Ceiling hexInCss lowered to 5569. NO_CEILING_RAISE. NO_GATE_WEAKENING.

## Files

- `styles/ssunnah-ds-canonical.css`
- `styles/brand-v4.css`
- `styles/design-tokens.css`
- `styles/design-system.css`

## Strategy

**STRATEGY A** for `--ds-muted` / `--ds-danger` / `--ds-success`: restore required
compatibility aliases mapped to canonical semantics (not raw hex).

**RETIRED_WITH_PROOF** for the other 26.

Exit: `ALIASES_RETIRED_26` · `COMPAT_ALIASES_KEPT_3` · `QUALITY_CAMPAIGN_CONTRACT_HELD` · `NO_NEW_TOKEN_FAMILY`
