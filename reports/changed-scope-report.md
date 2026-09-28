# تقرير نطاق التغييرات

**التاريخ:** 2026-09-28T15:05:17.162Z
**عدد الملفات:** 13
**النطاقات:** other، quran/mushaf، ui/layout، docs
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

- `artifacts/majalis/package.json` → other
- `artifacts/majalis/src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-bookmarks/index.ts` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-reader/NewMushafReader.tsx` → quran_mushaf
- `artifacts/majalis/src/features/mushaf-reader/useStableMushafLayout.ts` → quran_mushaf
- `artifacts/majalis/src/hooks/useInputSheetViewport.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/mushaf-advanced-bookmarks-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/lib/__tests__/mushaf-bookmark-editor-viewport-gate.test.ts` → quran_mushaf
- `artifacts/majalis/src/styles/reader-bookmarks.css` → ui_layout
- `docs/qa/MUSHAF_BOOKMARK_EDITOR_DEVICE_MATRIX.md` → docs
- `docs/remediation/MUSHAF_BOOKMARK_EDITOR_LAYOUT_ROOT_CAUSE.md` → docs


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

