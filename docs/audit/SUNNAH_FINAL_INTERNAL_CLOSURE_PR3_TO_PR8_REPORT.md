# Final Internal Closure — PR3→PR8 Program Report

| Field | Value |
|---|---|
| Written | 2026-09-29T21:20Z |
| Tip at PR3 start | `81b20440b` (= production) |
| PR2 | **RESOLVED_AND_DEPLOYED** (`e884d22d1` / #2364) |

## STATUS

**VISUAL_INTERACTION_PARTIAL** · **WEB_RELEASED_NATIVE_HOLD**

PR3 delivers `/my-learning` confirmation + public select MIGRATE_NOW wave. PR4–PR8 remain sequential follow-ups — **not** claimed complete in this document.

## STARTING BASELINE

See `docs/audit/FINAL_INTERNAL_CLOSURE_PR3_BASELINE.md`.

Highlights: `mj-outside=0` · public native **14** · raw buttons **225/971** · div/span onClick **59** · critical CSS ~**58.7 KiB** gzip · `/my-learning` already COMPLETE from PR1.

## PR DELIVERY MATRIX

| PR | Scope | This wave |
|---|---|---|
| **PR3** | `/my-learning` confirm + public selects MIGRATE_NOW | **In delivery** |
| PR4 | Raw buttons + non-semantic interactions | **Queued** |
| PR5 | Legacy CSS retirement + Page Authority adapters | **Queued** |
| PR6 | Floating Layer Manager | **Queued** |
| PR7 | Mushaf UI-only | **Queued** |
| PR8 | Critical CSS margin + final visual/a11y matrix + audit | **Queued** (critical CSS already under budget with margin) |

## ROUTE QUALITY

| Route | Status |
|---|---|
| `/my-learning` | **COMPLETE** (PR1 + PR3 gate confirm: loading/empty/error/offline/dark/rtl/a11y/visualSystem) |
| Other public routes | Mostly PENDING — out of PR3 |

## PUBLIC SELECTS

| | Before PR3 | After PR3 |
|---|---:|---:|
| Public native files | 14 | **12** |
| Migrated this PR | — | Circles · MushafBookmarks |
| Justified remainder | — | PRAYER/MUSHAF/long-list/hours/Settings mixed |

Detail: `docs/design/PUBLIC_SELECT_CLOSURE_REPORT.md`

## BUTTONS

Unchanged in PR3 (225 files / 971 elements). Target: PR4.

## NON-SEMANTIC INTERACTIONS

Unchanged (59). Target: PR4 classification + fix SHOULD_BE_*.

## LEGACY CSS

No SAFE_REMOVE this PR. Matrix remains Wave-3 / PR2 classifications. Target: PR5.

## PAGE AUTHORITY

No adapter rewrite this PR. UtilityScreen KEEP=3 justified pending PR5/PR6 audit. Target: PR5.

## FLOATING LAYERS

No change. Target: PR6 · DEVICE_REQUIRED for real devices.

## MUSHAF UI

Bookmarks filter chrome only (Select migrate). No Quran text/mapping/geometry. Target deeper chrome: PR7.

## CRITICAL CSS

Live ~**58.7 KiB** gzip under 60 KiB. No trim in PR3. Optional margin widen: PR8 if still tight after other CSS moves.

## ACCESSIBILITY

PR3: Select triggers named · FieldLabel · min-h-11 text-base (iOS zoom). Full screenshot matrix: PR8. VoiceOver/TalkBack: DEVICE_REQUIRED.

## PERFORMANCE

No intentional regression. Select migrations are deferred UI chrome. LHCI/contrast remain required on UI lane.

## BEFORE VS AFTER (PR3 only)

| Metric | Before | After |
|---|---:|---:|
| public native selects | 14 | **12** |
| mj-outside | 0 | **0** |
| `/my-learning` COMPLETE | yes | yes (reconfirmed) |
| raw buttons | 225/971 | unchanged |
| hex / important ceilings | 9090 / 4798 | not raised |

## TESTS AND GATES

- `my-learning-route-quality-gate.test.ts`
- `public-select-pr3-gate.test.ts`
- Wired via `test:final-internal-closure-pr3` → `test:sunnah-ui-refinement`
- Local: `verify:preflight` · `verify:ci` · `release:verify` (at Delivery)

## PRODUCTION

After PR3 merge: require `version.json` match `origin/main` + smoke Home/Search/Prayer/Quran.

## REMAINING FIXABLE_IN_REPOSITORY

1. Public selects justified/deferred (12 files) — Settings fontSize MIGRATE_NOW later  
2. Raw buttons + div/span onClick (PR4)  
3. Legacy CSS consumers / SAFE_REMOVE (PR5)  
4. Page Authority / UtilityScreen KEEP audit (PR5)  
5. Floating layer conflicts (PR6)  
6. Mushaf chrome UI-only (PR7)  
7. Final visual/a11y matrix (PR8)

## DEVICE_REQUIRED

- Adhan / prayer audio on device  
- Mushaf VisualViewport / Safe Area on device  
- VoiceOver / TalkBack  
- Widget PR #2299 (native, CONFLICTING — out of program)

## OWNER_ACTION

None blocking web PR3. Native widgets #2299 / offline #1791 are separate tracks.

## LICENSE_BLOCKERS

Unchanged from store HOLD posture.

## FINAL STATUS

**VISUAL_INTERACTION_PARTIAL**

**WEB_RELEASED_NATIVE_HOLD**
