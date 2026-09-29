# تقرير نطاق التغييرات

**التاريخ:** 2026-09-29T17:30:29.309Z
**عدد الملفات:** 191
**النطاقات:** backend/api، other، ui/layout، content/data، quran/mushaf، docs
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | ✓ |
| api | ✓ |
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

- `artifacts/majalis/api/healthz.js` → backend_api
- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/interaction-system-debt-budget.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/scripts/calendar-render-gate.mjs` → other
- `artifacts/majalis/src/components/AchievementToast.tsx` → ui_layout
- `artifacts/majalis/src/components/ComingSoonDialog.tsx` → ui_layout
- `artifacts/majalis/src/components/FavoriteButton.tsx` → ui_layout
- `artifacts/majalis/src/components/FridayBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/HijriMonthSelect.tsx` → ui_layout
- `artifacts/majalis/src/components/LanguageSwitcher.tsx` → ui_layout
- `artifacts/majalis/src/components/OfflineBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/PushPrompt.tsx` → ui_layout
- `artifacts/majalis/src/components/PwaInstallBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/ScholarFollowButton.tsx` → ui_layout
- `artifacts/majalis/src/components/SiteFooter.tsx` → ui_layout
- `artifacts/majalis/src/components/UpdateAvailableBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/adhan/AudioPromptsSettingsCard.tsx` → ui_layout
- `artifacts/majalis/src/components/adhan/PrayerAlertSettingsCard.tsx` → ui_layout
- `artifacts/majalis/src/components/adhkar/AdhkarRemindersCard.tsx` → content_data
- `artifacts/majalis/src/components/content/CompactSources.tsx` → ui_layout
- `artifacts/majalis/src/components/content/ContentReading.tsx` → ui_layout
- `artifacts/majalis/src/components/content/ReadingSectionCard.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/FormFields.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/SettingsList.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/SurfacePrimitives.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/index.ts` → ui_layout
- `artifacts/majalis/src/components/filters/ActiveFilters.tsx` → ui_layout
- `artifacts/majalis/src/components/filters/FilterBar.tsx` → ui_layout
- `artifacts/majalis/src/components/filters/FilterChip.tsx` → ui_layout
- `artifacts/majalis/src/components/hadith/HadithCard.tsx` → content_data
- `artifacts/majalis/src/components/home/DailyWirdCard.tsx` → ui_layout
- `artifacts/majalis/src/components/home/HomeContinueWidget.tsx` → ui_layout
- `artifacts/majalis/src/components/home/HomeIslamicOccasions.tsx` → ui_layout
- `artifacts/majalis/src/components/home/HomeSunnahByTime.tsx` → ui_layout
- `artifacts/majalis/src/components/institutions/InstitutionDiscoverCard.tsx` → ui_layout
- `artifacts/majalis/src/components/landmarks/LandmarkDiscoverCard.tsx` → ui_layout
- `artifacts/majalis/src/components/landmarks/LandmarksMap.tsx` → ui_layout
- `artifacts/majalis/src/components/layout/FilterBottomSheet.tsx` → ui_layout

… +151 ملفًا

## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

