# Back Authority P7 — Closure Report

| Field | Value |
|---|---|
| Captured | 2026-10-01T01:55Z |
| Branch | `cursor/back-authority-unify-p7` |
| Base tip | `3b3498301` |
| Status | **BACK_P7_MERGED_AND_DEPLOYED** |

## STATUS

Merged #2415 · prod MATCH `2a4e3985` · smoke PASS · Route Feedback may start.

## LIVE BASELINE

- origin/main / prod: `3b349830` MATCH at P7 start
- rawButtonFiles 168 · rawButtonElements 650 · divSpanOnClick 59
- buttonRelatedImportantApprox **1258** (↓ from 1262)
- CSS `!important` **4784** (↓ from 4787)

## ROOT CAUSE

`sections-calm-polish.css` hid all in-page AppBack variants with `display:none !important`, forcing Floating host as the only visible back and violating FLOATING rule 6. `hasInPageBackChrome` also under-covered proven SectionLobby hubs.

## CONSUMER MAP

See `BACK_AUTHORITY_P7_CONSUMER_MAP.md`.

## CSS SUPPRESSION REMOVED

- Removed `display:none !important` on lobby/hero/inline/legal AppBack selectors.
- Kept empty selector anchors (no hide) to preserve inventory chunk budget.
- No new `!important` for suppression.

## IN PAGE OWNERSHIP

`hasInPageBackChrome` proven-only:

- hubs: `/quran-hub` `/lessons` `/sources` `/competitions` `/sections`
- lesson detail + fiqh lesson path
- settings/search/profile/adhan*/hadith readers (pre-existing)

Not claimed without AppBack: `/fiqh` hub, `/quran-hub/*` subs, `/support` `/contact`, competition/source details.

## FLOATING FALLBACK CONTRACT

- Host suppresses on home / immersive / adhan-settings / legal support·contact / hasInPageBackChrome
- DOM safety net: `[data-app-back="1"]:not([data-fixed-back-bar="1"])`
- MutationObserver rAF-debounced; disconnected when routeHide
- Host still wraps `AppBackButton variant="bar"`

## PAGE HERO ADAPTER

`PageHeroIntegratedBack` → AppBackButton only (gated).

## IMMERSIVE ROUTES

`/mushaf*` remains suppressed via `isImmersiveChromePath`.

## PRAYER

No route-surface / calculation changes. Prayer keeps custom `pts-back` (out of P7).

## AUTH ROUTES

Unchanged auth standalone autoHide.

## LAYER CLEARANCE

No new raw z-index. FloatingLayerManager unchanged for offsets.

## ACCESSIBILITY

AppBack retains aria-label «رجوع»; host button labeled.

## BEFORE VS AFTER

| Metric | Before | After |
|---|---:|---:|
| AppBack CSS hide !important | yes | **no** |
| buttonRelatedImportantApprox | 1262 | **1258** |
| important (visual) | 4787 | **4784** |
| Proven lobby Floating suppress | partial | **yes** |

## TESTS AND GATES

- `test:back-authority-unify` PASS
- `test:ios-final-polish` (incl. immersive-chrome) PASS
- floating-back-button static PASS
- interaction/visual debt budgets PASS

## PR DELIVERY

- PR: https://github.com/yalabdullmohsen/majalis/pull/2415
- Ready + auto-merge squash
- Required checks: Verify build · ci-required · repo-gates · build · static-checks · visual-snapshot · Color contrast · LHCI home

## PRODUCTION MATCH

- merge SHA: `2a4e3985ed50952aef8964f9aa15befbc677faf7` (#2415)
- production `version.json`: `2a4e3985` · builtAt=2026-10-01T02:08:54.186Z
- main = prod **MATCH**

## SMOKE TESTS

HTTP 200: `/` `/quran-hub` `/lessons` `/hadith` `/fiqh` `/sources` `/competitions` `/support` `/contact` `/settings` `/my-learning` `/login` `/register` `/mushaf` `/prayer-times` `/api/healthz` `/version.json`  
HTTP 404 expected: `/admin` `/admin/v3` (anonymous)

## REGRESSIONS

None known at freeze.

## ROLLBACK EVENTS

None.

## KEEP JUSTIFIED

- `MushafBookmarkEditorShell` `history.back()` for sheet
- `/support` `/contact` floating suppressed without in-page AppBack (native/browser)
- Prayer `pts-back` custom

## REMAINING BACK DEBT

- Migrate prayer pts-back → AppBack (follow-up)
- Add AppBack to LegalPageLayout for support/contact (follow-up)
- Expand AppBack to fiqh book/chapter pages (follow-up)
- AdminSiteEditBar raw z (Admin wave)

## NEXT PHASE READINESS

Route Feedback only after **BACK_P7_MERGED_AND_DEPLOYED**.

## FINAL DECISION

**BACK_P7_MERGED_AND_DEPLOYED**
