# تقرير نطاق التغييرات

**التاريخ:** 2026-09-28T02:34:31.248Z
**عدد الملفات:** 20
**النطاقات:** docs، other، quran/mushaf، ui/layout
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | ✓ |
| api | — |
| seo | ✓ |
| pwa | — |
| content | — |
| ios | — |
| full | ✓ |
| mushaf | ✓ |
| build | ✓ |
| visual | ✓ |
| lighthouse | ✓ |
| color_contrast | ✓ |
| data_audit | — |

## الملفات المتغيرة (أول 40)

- `artifacts/majalis/docs/qa/MUSHAF_CONTROLS_INVENTORY.md` → docs
- `artifacts/majalis/package.json` → other
- `artifacts/majalis/scripts/mushaf-controls-inventory.mjs` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-madinah/MushafAudioDock.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-reader/MushafControlsLayer.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-reader/NewMushafReader.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-reader/mushaf-reader.css` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-advanced-bookmarks-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-appearance-ayah-interaction-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-controls-inventory-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-dual-appearance-theme-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-immersive-reader-chrome-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-nextgen-baseline-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-page-arrows-focus-mode-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-pages-1-2-layout-gold-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-signature-p0-baseline-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/prefetch-route.ts` → ui_layout
- `artifacts/majalis/src/styles/components/quran-audio-chrome.css` → ui_layout
- `docs/qa/MUSHAF_CONTROLS_INVENTORY.md` → docs
- `docs/qa/mushaf-controls-inventory.json` → docs


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

