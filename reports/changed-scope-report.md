# تقرير نطاق التغييرات

**التاريخ:** 2026-10-03T08:50:00.461Z
**عدد الملفات:** 57
**النطاقات:** other، ui/layout، content/data، quran/mushaf
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

- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/src/components/FiqhGuidePage.tsx` → ui_layout
- `artifacts/majalis/src/components/knowledge-collection/KnowledgeCollectionSystem.tsx` → ui_layout
- `artifacts/majalis/src/pages/account/ui/LoginView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/HajjView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/JanazaView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/MawarithCalculatorView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/MawarithView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/SalahGuideView.tsx` → ui_layout
- `artifacts/majalis/src/pages/fiqh/ui/ZakatView.tsx` → ui_layout
- `artifacts/majalis/src/pages/hadith/ui/ArbaeenNawawiView.tsx` → content_data
- `artifacts/majalis/src/pages/hadith/ui/HadithBooksView.tsx` → content_data
- `artifacts/majalis/src/pages/hadith/ui/HadithScienceView.tsx` → content_data
- `artifacts/majalis/src/pages/quran/ui/DuasQuranView.tsx` → quran_mushaf
- `artifacts/majalis/src/styles/card-decorative-strip-cleanup.css` → ui_layout
- `artifacts/majalis/src/styles/card-matte-unify.css` → ui_layout
- `artifacts/majalis/src/styles/final-release.css` → ui_layout
- `artifacts/majalis/src/styles/knowledge-experience.css` → ui_layout
- `artifacts/majalis/src/styles/modern-islamic-editorial.css` → ui_layout
- `artifacts/majalis/src/styles/modern-ui-refresh.css` → ui_layout
- `artifacts/majalis/src/styles/pages/adhkar.css` → ui_layout
- `artifacts/majalis/src/styles/pages/auth.css` → ui_layout
- `artifacts/majalis/src/styles/pages/fiqh-hub.css` → ui_layout
- `artifacts/majalis/src/styles/pages/hadith-design-language.css` → ui_layout
- `artifacts/majalis/src/styles/pages/hadith-mustalah.css` → ui_layout
- `artifacts/majalis/src/styles/pages/hadith.css` → ui_layout
- `artifacts/majalis/src/styles/pages/kuwait-lessons.css` → ui_layout
- `artifacts/majalis/src/styles/pages/madhahib.css` → ui_layout
- `artifacts/majalis/src/styles/pages/reading-plans.css` → ui_layout
- `artifacts/majalis/src/styles/pages/scholarly-research.css` → ui_layout
- `artifacts/majalis/src/styles/pages/transcribe.css` → ui_layout
- `artifacts/majalis/src/styles/pages/university-detail.css` → ui_layout
- `artifacts/majalis/src/styles/ssunnah-ux-polish.css` → ui_layout
- `artifacts/majalis/src/styles/sunnah-identity-chrome-nav.css` → ui_layout
- `artifacts/majalis/src/styles/sunnah-identity-luxury-night.css` → ui_layout
- `artifacts/majalis/src/styles/sunnah-identity-reset.css` → ui_layout
- `artifacts/majalis/src/styles/visual-enrichment.css` → ui_layout
- `artifacts/majalis/src/views/AdabTalabIlmPage.tsx` → ui_layout

… +17 ملفًا

## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

