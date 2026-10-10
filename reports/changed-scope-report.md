# تقرير نطاق التغييرات

**التاريخ:** 2026-10-10T01:55:09.749Z
**عدد الملفات:** 5
**النطاقات:** ci/config، docs، other
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

- `package.json` → ci_config
- `reports/changed-scope-report.md` → docs
- `reports/changed-scope-verify.json` → other
- `scripts/__tests__/ci-local-lock.test.mjs` → other
- `scripts/ci-local-lock.sh` → other


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

