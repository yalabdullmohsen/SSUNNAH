# تقرير نطاق التغييرات

**التاريخ:** 2026-10-02T23:36:54.171Z
**عدد الملفات:** 33
**النطاقات:** docs، other، ui/layout، quran/mushaf
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

- `artifacts/majalis/docs/CONTENT_AFFINITY_REPORT.md` → docs
- `artifacts/majalis/docs/ds-coverage-report.json` → other
- `artifacts/majalis/index.html` → other
- `artifacts/majalis/reports/interaction-system-baseline.json` → other
- `artifacts/majalis/reports/interaction-system-debt-budget.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/src/components/HeaderTicker.tsx` → ui_layout
- `artifacts/majalis/src/lib/__tests__/identity-cascade-collapse-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/prefetch-top-routes.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/tbt-split-worker-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/u4-startup-chrome-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/u8-deferred-identity-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/visual-identity-unify-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/__tests__/wave5-critical-fouc-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/prefetch-route.ts` → ui_layout
- `artifacts/majalis/src/lib/prefetch-top-routes.ts` → ui_layout
- `artifacts/majalis/src/main.tsx` → ui_layout
- `artifacts/majalis/src/pages/account/ui/HomeBelowFold.tsx` → ui_layout
- `artifacts/majalis/src/pages/quran/RevelationOrderPage.tsx` → quran_mushaf
- `artifacts/majalis/src/pages/quran/ui/SurahIndexView.tsx` → quran_mushaf
- `artifacts/majalis/src/styles/components/home-brand-title.css` → ui_layout
- `artifacts/majalis/src/styles/critical-first-paint.css` → ui_layout
- `artifacts/majalis/src/styles/m2030/home.css` → ui_layout
- `artifacts/majalis/src/styles/visual-refresh-v1.css` → ui_layout
- `docs/audit/ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json` → docs
- `docs/audit/evidence/t043-u6-card-authority/summary.json` → docs
- `docs/audit/evidence/t045-u8-deferred-identity/inventory.json` → docs
- `docs/audit/evidence/t045-u8-deferred-identity/summary.json` → docs
- `docs/release/CURRENT_PROJECT_STATUS.md` → docs
- `reports/changed-scope-report.md` → docs
- `reports/changed-scope-verify.json` → other
- `reports/store-asset-inventory.json` → other


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

