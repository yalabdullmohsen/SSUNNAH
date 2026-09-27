# WAVE — Search Route Integrity

| Field | Value |
|---|---|
| Priority | P0 |
| State | IMPLEMENTED (pending merge/deploy) |
| Branch | `fix/search-route-integrity` |
| Audit | `docs/remediation/SEARCH_ROUTE_INTEGRITY_AUDIT.md` |

## Objectives completed in wave

- [x] Reproduce unavailable history from search
- [x] Fix content-resolver / knowledge-search navigation contract
- [x] Exclude dual `knowledge/history` from public index
- [x] Index schema v3 + local cache invalidation
- [x] Build-time route validator (`invalidPublicSearchDestinations = 0`)
- [x] Compact history unavailable state for external old links
- [x] Focused regression tests

## Follow-ups (not blocking)

- DEVICE_REQUIRED: Capacitor WebView + installed PWA hard-refresh confirmation
- PRODUCTION_VALIDATION_REQUIRED after deploy: query `أبي بكر` opens `/tarikh-islami/rashidun-abu-bakr`
- Optional: expand validator to lesson/QA/adhkar category ID registries in full
