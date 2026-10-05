# UI1 — QuranViewer + Memorization Button Authority

```
TASK_CLASSIFICATION: SHARED_PLATFORM
WEB_IMPACT: QuranViewer (/quran-engine) + Quran Memorization controls → canonical Button/IconButton
IOS_APPLICATION_IMPACT: WebView inherits same TSX (no native chrome change)
APP_STORE_PRODUCT_IMPACT: none
SHARED_PLATFORM_IMPACT: interaction debt ceilings lowered
BASELINE_TIP: d2924d5fe
```

## Migrated

| File | Classification | Before raw `<button>` | After |
|---|---|---:|---|
| `src/components/QuranViewer.tsx` | ACTIVE_SPECIAL public | 14 | 0 → Button/IconButton |
| `src/pages/quran/ui/QuranMemorizationView.tsx` | PUBLIC | 12 | 0 → Button |

## Metrics

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| rawButtonFiles | 73 | 71 | −2 |
| rawButtonElements | 300 | 274 | −26 |
| officialButtonImportFiles | 290 | 292 | +2 |
| iconButtonConsumerFiles | 43 | 44 | +1 |
| inlineColorStyleMatches | 39 | 38 | −1 |
| buttonRelatedHexApprox | 971 | 971 | 0 |
| buttonRelatedImportantApprox | 1134 | 1134 | 0 |
| hexInCss / important / cssFiles | unchanged | unchanged | 0 |

## Semantics preserved

- Chip toggles keep `aria-pressed` + `qe-chip` geometry
- Ayah select remains a control (not a link)
- Play/Share/Font ± → IconButton with accessible `label`
- Memorization rating/options/type cards keep quiz semantics
- Removed opaque secondary end-action inline palette (uses `variant="secondary"`)

## Gate

`pnpm run test:ui1-quran-button-authority`

## Ceiling policy

NO_DEBT_CEILING_RAISE — ceilings decreased to measured live values.
