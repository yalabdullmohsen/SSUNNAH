# DESIGN_LANGUAGE_AUTHORITY — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY** |
| Date | 2026-10-03 |
| Exit | `DESIGN_LANGUAGE_UNIFIED` |
| Color | `COLOR_AUTHORITY_MAP.md` · `color-authority.ts` |
| Type | `TYPOGRAPHY_AUTHORITY_MAP.md` · `typography-authority.ts` |
| Identity | Visual identity / surface / dark-mode authorities |

Colors and typography form **one** design language — not independent kits.

## Verification checklist

| Check | How |
|---|---|
| Brand consistency | PRIMARY = `--mj-brand` on CTAs/links across Home/Hubs/Account |
| Readability | BODY/META contrast via ink tokens · Calm Color (no faint text) |
| Contrast | on-brand contrast gates · AA on page |
| Visual hierarchy | PAGE_TITLE > SECTION > CARD > BODY > META |
| Light mode | `--mj-*` / `--sf2-*` light sources |
| Dark mode | theme remap only — `DARK_MODE_AUTHORITY` |
| Mobile | breakpoints + type ≥16px inputs · touch |
| Tablet / Desktop | same tokens · measure via `--content-max*` |

## Drift rules

| OK | Not OK |
|---|---|
| Tone variants (muted/brand) on SsText | Route-unique green/red hex |
| SPECIAL_CASE Mushaf/Prayer/Admin | Second product palette “for polish” |
| Bridge aliases → canonical | Bridge as SoT for new UI |

## Gates

`test:color-typography-authority` · `test:token-role-authority` · `test:dark-mode-authority` · contrast / visual debt
