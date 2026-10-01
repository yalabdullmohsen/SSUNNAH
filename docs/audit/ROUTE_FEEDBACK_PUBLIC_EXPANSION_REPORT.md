# Route Feedback Public Expansion — FINAL CLOSURE Phase 2

| Field | Value |
|---|---|
| Status | **ROUTE_FEEDBACK_PUBLIC** (pending MERGED_AND_DEPLOYED) |
| Base tip | `4cb03081` (Phase 1 sealed) |
| Classification | [`ROUTE_FEEDBACK_PUBLIC_CLASSIFICATION.json`](./ROUTE_FEEDBACK_PUBLIC_CLASSIFICATION.json) |
| Gate | `artifacts/majalis/src/lib/__tests__/closure-route-feedback-public-gate.test.ts` |
| Priority | Still sealed via Phase 1 evidence + gate |
| Authority | Feedback V2 only |

## Goal

Every public active route is **COMPLETE** or honestly classified with evidence — no `PENDING`/`UNSET` on core feedback fields.

## Classification counts (live generation)

| Class | Count (approx) |
|---|---:|
| ACTIVE_PUBLIC_HIGH_TRAFFIC | 8 |
| ACTIVE_PUBLIC_SECONDARY | 153 |
| PUBLIC_DETAIL | 64 |
| REDIRECT_ONLY | 116 |
| STATIC_CONTENT | 12 |
| AUTH | 9 |
| ADMIN_ACCESS | 42 (excluded from public closure) |
| MUSHAF_SPECIAL | 4 |
| PRAYER_SPECIAL | 5 |
| HIDDEN_FEATURE | 2 |

## Batches (ordering)

1. Learning sub-routes  
2. Quran knowledge  
3. Hadith  
4. Fiqh  
5. Adhkar  
6. Library  
7. Account  
8. Legal/static  
9. Public details  
10. Redirects (REDIRECT_ONLY)

## Shared chrome evidence (class defaults)

| State | Authority |
|---|---|
| loading | `SafeLazyRoute` suspense |
| error | `SafeLazyRoute` + root `ErrorBoundary` |
| offline | `OfflineBanner` in `App.tsx` |
| empty / noResults | Feedback V2 page patterns + class reasons / N/A |

Feedback V2 authority only — no third-generation feedback kit. No Quran text / prayer calculation / adhan schedule changes.

## Gate rules

- Public routes: core states ∉ {PENDING, UNSET}
- `COMPLETE` ⇒ evidence fields (`testRef`, `artifact`, `expected`, `actual`)
- `NOT_APPLICABLE` / `REDIRECT_ONLY` / `ADMIN_ACCESS` ⇒ reason (or redirect class)
- Priority 14 remain `PRIORITY_CLOSED` with Phase 1 packs
- WAVE11 updated: `/library` = `REDIRECT_ONLY` (inventory redirect→`/search`); when `publicFeedbackPhase=ROUTE_FEEDBACK_PUBLIC`, PENDING loading count must be **0** (supersedes pre-Phase-2 leftover requirement)

## Device hold

Physical VoiceOver/TalkBack · 200% Zoom · Large Text OS · Split View remain **DEVICE_REQUIRED**.

## Closure criterion

`ROUTE_FEEDBACK_PUBLIC_COMPLETE` after merge · deploy · `version.json` MATCH · smoke · no critical regression.
