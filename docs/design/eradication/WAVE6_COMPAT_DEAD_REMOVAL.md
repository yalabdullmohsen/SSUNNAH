# Wave 6 — Zero-consumer compatibility / proven dead removal

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `d96bdba3` (Wave 5 / PR H MERGED_AND_DEPLOYED · Production MATCH)  
Exit marker: `PROVEN_DEAD_CSS_REMOVED_WAVE6`

## Platform impacts

- WEB_IMPACT: orphan table CSS + dead `.mj-row` recipe deleted; hex −3 · z-index raw −1
- IOS_APPLICATION_IMPACT: shared WebView CSS only; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: QUALITY_BASELINE / visual budget ceilings lowered

## Deletions (DEAD_WITH_PROOF)

| Item | Proof | Action |
|---|---|---|
| `.quran-numbers-table*` (+ wrap/scroll/note/surah-controls) | `rg` TSX consumers = 0; page uses cards + AppBottomSheet | Removed from `quran-numbers.css` |
| unify bridge `.quran-numbers-table` | same | Removed from `ssunnah-card-unify.css` |
| `.mj-row` (+ hover/em) | ListRow removed Wave 2; TSX consumers = 0 | Removed from `theme.css` |

Dynamic-selector note: class names are static product CSS hooks (not runtime-generated selectors). No JSON/config string references found outside CSS comments.

## Measured delta

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5619 | **5616** |
| zIndexRawDecls | 257 | **256** |

## Residuals (not deleted this wave)

| Item | Class | Why |
|---|---|---|
| ABSORB_NOW six CSS layers | KEEP_TEMPORARILY_WITH_EVIDENCE / residual | Still imported; unique rules remain (Wave 1 residual) |
| ACTIVE_COMPATIBILITY layers | KEEP_TEMPORARILY_WITH_EVIDENCE | Consumers > 0 |
| Admin/Mushaf raw buttons | SPECIAL_CASE | Out of product delete wave |
| Remaining DIY modals/tablists | LEGACY | Migrate-when-touched |

## Outputs

- PROVEN_DEAD_CSS_REMOVED_WAVE6
- HEX_AND_ZINDEX_CEILINGS_LOWERED
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE

## Gates

```bash
pnpm --filter @workspace/majalis run test:visual-system-debt-budget
pnpm --filter @workspace/majalis run test:table-list-authority
pnpm run verify:ci
```
