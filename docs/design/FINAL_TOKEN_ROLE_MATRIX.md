# Final Token Role Matrix — سُنّة (U2)

| Field | Value |
|-------|-------|
| Status | **TOKEN_CONTRACT_STABLE** (this PR) |
| Date | 2026-10-01 |
| Authority | `DESIGN_TOKEN_AUTHORITY.md` · `DARK_MODE_AUTHORITY.md` |
| Policy | Foundation `--sf2-*` · Product `--mj-*` · Bridge `--ss-*` · **no new family** |
| Mushaf | **MUSHAF_SPECIAL** — paper/ink via mushaf tokens / `data-mushaf-appearance` |
| Prayer | **PRAYER_SPECIAL** — immersive surface via route-surface · no calc tokens |

## Contract

| Layer | Prefix | Role |
|-------|--------|------|
| Foundation | `--sf-*` / `--sf2-*` | Canonical literals + semantic roles |
| Product theme | `--mj-*` | Product chrome / surfaces / brand |
| Bridge | `--ss-*` | Compatibility → `--mj-*` / `--sf2-*` only |
| Forbidden | new `--xx-*` family · page-local global canvas · Surface-as-Ink · Ink-as-Surface |

---

## Role matrix

| Role | Canonical Token | Light Source | Dark Source | Existing Aliases | Legacy Aliases | Current Consumers | Retirement Condition |
|------|-----------------|--------------|-------------|------------------|----------------|-------------------|----------------------|
| canvas | `--sf2-page-bg` / `--mj-bg` | `--surface-app` `#F7F3EB` · theme | `--surface-app` `#0F1613` | `--color-bg` · `--ss-color-bg` · `--dm-bg` | `--msk-canvas-*` · page hex | App shell · pages | no page-local canvas hex |
| background | `--mj-bg` | same as canvas | same | `--color-bg` | `--majalis-parchment` | body / #root | aliases → consumer=0 |
| ink | `--sf2-text-primary` / `--mj-ink` | `#15382D` | `#EDE8DF` | `--color-ink` · `--color-text` | `--msk-text` · `--majalis-ink` | typography | legacy ink aliases unused |
| muted ink | `--sf2-text-muted` / `--mj-muted` | `#5F7168` | `#B5ADA0` | `--color-ink-2` · `--color-muted` | `--msk-text-2/3` | meta / secondary | same |
| surface | `--sf2-card-bg` / `--mj-surface` | `#FFFFFF` | `#1B2421` | `--color-surface` · `--dark-card` | `--soft-card-bg` | cards / panels | soft-* → AppCard family (U6) |
| elevated surface | `--sf2-elevated-bg` / `--mj-surface-2` | `#EFE8DC` | elevated night | `--color-surface-2` · `--dark-elevated` | `--surface-elevated` | raised chrome | — |
| inset surface | `--mj-surface` + inset pattern / `InsetSurface` | light inset | dark inset | — | page washes | forms / wells | component authority |
| border | `--sf2-border-subtle` / `--mj-hairline` | emerald hairline | `#35443F` | `--color-border` · `--color-hairline` | `--msk-border` | dividers | — |
| hairline | `--mj-hairline` | rgba brand 12% | night hairline | `--color-hairline` | — | chrome edges | — |
| brand | `--sf2-action-primary` / `--mj-brand` | `#0F5C3F` | `#5CC095` | `--color-brand` · `--color-primary` | `--msk-gold` (misnamed emerald) | CTA | rename msk later (docs only) |
| on-brand | `--mj-on-brand` / `--color-on-brand` | `#FFFFFF` | `#06231A` | `--on-brand` | — | CTA label | — |
| accent | `--mj-accent` | `#B08A3E` | `#C9A86C` | `--color-accent` | brass aliases | chips / gold accents | — |
| on-accent | `--sf2-text-primary` on accent / documented pair | ink on accent | ink on accent | — | — | rare | document pairs in contrast gates |
| destructive | `--mj-danger` / `--color-danger` | theme danger | `#F2B8C0` | `--ss-danger` | `--msk-red` | delete / errors | — |
| on-destructive | on-danger pair (contrast gate) | light on danger | dark on danger | — | — | buttons | — |
| success | `--sf2-success` / theme success | foundation | remapped | `--majalis-success` | — | status | — |
| warning | `--mj-warning` / `--sf2-warning` | theme | remapped | — | — | badges | — |
| error | `--sf2-error` / danger family | theme | remapped | — | — | forms | — |
| focus ring | `--sf2-focus-ring` | foundation | `--state-focus-outline` | — | raw outlines | controls | no raw focus hex in migrated files |
| brand-deep (**ink**) | `--mj-brand-deep` | `#0a4530` / sf deep | `var(--elite-forest, #8FD4B0)` | `--color-brand-deep` → mj | `--brand-deep` | text/links on surfaces | never equal `--mj-brand-deep-surface` |
| brand-deep (**surface**) | `--mj-brand-deep-surface` | n/a (light uses brand fills) | `#0E1C17` | — | old `--color-brand-deep` night misuse | rare fills | prefer `--mj-surface` / canvas |

---

## U2 fixes applied

| Issue | Before | After |
|-------|--------|-------|
| Dark `--color-brand-deep` | `#0E1C17` (surface) | `var(--mj-brand-deep)` ink/elite-forest |
| Header ad dark canvas | `#121816` | `var(--mj-bg)` / `--surface-app` |
| Fiqh review badge | `color: var(--mj-surface-2)` | `color: var(--mj-ink…)` · bg uses surface mix |

## Gate

`artifacts/majalis/src/lib/__tests__/token-role-authority-gate.test.ts`

## KEEP_JUSTIFIED

- Mushaf `--color-mushaf-*` night/day paper (MUSHAF_SPECIAL).
- `--msk-*` / `--majalis-*` until consumer=0 (U8).
- Dual `--color-*` map in `theme.css` as product dual — must track `--mj-*` meanings.
