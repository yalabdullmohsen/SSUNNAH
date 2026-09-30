# سُنّة — Mushaf Final Complete Closure Report

| Field | Value |
|---|---|
| Tip / production | `209f7bfc` · MATCH · `builtAt` 2026-09-30T17:45:27.895Z |
| Internal status | **MUSHAF_REPOSITORY_CLOSURE_COMPLETE_DEVICE_HOLD** |
| General | **WEB_RELEASED_NATIVE_HOLD** |
| Store | **HOLD** (not STORE GO) |

## EXECUTIVE VERDICT

Repository mushaf closure program (FINAL-1→6) delivered, merged, and deployed on tip matching production. WAVE6 contracts remain live. Quran protected assets unchanged. Remaining gaps are DEVICE_REQUIRED / KEEP / OWNER — no undeclared P0 FIXABLE_IN_REPOSITORY for live `/mushaf`.

## MAIN AND PRODUCTION

| | |
|---|---|
| `origin/main` | `209f7bfc508dbbf4283fa2c8dd98d5675eb63665` |
| `version.json` | `209f7bfc` MATCH |

## PROTECTED QURAN ASSETS

Manifest: `docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md`  
Byte lock PASS · 604 QPC woff2 · ≥604 page JSON · mapping/checksum gates PASS · no glyph/text edits.

## WAVE6 REGRESSION AUDIT

PASS — page-only font wait · ±1/±2 idle · queue cap 4 · dual lock · queued intent=1 · panSlopFor · telemetry off · gate negation fix (FINAL-1).

## CONTROL SEMANTICS

Matrix: `MUSHAF_CONTROL_SEMANTIC_MATRIX.md` · WAVE10 + coach USE_BUTTON · chrome MUSHAF_SPECIAL_KEEP.

## BOOKMARK EDITOR / DIVIDER AND MARK EDITOR

FINAL-2: busyRef · aria-busy · note label · offline local status · first-field focus (FINAL-1) · VV shell prior.

## VISUAL VIEWPORT / SAFE AREAS

Editor shell + inset tokens · DEVICE_REQUIRED for real iOS keyboard.

## PAGE TURN STATE MACHINE / EDGE CASES

FINAL-3: pointercancel → onNavigateCancel · edge gate clamp/phases/safety cleanup.

## FONT AND PAGE DATA

Direction-biased prefetch (FINAL-1) · dedupe/inflight/generation preserved · no 604 preload.

## RENDER SUBSCRIPTIONS / SELECTION / AUDIO

FINAL-4: verse layer no audio clock · MediaBridge isolated · selection invalidate on resize/orientation.

## SEARCH AND TAFSIR

Search 16px · offline status · appearance attr on portal (FINAL-5) · stale cancel. Tafsir content untouched.

## APPEARANCE BOUNDARY

html + nm-root `data-mushaf-appearance` · search portal mirror · dual theme gates.

## RESPONSIVE AND IPAD

iPad width gate · no hard 430 lock · DEVICE_REQUIRED Split View.

## ACCESSIBILITY

FINAL-6 Arabic live page N/604 · coach keyboard · unnamed live chrome = 0 scan. Not WCAG CERTIFIED.

## OFFLINE AND RECOVERY / MEMORY

Local bookmarks · offline search copy · safety timer cleanup · 100-turn heap DEVICE_REQUIRED.

## PERFORMANCE BEFORE VS AFTER

Direction-biased near prefetch · coach deferred 480ms · no budget raises · telemetry off by default.

## AUTOMATED MATRIX / DEVICE REQUIRED MATRIX

Automated: integrity · WAVE6 · FINAL-1…6 · mushaf measure · contrast/snapshot via CI.  
Device: WAVE6/WAVE13 matrices · all DEVICE_REQUIRED without artifacts.

## INTEGRITY GATES / TESTS AND GATES

verify:preflight · verify:ci · mushaf unit · page-flip chain including FINAL-* · byte lock · WAVE6.

## PR DELIVERY MATRIX

| PR | Wave | SHA tip after |
|---|---|---|
| #2395 | FINAL-1 | `c27dd2c8` |
| #2396 | FINAL-2 | `771b55f7` |
| #2397 | FINAL-3 | `4a1d3ded` |
| #2398 | FINAL-4 | `93369bd9` |
| #2399 | FINAL-5 | `c0f5de61` |
| #2400 | FINAL-6 | `209f7bfc` |
| this | AUDIT | sync |

## PRODUCTION SMOKE TESTS

`/` · `/mushaf` · `/mushaf/bookmarks` · `/quran-hub` · `/search` · `/prayer-times` · `/api/healthz` · `/version.json` → HTTP 200.

## ROLLBACK EVENTS

None.

## REMAINING FIXABLE_IN_REPOSITORY

None material/undeclared for live mushaf after FINAL-1…6. Residual CSS debt KEEP_JUSTIFIED / SAFE_REMOVE_CANDIDATE outside Quran geometry.

## KEEP_JUSTIFIED / MUSHAF_SPECIAL / DEVICE_REQUIRED / OWNER_ACTION

ControlsLayer native chrome · Madinah archive paths · Device QA · Owner App Store / native widgets.

## FINAL STATUS

**MUSHAF_REPOSITORY_CLOSURE_COMPLETE_DEVICE_HOLD** · **WEB_RELEASED_NATIVE_HOLD**  
Not claiming: MUSHAF_SILKY · DEVICE_TESTED · ZERO_RISK · FULLY COMPLETE · STORE GO · WCAG CERTIFIED.
