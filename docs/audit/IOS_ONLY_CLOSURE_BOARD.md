# SUNNAH IOS-ONLY COMPLETE PRODUCT CLOSURE — Board

| Field | Value |
|-------|-------|
| Updated (UTC) | `2026-10-01T17:16:00Z` |
| Status | **`ANDROID_PRODUCT_RETIRED`** · **`IOS_ONLY_PRODUCT_SCOPE_LOCKED`** · **`IOS_NATIVE_ARCHITECTURE_CERTIFIED`** |
| Tip / production (pre-PR) | `f62ae86e` **MATCH** · `builtAt=2026-10-01T16:49:57.451Z` |
| Prompt baseline | claimed `01c13f25` — superseded · then `52aa7b2f` · live tip `f62ae86e` |
| Product platforms | iPhone · iPad · Watch · Widgets · Lock Screen · Live Activities · Dynamic Island |
| Retired | Android · Wear OS · Google Play · Android Auto · Flutter · Expo primary |
| Local archive tag | `android-last-supported-state` (not force-pushed) |

## Delta vs prompt baseline

| Claim in prompt | Live truth |
|-----------------|------------|
| main/prod `01c13f25` | **`f62ae86e` MATCH** |
| U3 EXECUTION_UNLOCKED | **`DARK_LIGHT_UNIFIED`** (#2442) |
| U4 LOCKED | **EXECUTION_UNLOCKED** after this train MATCH+Smoke |
| Android identity mismatch HARD | **Irrelevant** — Android retired |

## ACTIVE PHASE

**PHASE 2 complete (repo)** → prepare **PHASE 4 U4 Startup Chrome** (serial after MATCH+Smoke of this PR).  
U3 already closed — do not re-execute.

## OPEN JOBS (classified)

| ID | Job | Class |
|----|-----|-------|
| P0–P1 | Live truth + Android retirement | **CLOSED** (this train) |
| P2 | iOS native architecture cert | **CLOSED** (repo) · signing OWNER |
| P3 | U3 theme | **CLOSED** `DARK_LIGHT_UNIFIED` |
| P4 | U4 startup chrome/CLS | FIXABLE — after MATCH |
| P5 | LHCI numeric on tip | FIXABLE |
| P6–P11 | Shell/deeplink/auth/offline/mushaf/prayer/a11y | DEVICE_REQUIRED + FIXABLE |
| P12 | Watch/Widgets/LA + App Groups | FIXABLE + LICENSE |
| P13 | Shared UI debt U5–U13 | FIXABLE |
| P14 | License-safe RC flavor | LICENSE + FIXABLE |
| P15–P16 | ASC / Archive / TestFlight | OWNER_ACTION + DEVICE |
| P17 | Final iOS closure report | DOCS after evidence |

## HARD BLOCKERS

| Item | Class | Note |
|------|-------|------|
| Signing / certs / profiles | BLOCKED_CREDENTIAL | Not in repo by design |
| Real-device matrices empty | DEVICE_REQUIRED | Simulator ≠ PASS |
| QPC/Hisn/unknown audio in RC | BLOCKED_LICENSE | Strip or grant |
| Istanbul CC0 | AUDIO | Human QA → APPROVED or system sound |
| ASC metadata upload | OWNER_ACTION | Consoles |

## SOFT BLOCKERS

- #2299 widgets CONFLICTING — rebase after iOS-only merge (iOS-relevant)
- #1791 offline draft — extract iOS-only later
- #2443 tip-sync — supersede/close after this train lands

## OWNER ACTIONS (non-blocking for repo work)

See `docs/release/OWNER_ACTIONS_CURRENT.md` — Apple signing, ASC Privacy answers sync, Human QA Istanbul, QPC grant/strip.

## EXECUTION STATUS

```text
LIVE_TRUTH_LOCKED_IOS_ONLY
ANDROID_PRODUCT_RETIRED
IOS_ONLY_PRODUCT_SCOPE_LOCKED
IOS_NATIVE_ARCHITECTURE_CERTIFIED
U3 = DARK_LIGHT_UNIFIED
NEXT READY PACK = Phase 4 U4 Startup Chrome (after MATCH+Smoke)
NEXT+1 READY PACK = Phase 5 LHCI Numeric Closure
```

## Forbidden claims until evidence

```text
STORE_GO · STORE_SUBMISSION_READY · IOS_RELEASE_CANDIDATE_READY
CONTENT_CERTIFIED · AUDIO_CERTIFIED · DEVICE_TESTED · UNIFIED_100
TESTFLIGHT_INTERNAL_CERTIFIED · APPLE_WATCH_PRAYER_CERTIFIED
```
