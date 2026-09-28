# ADHAN FIX DELIVERY STATUS — PR #2327

**Wave:** 1 — Confirm PR #2327 delivery  
**Recorded:** 2026-09-28  
**Working tree:** `cursor/adhan-device-closure` @ `origin/main` tip  
**Recorder SHA tip:** `d4c04b270c71192995ecd6536c5c626b5a36e343`

---

## Wave card

| Field | Value |
|---|---|
| Wave | 1 — Confirm PR #2327 delivery |
| Priority | P0 (gate for all device work) |
| Objective | Prove whether the early-stop correction exists in repo/main/CI/native installs before any device claim |
| Baseline | RCA class `DUPLICATE_SCHEDULER_INTERFERENCE`; reported fix commit `06d534e10` on branch `cursor/adhan-early-stop-rca-v2` |
| Confirmed issue | User: Adhan starts then stops ~5s — **not** re-declared fixed; delivery only |
| Evidence | `gh pr view 2327`, `git fetch origin/main`, `git show origin/main:…` markers, CI rollup, deploy run list |
| Root cause | Unchanged from RCA (not re-investigated) |
| Platforms | Repo/web confirmed; **native binaries not rebuilt for this fix** |
| Files allowed to modify | `docs/performance/ADHAN_FIX_DELIVERY_STATUS.md` (this file only in Wave 1) |
| Files allowed to create | same |
| Files explicitly excluded | prayer calc · audio assets · unrelated PRs · native version bumps (Wave 1 = observe only) |
| Prayer-calculation impact | None |
| Notification impact | None in this wave (code already merged) |
| Audio impact | None |
| Privacy impact | None |
| Native-build impact | **None yet** — no iOS/Android store/TestFlight build tied to this SHA |
| Rollback | N/A (documentation) |
| Focused tests | Static presence checks only |
| Full verification | Deferred (device waves) |
| Device blockers | **No corrected native build installed** → device Adhan closure blocked |

---

## Classification (authoritative)

| Layer | Class | Notes |
|---|---|---|
| Source correction in git | **CODE_PRESENT** | Markers verified on `origin/main` |
| Pull request | **MERGED** | Squash merge 2026-09-28T09:16:10Z |
| Web production binary | **MERGED_NOT_BUILT** → deploy **in_progress** | Auto Deploy run `36402412398` on `d4c04b270` not finished at record time |
| Native project sources | **CODE_PRESENT** | Android `AdhanPlaybackService` diag + TS paths on main |
| Native installed build (TestFlight / Play / sideload) | **UNKNOWN** / effectively **MERGED_NOT_BUILT** | No version/build bump in #2327; no evidence install contains `d4c04b270` |
| Device validation | **INSTALLED_NOT_TESTED** only after a post-merge native build is installed | Do **not** test Adhan closure on pre-fix installs |
| Superseded / regressed | **No** | Tip of `origin/main` **is** the squash of #2327; no later commit observed that removes the guards |

**Primary delivery label for next waves:** `CODE_PRESENT` + `MERGED_NOT_BUILT` (native).

---

## Exact Git / PR facts

| Item | Value |
|---|---|
| PR | https://github.com/yalabdullmohsen/majalis/pull/2327 |
| State | **MERGED** |
| Branch | `cursor/adhan-early-stop-rca-v2` |
| PR head OID | `06d534e1076a7447997eba399850c62f89e5d852` |
| Merge commit on `main` | `d4c04b270c71192995ecd6536c5c626b5a36e343` (squash) |
| Is `06d534e10` an ancestor of `origin/main`? | **No** (expected for squash) |
| Is fix **content** on `origin/main`? | **Yes** (`d4c04b270` is tip) |
| Docs on main | `docs/performance/ADHAN_PIPELINE_MAP.md` present |
| Gate on main | `adhan-early-stop-rca-gate.test.ts` present |

### CI on final PR head (`06d534e10`)

| Check | Result |
|---|---|
| Verify build | SUCCESS |
| ci-required | SUCCESS |
| static-checks | SUCCESS |
| repo-gates | SUCCESS |
| build | SUCCESS |
| Color contrast | SUCCESS |
| LHCI home | SUCCESS |
| visual-snapshot | SUCCESS |
| quality (PR audits) | SUCCESS · P0=0 |
| auto-merge | SUCCESS |

