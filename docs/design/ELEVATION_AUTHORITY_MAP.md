# ELEVATION_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `ELEVATION_AUTHORITY_ONLY` |
| Code | `artifacts/majalis/src/lib/elevation-authority.ts` |
| Policy | Subtle depth only · absorb `box-shadow:` literals → tokens · **no new shadow family** |

Same elevation = same shadow token everywhere.

## Levels

| Level | Token | Use |
|---|---|---|
| LEVEL_0 | `--sf2-shadow-none` | Flat · tables · hairline cards |
| LEVEL_1 | `--sf2-shadow-card` | AppCard · hub cards |
| LEVEL_2 | `--sf-shadow-elevated` | Menus · tooltips · sticky |
| LEVEL_3 | `--mj-sh` | Sheets · FAB · soft overlays |
| LEVEL_4 | `--mj-sh-lg` | Blocking dialogs · feature chrome |

CSS aliases (compat): `--sf2-elevation-0…4` in `ssunnah-card-unify.css` → tokens above.

## Classification

| Surface | Class |
|---|---|
| sf2/sf/mj shadow tokens + elevation aliases | APPROVED |
| Page-local `box-shadow: 0 Npx … rgba(...)` | LEGACY — absorb when touched |
| Mushaf paper (usually none) · Prayer immersive | SPECIAL_CASE |

## Debt

Track `boxShadowDecls` via `visual-system-inventory` — ceilings decrease by absorption only (never raise).

## Gates

`test:elevation-border-governance-authority` · `test:visual-system-debt-budget`
