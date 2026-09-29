# Token Migration Matrix — Final Remediation

| Field | Value |
|---|---|
| Captured | 2026-09-29T13:09Z |
| Main tip | `ff77a662` (post nav-prayer #2351) |
| Canonical authority | `docs/design/DESIGN_TOKEN_AUTHORITY.md` |
| Debt gate | `pnpm --filter @workspace/majalis run test:visual-system-debt-budget` |
| Policy | **No new token family** · `--sf-*` / `--sf2-*` only for new UI |

## Measured (visual-system-inventory)

| Metric | Value |
|---|---:|
| CSS files | 360 |
| `!important` | 4798 |
| Hex in CSS | 9142 |
| `--sf-*` refs | 682 |
| `--ss-*` refs | 722 |
| `--mj-*` declarations outside allowlist | 129 |
| main.tsx sync CSS imports | 23 |
| main.tsx deferred CSS imports | 59 |

Ceilings held (debt budget at tip) — do **not** raise.

## Layer → canonical replacement

| Layer | Status | Canonical replacement | Migration progress |
|---|---|---|---|
| `sunnah-foundation-tokens.css` (`--sf-*`) | **CANONICAL** | self | SoT literals |
| `sunnah-foundation-v2.css` (`--sf2-*`) | **CANONICAL** | self | Semantic roles |
| `z-index-layers.css` / `motion-policy.css` | **CANONICAL** | self | Elevation / motion |
| `app/styles/theme.css` (`--mj-*`) | **PRODUCT CONTRACT** | consume via `--sf2-*` where mapped; keep night canvas contract | Active |
| `design-tokens.css` / `--ss-*` | **COMPATIBILITY** | alias → `--sf2-*` / `--mj-*` | Bridge only |
| `brand-v4*.css` | **LEGACY_REQUIRED** | `--sf2-*` + chrome tokens | Runtime KEEP until unused proof |
| `m2030/*` | **LEGACY_REQUIRED** | Foundation + App shell | Home/nav still consumers |
| `final-release.css` | **LEGACY_REQUIRED** | absorb into named semantic sheets | Large KEEP |
| `green-surface-system.css` | **MIGRATION_CANDIDATE** | `--sf2-page-bg` / surfaces | Reduce page washes |
| `sunnah-identity-*.css` | **OVERRIDE_PATCH** | fold into `--sf2-*` consumers | Identity polish; no 4th palette |
| `soft-cards.css` | **MIGRATION_CANDIDATE** | `CARD_SURFACE_AUTHORITY` / AppCard | Soft-card refs still live |
| `dark-mode-recovery` / `premium-dark-refine` / `luxury-night*` / `dark-mode-surfaces` / `dark-design-system` | **ACTIVE_COMPATIBILITY** | `DARK_MODE_AUTHORITY` contract | Bridge; no parallel night hex |
| `pages/*-legacy.css` | **NEEDS_PORT** | route CSS on `--sf2-*` | Still imported (4 files) |
| Mushaf / prayer / admin CSS | **ROUTE_SPECIFIC / BLOCKED** | do not globalize | Boundary docs |

## Forbidden (program lock)

1. New `--xx-*` token family outside Foundation / documented bridges.  
2. New raw hex / shadow / radius / z-index in product TSX/CSS when a token exists.  
3. Raising debt ceilings to hide regression.  
4. Deleting `brand-v4` / `m2030` / `final-release` before consumer=0 + parity proof.

## Next FIXABLE waves (not this matrix PR)

1. Absorb `visual-identity-unify` / `sections-calm-polish` overrides into `--sf2-*`.  
2. Port soft-cards hubs → AppCard / SectionEntryCard.  
3. Drop `*-legacy.css` imports after class PORT.  
4. Lower hex / `!important` ceilings only after measured drops.
