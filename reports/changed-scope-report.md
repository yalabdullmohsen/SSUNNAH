# تقرير نطاق التغييرات

**التاريخ:** 2026-09-30T06:47:52.770Z
**عدد الملفات:** 27
**النطاقات:** other، ui/layout، docs
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
| mushaf | — |
| build | ✓ |
| visual | ✓ |
| lighthouse | ✓ |
| color_contrast | ✓ |
| data_audit | — |

## الملفات المتغيرة (أول 40)

- `artifacts/majalis/package.json` → other
- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/interaction-system-debt-budget.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/scripts/verify-color-contrast-gate.mjs` → other
- `artifacts/majalis/src/components/platform/ContentDetailLayout.tsx` → ui_layout
- `artifacts/majalis/src/components/sheikh/OptimizedSheikhImage.tsx` → ui_layout
- `artifacts/majalis/src/components/ui/TopicQuiz.tsx` → ui_layout
- `artifacts/majalis/src/components/widgets/Widget.tsx` → ui_layout
- `artifacts/majalis/src/lib/__tests__/a11y-contrast-100-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/legacy-css-retirement-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/pagespeed-home-gate.test.ts` → ui_layout
- `artifacts/majalis/src/pages/account/ui/HomeBelowFold.tsx` → ui_layout
- `artifacts/majalis/src/pages/lessons/ui/LessonsView.tsx` → ui_layout
- `artifacts/majalis/src/pages/worship/ui/TasbihView.tsx` → ui_layout
- `artifacts/majalis/src/styles/components/content-reading-shell.css` → ui_layout
- `artifacts/majalis/src/styles/components/topic-page.css` → ui_layout
- `artifacts/majalis/src/styles/pages/home-legacy.css` → ui_layout
- `artifacts/majalis/src/styles/pages/lessons-legacy.css` → ui_layout
- `artifacts/majalis/src/styles/pages/lessons.css` → ui_layout
- `artifacts/majalis/src/styles/pages/misc-page-legacy.css` → ui_layout
- `artifacts/majalis/src/views/admin/ArbaeenLoveSection.tsx` → ui_layout
- `artifacts/majalis/src/views/admin/ClientErrorLogsSection.tsx` → ui_layout
- `artifacts/majalis/src/views/admin/WeekDayFactsSection.tsx` → ui_layout
- `docs/REPO_INDEX.md` → docs
- `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` → docs


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