CI workflow run (PR): `https://github.com/yalabdullmohsen/majalis/actions/runs/36401332625`

### Post-merge on `main` (`d4c04b270`) — at record time

| Workflow | Status |
|---|---|
| CI | in_progress (`36402412252`) |
| Auto Deploy main → production | in_progress (`36402412398`) |

Do not treat production `version.json` as updated until deploy completes and SHA matches `d4c04b270` (or later tip containing it).

---

## Code presence proof (main tip)

Verified via `git show origin/main:…` / tip `d4c04b270`:

1. **`prayer-local-notifications.ts`** — `cancelPrayerNativeNotificationsExcept` contains:
   - `if (extra.adhanSegment === true) continue;`
2. **`App.tsx`** — `appStateChange` path:
   - `const ctx = getAdhanResumeContext();`
   - `if (!ctx) return;`
   - `resumeInternal: true` with `prayerKey: ctx.prayerKey`
3. **`adhan-diagnostics.ts`** — present with `ADHAN_*` event tags
4. **`AdhanPlaybackService.kt`** — `DIAG_TAG = "ADHAN_DIAG"` + lifecycle logs
5. **Regression gate** — `adhan-early-stop-rca-gate.test.ts` present

Unchanged by design (spot-check scope): prayer calculation modules not part of the merge; logicalId / dedupe architecture not redesigned in the squash message/stat.

---

## Native version / build association

| Platform | Marketing / name | Build / code | Tied to #2327? |
|---|---|---|---|
| iOS (`project.pbxproj`) | `MARKETING_VERSION = 1.0` | `CURRENT_PROJECT_VERSION = 54` | **No bump** in #2327 |
| Android (`app/build.gradle`) | `versionName "1.0.0"` | `versionCode 1` | **No bump** in #2327 |

**Implication:** Any TestFlight / Play / local install built **before** a native rebuild from `d4c04b270` (or later) **does not** qualify as the corrected build for device closure, even if the user updates the web shell inside Capacitor without a full native ship.

Capacitor note: web assets can update independently of native binary; Adhan early-stop fix is **mostly TypeScript** (plus Android Kotlin diag). A fresh `cap sync` + web deploy into an existing native shell **may** carry the JS fix without a store bump — but:

- Android Kotlin diag / any future native lifecycle changes require a native rebuild.
- This Wave **does not** assert that any installed app already synced web assets from `d4c04b270`.
- Until an explicit post-merge install path is documented (store build number **or** local sync SHA), treat device status as **not validated**.

---

## What Wave 1 does **not** claim

- Adhan plays to completion on device  
- Notification uniqueness on device  
- iOS segment continuity on locked phone  
- Android exact-alarm / FGS success on device  
- Production web already serving `d4c04b270` (deploy was still in progress)  
- Installed TestFlight/Play build identity  

---

## Gate for subsequent waves

| Next wave | Allowed only if |
|---|---|
| Ownership audit / static regression | CODE_PRESENT (satisfied) |
| Native build validation | Start from `d4c04b270`+ ; produce identifiable iOS build >54 **or** document web-sync-only Capacitor install with SHA proof |
| Device scenario execution | Build under test **proven** to contain the correction (SHA / bundle id + build number / sync log) |
| Release decision “Adhan closed” | Device matrix green + diagnostics — **not** from static tests alone |

---

## Follow-ups recorded (not executed in Wave 1)

1. Wait for Auto Deploy `36402412398` → confirm production `version.json` SHA.  
2. Decide install path: Capacitor web sync vs full native rebuild (recommend rebuild if Android logs required).  
3. Record installed build numbers before any device matrix.  
4. Ownership audit: enter-time reschedule vs adhan-scheduler dual ownership (Wave 2).  

---

## Summary line

**PR #2327 is MERGED; correction CODE_PRESENT on `origin/main` at `d4c04b270` (squash of `06d534e10`); PR CI green; native store/TestFlight build containing the fix: NOT EVIDENCED → class `MERGED_NOT_BUILT` for device work. Do not run Adhan device closure on a pre-fix install.**
