# ZERO STARTUP FLICKER — Scope Manifest (Follow-up Closure)

| Field | Value |
|---|---|
| Locked at (UTC) | `2026-10-01T10:50:00Z` |
| BASE_SHA | `cb2d3636d` (`origin/main`) |
| PR_HEAD | `cursor/zero-startup-flicker-closure` (follow-up; #2430 MERGED) |
| PRODUCTION_SHA | `cb2d3636` **MATCH** tip at lock |
| Prior product PR | #2430 `7d4b30443` — contrast/visual/Verify **SUCCESS** |
| Startup verdict at lock | `STARTUP_FLICKER_PARTIALLY_FIXED` |

## FAILED_GATES (live)

| Claim in prompt | Live |
|---|---|
| Color Contrast / Visual Snapshot blocking | **CLOSED** on #2430 — do not reopen |
| Verify build / ci-required | **CLOSED** on #2430 |
| Production Home CLS / Prayer CLS / themeMut / chrome presence | **OPEN** — this PR |

## FILES_ALLOWED

- `artifacts/majalis/index.html` (+ CSP hash in `vercel.json` if boot script changes)
- `artifacts/majalis/src/lib/route-surface.ts`
- `artifacts/majalis/src/components/FloatingBackButton.tsx`
- `artifacts/majalis/src/components/BottomNavBar.tsx`
- `artifacts/majalis/src/styles/pages/profile-hub-v2.css`
- `artifacts/majalis/src/styles/sunnah-identity-chrome-nav.css`
- `artifacts/majalis/src/styles/critical-first-paint.css`
- `artifacts/majalis/src/lib/theme-preference.ts` (idempotent harden only)
- gates under `src/lib/__tests__/*startup*` / visual-redesign nav assertion
- `docs/performance/ZERO_STARTUP_FLICKER_FINAL_VERIFICATION.md`
- `docs/design/DEFERRED_CSS_CONSUMER_MATRIX_V2.md` (if touched)
- evidence under `docs/performance/evidence/zero-startup-flicker-prod-*`

## FILES_FORBIDDEN

- Quran JSON / QPC / WAVE6 / prayer calculation / adhan schedule
- Budget / threshold / snapshot baseline raises
- New theme/identity/card systems · mega-bundle · new `!important` · new raw colors

## SUCCESS_CRITERIA (production after MATCH)

- fontΔ=0 · bgΔ=0 · themeMutAfterFP=0 on five routes
- Home/Search/QuranHub/Prayer CLS < 0.01 · Mushaf CLS = 0
- Header/Hero/BottomNav/Back jump = 0 (measure contract)
- Contrast + Visual Snapshot PASS · no budget raise
- Verdict `ZERO_STARTUP_FLICKER_COMPLETE` only if all prod criteria hold

## IMPLEMENTATION_FROZEN

Declared after patches land; no scope expansion during verify/PR.
