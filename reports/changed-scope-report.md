# تقرير نطاق التغييرات

**التاريخ:** 2026-09-29T15:17:33.909Z
**عدد الملفات:** 67
**النطاقات:** docs، other، content/data، ui/layout، quran/mushaf
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

- `artifacts/majalis/docs/CONTENT_AFFINITY_REPORT.md` → docs
- `artifacts/majalis/docs/ds-coverage-report.json` → other
- `artifacts/majalis/public/data/sources/instagram-quota.json` → content_data
- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/interaction-system-debt-budget.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/src/components/AchievementToast.tsx` → ui_layout
- `artifacts/majalis/src/components/ComingSoonDialog.tsx` → ui_layout
- `artifacts/majalis/src/components/FavoriteButton.tsx` → ui_layout
- `artifacts/majalis/src/components/FridayBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/HijriMonthSelect.tsx` → ui_layout
- `artifacts/majalis/src/components/LanguageSwitcher.tsx` → ui_layout
- `artifacts/majalis/src/components/OfflineBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/PushPrompt.tsx` → ui_layout
- `artifacts/majalis/src/components/ScholarFollowButton.tsx` → ui_layout
- `artifacts/majalis/src/components/SiteFooter.tsx` → ui_layout
- `artifacts/majalis/src/components/UpdateAvailableBanner.tsx` → ui_layout
- `artifacts/majalis/src/components/content/CompactSources.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/FormFields.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/SettingsList.tsx` → ui_layout
- `artifacts/majalis/src/components/design-system/index.ts` → ui_layout
- `artifacts/majalis/src/components/filters/ActiveFilters.tsx` → ui_layout
- `artifacts/majalis/src/components/filters/FilterBar.tsx` → ui_layout
- `artifacts/majalis/src/components/filters/FilterChip.tsx` → ui_layout
- `artifacts/majalis/src/components/home/DailyWirdCard.tsx` → ui_layout
- `artifacts/majalis/src/components/landmarks/LandmarksMap.tsx` → ui_layout
- `artifacts/majalis/src/components/layout/FilterBottomSheet.tsx` → ui_layout
- `artifacts/majalis/src/components/more/MoreSheetThemeToggle.tsx` → ui_layout
- `artifacts/majalis/src/components/prophets/ProphetStoryReaderHeader.tsx` → content_data
- `artifacts/majalis/src/components/quran/ReadingBreakDialog.tsx` → quran_mushaf
- `artifacts/majalis/src/components/rulings/RulingFilters.tsx` → content_data
- `artifacts/majalis/src/components/sections/FeaturedSectionCard.tsx` → ui_layout
- `artifacts/majalis/src/components/sections/SectionCard.tsx` → ui_layout
- `artifacts/majalis/src/components/sections/SectionRow.tsx` → ui_layout
- `artifacts/majalis/src/components/ui/ExclusiveChoiceGroup.tsx` → ui_layout
- `artifacts/majalis/src/components/universities/UniversityCard.tsx` → ui_layout
- `artifacts/majalis/src/lib/__tests__/lessons-prayer-mobile-ui-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/no-new-utility-screen-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/settings-rows-unify-gate.test.ts` → ui_layout

… +27 ملفًا

## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

