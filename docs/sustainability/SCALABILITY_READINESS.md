# SCALABILITY_READINESS

Future growth impact — readiness without speculative rewrites.

| Growth vector | Impact | Mitigation already in place | Future rule |
|---|---|---|---|
| Routes / sections | Lazy AppRoutes + registry | route-registry · section gates · SafeLazyRoute | Add section via registry + IA doc same PR |
| Search volume | RPC + local facets + obs counters | queryKeys · SEARCH_STALE_MS · search gates | Expand indexes via gated PRs; no silent ranking forks |
| Content volume | JSON catalogs + Query staleTime 300s | content audit gates · empty/no-results Feedback V2 | Prefer incremental seeds + completeness audits |
| Mushaf features | SPECIAL_CASE feature stores | fluidity audit · measure pages · motion policy | New mushaf UX must keep hotspot metrics = 0 |
| Hadith features | Hub + collection registry | hadith-data-truth · section UI · Feedback V2 | New collections via registry + truth gates |
| Governance surface | Many gates in ci-unit | path-lane · verify:ci aggregator | New domain → new gate **or** extend existing authority |
| Native surfaces | Capacitor shell | iOS/Android checklists · DEVICE_REQUIRED matrices | Store actions owner-only; agents never upload |
| Observability | Client aggregate + ops | platform-health · error-report · RUM idle | New signals must be privacy-safe + non-blocking |

## Explicit non-goals (this program)

- No database sharding / new cache platforms
- No search ranking redesign
- No Mushaf rewrite
- No store submission

SCALABILITY_READY
