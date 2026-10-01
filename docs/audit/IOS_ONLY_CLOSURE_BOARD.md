# SUNNAH IOS-ONLY COMPLETE PRODUCT CLOSURE — Board

| Field | Value |
|-------|-------|
| Locked at (UTC) | `2026-10-01T16:45:00Z` |
| Status | **`LIVE_TRUTH_LOCKED_IOS_ONLY`** |
| Tip / production | `52aa7b2f` **MATCH** · `builtAt=2026-10-01T16:34:15.221Z` |
| Prompt baseline | claimed `01c13f25` — **superseded** by live tip (+U3 #2442) |
| Product platforms | iPhone · iPad · Watch · Widgets · Lock Screen · Live Activities · Dynamic Island |
| Retired | Android · Wear OS · Google Play · Android Auto · Flutter · Expo primary |

## Delta vs prompt baseline

| Claim in prompt | Live truth |
|-----------------|------------|
| main/prod `01c13f25` | **`52aa7b2f` MATCH** |
| U3 EXECUTION_UNLOCKED | **`DARK_LIGHT_UNIFIED`** (#2442 MERGED_AND_DEPLOYED) |
| U4 LOCKED | **EXECUTION_UNLOCKED** (next after Phase 0–1) |
| Android identity mismatch HARD | Becomes **irrelevant** after verified Android retirement |

## ACTIVE PHASE

**PHASE 0 → PHASE 1** Safe Android Retirement (inventory then delete)

## OPEN JOBS (classified)

| ID | Job | Class |
|----|-----|-------|
| P0-1 | Live truth lock iOS-only | FIXABLE — this board |
| P1-1 | Android retirement inventory | FIXABLE |
| P1-2 | Tag `android-last-supported-state` (local) | FIXABLE |
| P1-3 | Remove android/ + scripts/CI/gates | FIXABLE |
| P1-4 | IOS_ONLY gates | FIXABLE |
| P2 | iOS native architecture cert | FIXABLE (signing = OWNER) |
| P3 | U3 theme | **CLOSED** `DARK_LIGHT_UNIFIED` |
| P4 | U4 startup chrome/CLS | FIXABLE — unlocked after P1 MATCH |
| P5 | LHCI numeric on tip | FIXABLE |
| P6–P11 | Shell/deeplink/auth/offline/mushaf/prayer/a11y | DEVICE_REQUIRED + FIXABLE |
| P12 | Watch/Widgets/LA prayer-only | FIXABLE + LICENSE |
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

- #2299 widgets CONFLICTING — rebase after iOS-only (iOS-relevant, not Android)
- #1791 offline draft — extract iOS-only later
- #2443 tip-sync OPEN — superseded by this train (cherry-picked)

## OWNER ACTIONS (non-blocking for repo work)

See `docs/release/OWNER_ACTIONS_CURRENT.md` — Apple signing, ASC, Human QA Istanbul, QPC grant/strip.

## EXECUTION STATUS

```text
LIVE_TRUTH_LOCKED_IOS_ONLY
U3 = DARK_LIGHT_UNIFIED (prior)
ANDROID_PRODUCT_RETIRED = IN_PROGRESS
NEXT READY PACK = Phase 1 inventory → delete
NEXT+1 READY PACK = Phase 2 IOS_NATIVE_ARCHITECTURE_CERTIFIED
```

## Forbidden claims until evidence

```text
STORE_GO · STORE_SUBMISSION_READY · IOS_RELEASE_CANDIDATE_READY
CONTENT_CERTIFIED · AUDIO_CERTIFIED · DEVICE_TESTED · UNIFIED_100
```
