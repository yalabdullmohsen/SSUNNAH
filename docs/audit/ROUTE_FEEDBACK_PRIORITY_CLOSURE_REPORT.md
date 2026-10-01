# Route Feedback Priority Closure — FINAL CLOSURE Phase 1

| Field | Value |
|---|---|
| Status | **ROUTE_FEEDBACK_PRIORITY_MERGED_AND_DEPLOYED** |
| Base tip | `cfcc6e7f` (Phase 0 LIVE_BASELINE_LOCKED) |
| Evidence | [`ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json`](./ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json) |
| Gate | `artifacts/majalis/src/lib/__tests__/closure-route-feedback-priority-gate.test.ts` |
| Authority | Feedback V2 only — [`FORM_FEEDBACK_AUTHORITY.md`](../design/FORM_FEEDBACK_AUTHORITY.md) |
| Rule | **COMPLETE forbidden without evidence pack** |

## Scope

Priority routes (14):

`/` · `/search` · `/quran-hub` · `/mushaf` · `/mushaf/bookmarks` · `/prayer-times` · `/lessons` · `/hadith` · `/fiqh` · `/adhkar` · `/settings` · `/my-learning` · `/login` · `/register`

## Product changes

| File | Change |
|---|---|
| `SettingsView.tsx` | Cache refresh failure → `FieldError` (`settings-cache-refresh-error`) + `STATUS.loadError` |
| `QuranHubView.tsx` | Defensive `EmptyStateV2` if lobby groups empty; documents STATIC_LOBBY N/A for empty/error/noResults |

Feedback V2 authority only — no third-generation feedback kit. No Quran text / prayer calc / adhan schedule changes.

## Classifications

| Route | Notable honesty |
|---|---|
| `/quran-hub` | empty/error/noResults = **NOT_APPLICABLE** (static registry lobby) |
| `/settings` | error = **COMPLETE** via FieldError; empty/noResults N/A |
| Most priority | offline = **COMPLETE** via `OfflineBanner` chrome contract (+ route-inline where already present, e.g. `/search`) |
| permissionDenied / rateLimited | **NOT_APPLICABLE** on these public/auth shells |
| Mushaf / Prayer | **MUSHAF_SPECIAL** / **PRAYER_SPECIAL** — matrix confirm only |

## Evidence contract (gate)

Every matrix `COMPLETE` on priority core states must have in the evidence JSON:

- `routeClass`
- `testRef`
- `testedCommit` / `testedDate` (pack-level)
- `artifact`
- `expected`
- `actual`

`NOT_APPLICABLE` requires `reason`.

## Device hold

VoiceOver/TalkBack · 200% Zoom · Large Text OS · Split View · Prayer background/adhan delivery remain **DEVICE_REQUIRED** (see evidence `deviceRequired`).

## Tests

```bash
pnpm --filter @workspace/majalis run test:route-feedback-priority
pnpm --filter @workspace/majalis run test:wave4-route-feedback
pnpm --filter @workspace/majalis run test:form-feedback-authority
```

Wired into `test:sunnah-ui-refinement`.

## Closure criterion

`ROUTE_FEEDBACK_PRIORITY_MERGED_AND_DEPLOYED` after:

1. focused gates PASS  
2. verify:preflight + verify:ci PASS  
3. PR merged · main CI · Auto Deploy · `version.json` MATCH · smoke PASS  

## Delivery

| Item | Value |
|---|---|
| PR | https://github.com/yalabdullmohsen/majalis/pull/2418 |
| Merge | `c6f56d2ad` |
| Production | `c6f56d2a` MATCH |
| Smoke | priority routes HTTP 200 |
| Criterion | `ROUTE_FEEDBACK_PRIORITY_MERGED_AND_DEPLOYED` |
