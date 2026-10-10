# تقرير نطاق التغييرات

**التاريخ:** 2026-10-10T10:26:46.423Z
**عدد الملفات:** 9
**النطاقات:** ci/config، other، docs
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | — |
| api | — |
| seo | — |
| pwa | — |
| content | — |
| ios | — |
| full | ✓ |
| mushaf | — |
| build | ✓ |
| visual | — |
| lighthouse | — |
| color_contrast | — |
| data_audit | — |

## الملفات المتغيرة (أول 40)

- `.github/workflows/asc-store-sync.yml` → ci_config
- `artifacts/majalis/node_modules` → other
- `docs/handover/n3.md` → docs
- `docs/program/DEVICE_TEST_CHECKLIST_1.1.0.md` → docs
- `node_modules` → other
- `reports/changed-scope-report.md` → docs
- `reports/changed-scope-verify.json` → other
- `scripts/asc-store-sync.mjs` → other
- `store/asc/metadata-1.1.0.json` → other


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

