# PR F / Wave 3 — Buttons + Forms + Interaction

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `75d349f1` (Wave 2 / PR E MERGED_AND_DEPLOYED · Production MATCH)  
Exit marker: `BUTTON_FORM_INTERACTION_WAVE_F_ADVANCED`

## Platform impacts

- WEB_IMPACT: Quran Numbers / Memorization Plans / Engine nav on `Button`; Numbers search on `SearchInput`; interaction ceilings lowered
- IOS_APPLICATION_IMPACT: shared WebView only; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: QUALITY_BASELINE + interaction/visual budgets synchronized downward

## What changed

### Buttons absorbed (USE_BUTTON)
| File | Elements | Notes |
|---|---:|---|
| `QuranNumbersView.tsx` | 6 | tabs + stat cards + share |
| `QuranMemorizationPlansPage.tsx` | 3 | plan cards + session actions |
| `QuranEnginePage.tsx` | 2 | dash/viewer nav |

### Forms
- `QuranNumbersView` search → `SearchInput` (FORM authority)

### Measured delta

| Metric | Before | After |
|---|---:|---:|
| rawButtonFiles | 76 | **73** |
| rawButtonElements | 311 | **300** |
| officialButtonImportFiles | 287 | **290** |
| buttonRelatedHexApprox | 980 (ceiling) / 974 live | **975** |
| divSpanOnClick | 41 | 41 (KEEP_JUSTIFIED) |
| formButtonsMissingType | 0 | 0 |

## Residual classification (item-level)

| Bucket | Class | Evidence |
|---|---|---|
| Mushaf reader / madinah docks / ayah sheets | SPECIAL_CASE_WITH_EVIDENCE | MUSHAF_SPECIAL chrome |
| Admin + review-hub raw buttons | SPECIAL_CASE_WITH_EVIDENCE | ADMIN_ONLY |
| `QuranMemorizationView` quiz options/ratings | SPECIAL_CASE_WITH_EVIDENCE | Quiz timing / product test UI |
| `QuranViewer` surface / tafsir expand | SPECIAL_CASE_WITH_EVIDENCE | Engine viewer chrome (page-surface + expand) |
| Modal backdrop `div` onClick | KEEP_JUSTIFIED_WITH_EVIDENCE | EVENT_DELEGATION dismiss |
| Upload dropzone `div` onClick | KEEP_JUSTIFIED_WITH_EVIDENCE | FILE_DROPZONE |
| `input-group` addon click | KEEP_JUSTIFIED_WITH_EVIDENCE | focus delegation to control |

## Outputs

- RAW_BUTTON_COUNTS_REDUCED
- OFFICIAL_BUTTON_ADOPTION_RAISED
- FORM_SEARCH_ON_AUTHORITY (Quran Numbers)
- NO_BASELINE_CEILING_RAISE
- DIV_SPAN_RESIDUAL_CLASSIFIED_WITH_EVIDENCE
- NO_QURAN_INTEGRITY_CHANGE
- NO_MUSHAF_GEOMETRY_CHANGE

## Gates

```bash
pnpm --filter @workspace/majalis run test:interaction-system-debt-budget
pnpm --filter @workspace/majalis run test:buttons-residual-absorb
pnpm --filter @workspace/majalis run test:interaction-system-authority
pnpm run verify:preflight && pnpm run verify:ci
```

## Rollback

Revert this PR. No SQL / binary / token-family changes.
