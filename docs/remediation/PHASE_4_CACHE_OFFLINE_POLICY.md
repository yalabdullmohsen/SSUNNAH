# PHASE 4 — Cache & offline content policy

| Layer | Version source | Cache name / store | Invalidation |
|---|---|---|---|
| App shell | `version.json` / SW build stamp | SW precache | SW activate + chunk recovery (Phase 1) — no reload loops |
| Fiqh content | `public/data/fiqh/manifest.json` checksum | Cache API / fetch | Reject if checksum/schema mismatch; keep last good in memory for session |
| Search index | `public/data/search/manifest.json` + schema v3 | `static-json-cache` + worker | Purge on incompatible `version`; skip re-download if checksum matches |
| Hadith verified | `public/data/hadith-verified/manifest.json` | domain fetch cache | Part files; fail one part ≠ crash app |
| Offline engine | Dexie `majalis-offline-engine-v2` | IndexedDB | Schema bump → migrate; do not wipe good stores on failed delta |
| Content delta | `/api/content-delta` revision | offline-engine logical stores | Atomic activate when possible; rollback to last good revision |

## Rules

1. Content packs may update without binary app bump when checksum/schema validate.
2. Never cache auth / admin / draft / service-role responses in public Cache API.
3. Do not put full corpora in `localStorage`.
4. Offline eligibility is per-domain (`manifest.offlineEligible`); do not claim offline for untested domains.
5. Chunk recovery (Phase 1) owns reload-on-chunk-error; SW update must not create a second reload loop.
6. On checksum/schema failure: reject new pack; keep previous good; surface clear UI when content unavailable offline.

## Capacitor

Same asset paths under Capacitor webview; no Service Worker on native — rely on bundled/`public` assets + IndexedDB where implemented. Do not claim SW offline for Capacitor.
