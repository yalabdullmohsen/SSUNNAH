# تقرير نطاق التغييرات

**التاريخ:** 2026-10-10T09:58:26.435Z
**عدد الملفات:** 4
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

- `.github/workflows/asc-store-sync.yml` → ci_config
- `docs/handover/n3.md` → docs
- `scripts/asc-store-sync.mjs` → other
- `store/asc/metadata-1.1.0.json` → other


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

