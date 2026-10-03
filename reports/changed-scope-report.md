# تقرير نطاق التغييرات

**التاريخ:** 2026-10-03T09:15:22.325Z
**عدد الملفات:** 16
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

- `artifacts/majalis/reports/DESIGN_CONSISTENCY_SCORE.json` → other
- `artifacts/majalis/reports/authority-coverage.json` → other
- `artifacts/majalis/reports/design-tokens-authority.json` → other
- `artifacts/majalis/reports/visual-system-baseline.json` → other
- `artifacts/majalis/reports/visual-system-debt-budget.json` → other
- `artifacts/majalis/scripts/token-compliance-report.mjs` → other
- `artifacts/majalis/src/components/ComingSoonDialog.tsx` → ui_layout
- `artifacts/majalis/src/components/home/HomeCustomizeSheet.tsx` → ui_layout
- `artifacts/majalis/src/lib/__tests__/design-tokens-authority-gate.test.ts` → ui_layout
- `artifacts/majalis/src/lib/design-tokens-authority.ts` → ui_layout
- `docs/audit/AUTHORITY_COVERAGE_REPORT.md` → docs
- `docs/audit/DESIGN_AUTHORITY_REPORT.md` → docs
- `docs/audit/DESIGN_CONSISTENCY_SCORE.md` → docs
- `docs/audit/DESIGN_DRIFT_REPORT.md` → docs
- `docs/audit/TOKEN_COMPLIANCE_REPORT.md` → docs
- `docs/design/DESIGN_TOKENS_AUTHORITY.md` → docs


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

