# TYPOGRAPHY_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `TYPOGRAPHY_AUTHORITY_ONLY` |
| Code map | `artifacts/majalis/src/lib/typography-authority.ts` |
| Components | `design-system/text/SsText.tsx` |
| Scale CSS | `styles/typography-scale.css` · `--sf-type-*` |
| Related | `TYPOGRAPHY_AND_RHYTHM.md` |

No parallel type kits. New UI text → SsText roles or scale tokens.

## Levels → approved

| Level | SsText role | Scale token |
|---|---|---|
| DISPLAY | `screenTitle` (+ display token) | `--sf-type-display` / `--text-display` |
| PAGE_TITLE | `ScreenTitle` / `screenTitle` | `--sf-type-page-title` / `--text-h1` |
| SECTION_TITLE | `SectionTitle` | `--sf-type-section-title` / `--text-h2` |
| CARD_TITLE | `CardTitle` | `--sf-type-card-title` / `--text-h3` |
| SUBTITLE | `SupportingText` | `--sf-type-supporting` / `--text-body-sm` |
| BODY | `BodyText` | `--sf-type-body` / `--text-body` |
| BODY_SMALL | `SupportingText` | `--text-body-sm` |
| CAPTION | `Caption` | `--sf-type-caption` / `--text-caption` |
| LABEL | `LabelText` | `--text-label` |
| BUTTON | Label weight on Button | `--text-label` |
| META | `Caption` / metadata | `--sf-type-metadata` / `--text-caption` |
| BADGE | Caption scale on StatusBadge | `--text-caption` |

Special reading: `ScriptureText` · `ExplanationText` (matn / sharḥ — never muted for matn).

## Hierarchy

```
PAGE_TITLE > SECTION_TITLE > CARD_TITLE > BODY > META
```

Do not invert with heavier meta / lighter page titles.

## Classification

| Surface | Class |
|---|---|
| SsText roles · typography-scale · `--sf-type-*` | APPROVED |
| `.mj-page-title` / `.section-title` / `.card-title` absorb | APPROVED (compat) |
| Arbitrary `font-size: Npx` in page CSS | LEGACY |
| Mushaf / QPC type | SPECIAL_CASE |
| Admin dense tables | SPECIAL_CASE |

## Contract

| Rule | Value |
|---|---|
| Body line-height | ~1.7–1.85 (`--lh-body` / prose) |
| Titles | tight lh · bold/extrabold |
| Tracking | 0 (no decorative letter-spacing kits) |
| Mobile search/inputs | ≥ 16px |
| Emphasis | tone props / weight — not color-only |

## Gates

`test:color-typography-authority` · typography-render / foundation type gates
