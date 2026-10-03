# CONTRAST_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `CONTRAST_STANDARDIZED` |
| Related | `COLOR_AUTHORITY_MAP` · `DARK_MODE_AUTHORITY` · Calm Color · on-brand gates |

Same semantic meaning = same contrast standard in light and dark.

## Pairs (APPROVED)

| Meaning | Foreground | Background | Notes |
|---|---|---|---|
| Body text | `--mj-ink` / `--sf2-text-primary` | `--mj-bg` / surface | AA ≥ 4.5:1 |
| Muted meta | `--mj-ink-2` / `--sf2-text-muted` | page/surface | still AA on page |
| Primary CTA | `--mj-on-brand` | `--mj-brand` | on-brand gate |
| Secondary | ink on surface / muted fill | hairline border | |
| Destructive | on-danger / danger ink | danger / soft | |
| Success / warning / info | semantic fg on soft/surface | status tokens | StatusBadge tones |
| Nav active | brand + muted surface | chrome | not color-only |
| Focus ring | `--sf2-focus-ring` | — | visible against canvas |

## Classification

| Surface | Class |
|---|---|
| Theme `--mj-*` / `--sf2-*` pairs + contrast gates | APPROVED |
| Page-local hex text/bg that bypasses tokens | LEGACY |
| Mushaf paper/ink · Prayer immersive locked pairs | SPECIAL_CASE |
| Admin chrome | SPECIAL_CASE |

## Drift control

- No route-specific “lighter muted” that fails AA
- Dark mode via theme remap only — not page night kits
- Gold not used as body text (Calm Color)

## Validation

- `design-token-contrast-aa` · `a11y-contrast-100` · on-brand / cards-filters contrast gates
- visual-snapshot · light/dark parity
- `test:spacing-size-a11y-contrast-authority`

## Forbidden

- Lowering gate thresholds to pass
- Snapshot updates to hide contrast defects
