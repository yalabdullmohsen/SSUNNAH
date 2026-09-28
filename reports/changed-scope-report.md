# تقرير نطاق التغييرات

**التاريخ:** 2026-09-28T18:53:46.747Z
**عدد الملفات:** 6
**النطاقات:** backend/api
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | — |
| api | ✓ |
| seo | — |
| pwa | — |
| content | — |
| ios | — |
| full | — |
| mushaf | — |
| build | ✓ |
| visual | — |
| lighthouse | — |
| color_contrast | — |
| data_audit | — |

## الملفات المتغيرة (أول 40)

- `artifacts/majalis/api/assistant.js` → backend_api
- `artifacts/majalis/api/assistant/health.js` → backend_api
- `artifacts/majalis/api/cron/sync-data.js` → backend_api
- `artifacts/majalis/api/healthz.js` → backend_api
- `artifacts/majalis/api/prayer-times.js` → backend_api
- `artifacts/majalis/api/test-anthropic.js` → backend_api


## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

