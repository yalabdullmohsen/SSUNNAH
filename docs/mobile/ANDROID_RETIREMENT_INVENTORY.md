# Android Retirement Inventory — سُنّة

| Field | Value |
|-------|-------|
| Inventoried (UTC) | `2026-10-01T16:45:00Z` |
| Tip at inventory | `52aa7b2f` (+ tip-sync cherry-pick) |
| Android tree size | ~107 MB · ~2607 files under `artifacts/majalis/android` |
| Last supported tag (local) | `android-last-supported-state` → tip before delete |
| Policy | History remains in Git · no ZIP in repo · no in-tree archive copy |
| Product decision | **Android = RETIRED / OUT OF PRODUCT** |

## Classification legend

| Class | Meaning |
|-------|---------|
| DELETE_ANDROID_ONLY | Remove from active product tree |
| REMOVE_BUILD_REFERENCE | Drop scripts/deps that invoke Android |
| REMOVE_CI_REFERENCE | Drop CI path/lane Android expectations |
| KEEP_CROSS_PLATFORM | Shared JS/Capacitor API used by iOS/web |
| KEEP_HISTORICAL_DOC | Keep doc; mark HISTORICAL / OUT_OF_SCOPE |
| KEEP_WEB | Web-only |
| KEEP_IOS | iOS-only |
| OWNER_ARCHIVE | Owner may archive outside Git if desired |
| UNKNOWN | Forbidden — none left |

---

## A. Tree / build

| Item | Path / note | Class |
|------|-------------|-------|
| Android project root | `artifacts/majalis/android/` (entire) | DELETE_ANDROID_ONLY |
| Gradle root | `android/build.gradle` · `settings.gradle` · `variables.gradle` · `gradle*` | DELETE_ANDROID_ONLY |
| App module | `android/app/` · `applicationId com.majlisilm.app` | DELETE_ANDROID_ONLY |
| Kotlin/Java plugins | `com/majlisilm/app/*` (Adhan*, Media*, MainActivity) | DELETE_ANDROID_ONLY |
| Manifest / resources | `AndroidManifest.xml` · `res/` · icons | DELETE_ANDROID_ONLY |
| Cordova android plugins bridge | `android/capacitor-cordova-android-plugins` | DELETE_ANDROID_ONLY |
| Capacitor android package | `@capacitor/android` in majalis `package.json` | REMOVE_BUILD_REFERENCE |
| Scripts `mobile:android` | `artifacts/majalis/package.json` | REMOVE_BUILD_REFERENCE |
| Scripts `mobile:sync` android half | same — keep ios-only sync | REMOVE_BUILD_REFERENCE |
| `cap sync android` references | scripts / docs | REMOVE_BUILD_REFERENCE |
| `androidScheme` in capacitor config | Capacitor key — harmless; strip later optional | KEEP_CROSS_PLATFORM |
| Splash android* keys in capacitor | cosmetic — strip in same PR | REMOVE_BUILD_REFERENCE |

## B. CI / verify / release

| Item | Path | Class |
|------|------|-------|
| `release-verify.mjs` android applicationId asserts | `scripts/release-verify.mjs` | REMOVE_BUILD_REFERENCE → iOS-only asserts |
| `store-compliance-audit.mjs` AndroidManifest checks | `scripts/store-compliance-audit.mjs` | REMOVE_BUILD_REFERENCE → Apple-only |
| `verify-ci.mjs` android path lane | `scripts/verify-ci.mjs` | REMOVE_CI_REFERENCE (ios path remains) |
| `changed-scope.mjs` android path | `scripts/ci/changed-scope.mjs` | REMOVE_CI_REFERENCE → mark retired |
| `verify-cap-shim.mjs` expects `mobile:android` | `scripts/verify-cap-shim.mjs` | REMOVE_BUILD_REFERENCE |
| Workflows named ios-* | `.github/workflows/ios-*.yml` | KEEP_IOS |
| No dedicated android.yml found | — | — |
| path-classifier android | `.github/scripts/safe-auto-merge/path-classifier.mjs` | REMOVE_CI_REFERENCE / note retired |

## C. Test gates (must not require android/)

| Item | Path | Class |
|------|------|-------|
| phase6-release-readiness android Id | `phase6-release-readiness-gate.test.ts` | REMOVE_BUILD_REFERENCE |
| phase7-cross-phase android Id | `phase7-cross-phase-consistency-gate.test.ts` | REMOVE_BUILD_REFERENCE |
| release-lockdown gradle/proguard/manifest | `release-lockdown-gate.test.ts` | REMOVE_BUILD_REFERENCE → iOS lockdown only |
| `test:adhan-android-alarm` | package scripts + test file | KEEP_HISTORICAL or retarget — **retire script from default test:ci-unit if it imports android sources**; if pure JS scheduler keep as unit under renamed ios-safe name | REMOVE_BUILD_REFERENCE if file couples to Android APIs |
| ANDROID_RELEASE_CHECKLIST required in docs lists | `docs/qa/ANDROID_RELEASE_CHECKLIST.md` | KEEP_HISTORICAL_DOC (header RETIRED) · drop from required-present asserts |

## D. Store / Play / links

| Item | Path | Class |
|------|------|-------|
| Google Play / AAB / Data Safety in STORE_100 | `docs/store-release/STORE_100_PERCENT_READINESS.md` | KEEP_HISTORICAL_DOC → Apple-only active rows |
| Play checklists | `docs/qa/ANDROID_RELEASE_CHECKLIST.md` | KEEP_HISTORICAL_DOC |
| assetlinks.json | not present under `.well-known` (AASA only) | — none to delete |
| checklist-ar Bundle `com.majlisilm.app` | `store-assets/checklist-ar.md` | KEEP_HISTORICAL / fix note OUT_OF_SCOPE |
| MRMP Android columns | `docs/mobile/MRMP_*` | KEEP_HISTORICAL_DOC → rewrite tracker iOS |

## E. Shared product code (do NOT delete)

| Item | Class |
|------|-------|
| Prayer engine / adhan catalog / rights registry (TS) | KEEP_CROSS_PLATFORM |
| Capacitor iOS plugins usage in TS | KEEP_IOS |
| Web PWA / notifications web path | KEEP_WEB |
| `@capacitor/ios` · core · push · local-notifications | KEEP_IOS / KEEP_CROSS_PLATFORM |
| Expo `artifacts/majalis-mobile` | OUT_OF_PRIMARY (already excluded from root typecheck) — do not expand |
| Flutter `artifacts/majlisilm-flutter` | OUT_OF_SCOPE (already) |

## F. Open PRs

| PR | Decision |
|----|----------|
| #2299 native widgets CONFLICTING | **KEEP** as iOS candidate · OUT_OF_SCOPE_ANDROID N/A · rebase after this train |
| #1791 offline draft | **DEFER** · extract iOS-only later · not Android delete |
| #2443 U3 tip-sync | **SUPERSEDED** by this branch (cherry-picked) · close when this merges |

## G. UNKNOWN

**None.** Every inventoried class assigned.

## Exit for inventory

```text
ANDROID_RETIREMENT_INVENTORY_COMPLETE
NO_UNKNOWN_ITEMS
SAFE_TO_DELETE_ANDROID_TREE=true
```
