# نية مسار المكتبة — PRODUCT_INTENT

**Updated:** 2026-09-28 · Phase 4 content delivery  
**Status:** intentional redirect (not a regression) — see `docs/remediation/PHASE_4_LIBRARY_DECISION.md` (REDIRECT_RETAINED / BLOCKED_SOURCE)

## Behavior

| Route | Target | HTTP (prod) |
|---|---|---|
| `/library` | `/search` | 308 → 200 |
| `/library/:id` | `/search` | 308 → 200 |

## Why

The public scholarly-library surface was removed from discovery chrome. Book discovery for verified sources goes through **search** (and related SEO/sitemap policy). Admin catalog records remain; public `source_missing` stays hidden (Wave 3).

## Do not

- Restore a public `/library` index without a product decision.
- Treat this redirect as a broken deep link in audits.
- Change the target without updating this doc + `section-template-gate` / `deeplink-learn-series-gate`.

## Gate

`artifacts/majalis/src/lib/__tests__/deeplink-learn-series-gate.test.ts`  
`artifacts/majalis/src/lib/__tests__/section-template-gate.test.ts`
