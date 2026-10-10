# تقرير نطاق التغييرات

**التاريخ:** 2026-10-10T01:46:58.220Z
**عدد الملفات:** 3
**النطاقات:** ci/config، other
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
- `scripts/__tests__/ci-local-lock.test.mjs` → other
- `scripts/ci-local-lock.sh` → other


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

