# PR H / Wave 5 — Modals · Feedback · static a11y

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `e3440fec` (Wave 4 / PR G MERGED_AND_DEPLOYED · Production MATCH)  
Exit marker: `MODALS_FEEDBACK_A11Y_WAVE_H_ADVANCED`

## Platform impacts

- WEB_IMPACT: Vault note form → `Dialog`; AsmaaHusna detail → `AppBottomSheet`; Quran Numbers empty → `NoResultsState`
- IOS_APPLICATION_IMPACT: shared WebView only; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: MODAL authority map + overlay gate hardened

## What changed

| Surface | From | To |
|---|---|---|
| Vault AddNoteModal | DIY backdrop + role=dialog | `Dialog` + `Textarea` |
| AsmaaHusna detail | DIY backdrop modal | `AppBottomSheet` |
| Quran Numbers empty | plain `<p>` | `NoResultsState` + clear filters |

## Residual classification

| Bucket | Class | Evidence |
|---|---|---|
| Calendar / Hadith / Adhkar DIY sheets | LEGACY migrate-when-touched | Inventory WAVE5 JSON |
| GlobalSearchModal / SideNavDrawer | KEEP_JUSTIFIED_WITH_EVIDENCE | Navigation/search chrome |
| AdminInlineEdit overlays | SPECIAL_CASE | ADMIN_ONLY |
| Mushaf sheets | SPECIAL_CASE | MUSHAF_SPECIAL |
| NativeBack `window.confirm` exit | KEEP_JUSTIFIED_WITH_EVIDENCE | System exit confirm |
| capacitor external-link confirm | KEEP_JUSTIFIED_WITH_EVIDENCE | Platform bridge |

## Outputs

- VAULT_NOTE_ON_DIALOG
- ASMAA_DETAIL_ON_APP_BOTTOM_SHEET
- QURAN_NUMBERS_EMPTY_ON_NO_RESULTS
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE

## Gates

```bash
pnpm --filter @workspace/majalis run test:overlay-feedback-authority
pnpm run verify:preflight && pnpm run verify:ci
```
