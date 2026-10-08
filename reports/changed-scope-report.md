# تقرير نطاق التغييرات

**التاريخ:** 2026-10-08T19:53:14.788Z
**عدد الملفات:** 13
**النطاقات:** other، ui/layout، quran/mushaf، content/data
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | ✓ |
| api | — |
| seo | ✓ |
| pwa | — |
| content | ✓ |
| ios | — |
| full | ✓ |
| mushaf | ✓ |
| build | ✓ |
| visual | ✓ |
| lighthouse | ✓ |
| color_contrast | ✓ |
| data_audit | ✓ |

## الملفات المتغيرة (أول 40)

- `artifacts/majalis/scripts/ui-ratchet-baseline.json` → other
- `artifacts/majalis/src/components/adhan/AdhanNotificationBar.tsx` → ui_layout
- `artifacts/majalis/src/components/adhan/PrayerAudioPicker.tsx` → ui_layout
- `artifacts/majalis/src/components/adhan/PrayerRespectBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/home/HomeCustomizeSheet.tsx` → ui_layout
- `artifacts/majalis/src/components/quran/HifzAudioLoopPlayer.tsx` → quran_mushaf
- `artifacts/majalis/src/components/quran/ImmersivePrefsDrawer.tsx` → quran_mushaf
- `artifacts/majalis/src/components/quran/ImmersiveVerseOptionsSheet.tsx` → quran_mushaf
- `artifacts/majalis/src/components/quran/QuranSurahJumpSearch.tsx` → quran_mushaf
- `artifacts/majalis/src/components/quran/TafsirModalViewer.tsx` → quran_mushaf
- `artifacts/majalis/src/design-system/primitives.tsx` → ui_layout
- `artifacts/majalis/src/pages/quran/ui/QuranSearchView.tsx` → quran_mushaf
- `artifacts/majalis/src/pages/worship/ui/AdhkarDhikrSheet.tsx` → content_data


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

