# تقرير نطاق التغييرات

**التاريخ:** 2026-10-03T08:27:34.927Z
**عدد الملفات:** 34
**النطاقات:** other، content/data، ui/layout
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
| mushaf | — |
| build | ✓ |
| visual | ✓ |
| lighthouse | ✓ |
| color_contrast | ✓ |
| data_audit | ✓ |

## الملفات المتغيرة (أول 40)

- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/interaction-system-debt-budget.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/src/pages/account/ui/FawaidView.tsx` → content_data
- `artifacts/majalis/src/pages/fiqh/ui/RulingDetailView.tsx` → ui_layout
- `artifacts/majalis/src/pages/lessons/LessonsArchivePage.tsx` → ui_layout
- `artifacts/majalis/src/pages/lessons/TeachersIndexPage.tsx` → ui_layout
- `artifacts/majalis/src/pages/worship/ui/PrayerRanksView.tsx` → ui_layout
- `artifacts/majalis/src/styles/card-system-v2.css` → ui_layout
- `artifacts/majalis/src/styles/components/friday-banner.css` → ui_layout
- `artifacts/majalis/src/styles/components/home-recommended.css` → ui_layout
- `artifacts/majalis/src/styles/discover-islam.css` → ui_layout
- `artifacts/majalis/src/styles/highlighted-content.css` → ui_layout
- `artifacts/majalis/src/styles/pages/arbaeen-nawawi.css` → ui_layout
- `artifacts/majalis/src/styles/pages/assistant.css` → ui_layout
- `artifacts/majalis/src/styles/pages/auth.css` → ui_layout
- `artifacts/majalis/src/styles/pages/fiqh-hub.css` → ui_layout
- `artifacts/majalis/src/styles/pages/hadith-books.css` → ui_layout
- `artifacts/majalis/src/styles/pages/hadith-design-language.css` → ui_layout
- `artifacts/majalis/src/styles/pages/miracles.css` → ui_layout
- `artifacts/majalis/src/styles/pages/prophet-stories.css` → ui_layout
- `artifacts/majalis/src/styles/pages/qiraat.css` → ui_layout
- `artifacts/majalis/src/styles/pages/quran-people.css` → ui_layout
- `artifacts/majalis/src/styles/pages/seerah.css` → ui_layout
- `artifacts/majalis/src/styles/pages/settings.css` → ui_layout
- `artifacts/majalis/src/styles/pages/shimael.css` → ui_layout
- `artifacts/majalis/src/styles/pages/sources-directory.css` → ui_layout
- `artifacts/majalis/src/styles/pages/tajweed.css` → ui_layout
- `artifacts/majalis/src/styles/pages/tawhid.css` → ui_layout
- `artifacts/majalis/src/styles/prayer-route-shell.css` → ui_layout
- `artifacts/majalis/src/styles/sunnah-identity-cards.css` → ui_layout
- `artifacts/majalis/src/styles/sunnah-visual-language.css` → ui_layout
- `artifacts/majalis/src/views/UpdatesPage.tsx` → ui_layout


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

