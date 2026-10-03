# BORDER_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `BORDER_AUTHORITY_ONLY` |
| Code | `artifacts/majalis/src/lib/border-authority.ts` |

One border language. Prefer hairline tokens over hex borders.

## Roles

| Role | Token | Width | Use |
|---|---|---|---|
| PRIMARY | `--mj-brand` (mix/edge) | 1–2px | Selected · emphasis |
| SECONDARY | `--sf-border-strong` | 1px | Strong structure |
| SUBTLE | `--mj-hairline` | 1px | Cards · controls · modals |
| DIVIDER | `--mj-hairline` | 1px | Lists · table row separators |
| FOCUS | `--sf2-focus-ring` | 2px outline | focus-visible |

Radius interaction: borders pair with `--sf-radius-control` / `--radius-card` (size authority) — do not invent page radii for strokes.

## Classification

| Surface | Class |
|---|---|
| hairline / brand / focus tokens | APPROVED |
| Compat `--color-border` · `--majalis-line` → hairline | APPROVED (compat) |
| Page hex borders (`#d9d3c8` etc.) | LEGACY |
| Mushaf frame · Admin grids | SPECIAL_CASE |

## Gates

`test:elevation-border-governance-authority`
