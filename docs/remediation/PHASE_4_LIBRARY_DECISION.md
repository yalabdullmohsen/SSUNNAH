# PHASE 4 — Library route decision

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/content-delivery-perf-p4` |
| Decision | **REDIRECT_RETAINED** / **BLOCKED_SOURCE** |

## Evidence (code + data)

| Check | Result |
|---|---|
| `/library` → `/search` in `AppRoutes.tsx` | Yes (PRODUCT_INTENT) |
| `/library/:id` → `/search` | Yes |
| vercel.json library redirects | Present (308) |
| Public verified sources | **18 / 190** (`library-public-source-gate`, Wave 3) |
| `source_missing` | Majority of catalog — must not publish as trusted books |
| Invented sources | Forbidden |

## Path chosen: B (not ready for public library)

Minimum publishable verified corpus is far below a trustworthy public library surface. Restoring `/library` as an index would either:

1. show mostly `source_missing` (dishonest), or
2. show ~18 items with empty-looking UX without inventing content.

Neither meets publication honesty. Search remains the discovery surface.

## What we did not do

- Did not invent source URLs or upgrade `source_missing` → verified.
- Did not fabricate catalog rows.
- Did not break indexed redirects.

## Re-open criteria

Restore Path A only when a product decision + verified corpus growth passes an explicit gate (counts + provenance review). Update this doc + `LIBRARY_ROUTE_INTENT.md` together.
