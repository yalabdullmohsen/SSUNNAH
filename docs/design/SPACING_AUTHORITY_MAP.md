# SPACING_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `SPACING_AUTHORITY_ONLY` |
| Code | `artifacts/majalis/src/lib/spacing-authority.ts` |
| SoT | `--sf-space-*` / `--sf2-space-*` |

One spacing language. Prefer foundation steps over arbitrary rem/px.

## Scale (APPROVED)

| Step | Token | Value |
|---|---|---|
| XS | `--sf2-space-1` | 4px |
| SM | `--sf2-space-2` | 8px |
| MD | `--sf2-space-3` | 12px |
| LG | `--sf2-space-4` | 16px |
| XL | `--sf2-space-5` | 20px |
| XXL | `--sf2-space-6` | 24px |
| SECTION | `--sf2-space-8` | 32px |
| PAGE | `--sf-space-12` | 48px |

Recipes: card padding LG · form gaps MD · section XXL · page end `--sf2-page-end-gap` · inline `--page-pad-x`.

## Classification

| Surface | Class |
|---|---|
| `--sf2-space-*` · recipes above · `--page-pad-x` | APPROVED |
| `--ds-space-*` tracking same 4/8/12/16 rhythm | APPROVED (compat) |
| Arbitrary `padding: 13px` / unique page gaps | LEGACY |
| Mushaf page geometry · Prayer immersive insets | SPECIAL_CASE |
| Admin dense grids | SPECIAL_CASE |

## Route consistency

Home · Quran Hub · Lessons · Hadith · Fiqh · Account · Settings → foundation steps.  
Mushaf / Prayer / Admin → SPECIAL_CASE held.

## Gates

`test:spacing-size-a11y-contrast-authority`
