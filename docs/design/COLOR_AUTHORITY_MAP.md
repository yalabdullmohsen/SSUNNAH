# COLOR_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `COLOR_AUTHORITY_ONLY` |
| Code map | `artifacts/majalis/src/lib/color-authority.ts` |
| Related | `DESIGN_TOKEN_AUTHORITY.md` · `FINAL_TOKEN_ROLE_MATRIX.md` · `CALM_COLOR_SYSTEM.md` |

**Policy:** Foundation `--sf*` / `--sf2-*` · Product `--mj-*` · Bridge `--ss-*` · **no new token family**.

Same meaning = same canonical token everywhere (product surfaces).

## Semantic → canonical

| Semantic | Canonical | Layer |
|---|---|---|
| PRIMARY | `--mj-brand` (← `--sf2-action-primary`) | brand / CTA |
| SECONDARY | `--mj-brand-deep` | deep brand ink |
| ACCENT | `--mj-accent` | sparse gold/brass |
| SUCCESS | `--sf2-success` | status |
| WARNING | `--mj-warning` | status |
| ERROR | `--mj-danger` | destructive / errors |
| INFO | `--mj-info` | informational |
| SURFACE | `--mj-surface` | cards / panels |
| BACKGROUND | `--mj-bg` / `--sf2-page-bg` | canvas |
| BORDER | `--mj-hairline` | dividers |
| TEXT | `--mj-ink` | primary ink |
| MUTED | `--mj-ink-2` | secondary / meta |
| OVERLAY | `--sf2-overlay` | dimmed backdrops |

Aliases listed in `COLOR_AUTHORITY_ALIASES` are **compatibility**, not competing palettes.

## Classification

| Surface | Class |
|---|---|
| `--sf2-*` / `--mj-*` product consumption | PRIMARY (canonical) |
| `--ss-*` / `--color-*` bridges tracking mj/sf | SECONDARY (compat) |
| Page-local hex / rgb / hsl for brand/status | LEGACY — absorb when touched |
| Mushaf paper/ink · Prayer immersive | SPECIAL_CASE |
| Admin chrome colors | SPECIAL_CASE |

## Drift control (routes)

Home · Quran Hub · Lessons · Hadith · Fiqh · Account · Settings must consume **semantic tokens**, not route-unique greens/reds.  
Mushaf / Prayer / Admin held SPECIAL_CASE.

## Forbidden

- New `--xx-*` color family
- Surface-as-Ink / Ink-as-Surface (see U2 matrix)
- Page-local canvas hex
- Gold as body text / default links (Calm Color System)

## Gates

`test:color-typography-authority` · `test:token-role-authority` · visual debt / contrast gates
