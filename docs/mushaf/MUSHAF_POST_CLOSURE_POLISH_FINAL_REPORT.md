# MUSHAF POST-CLOSURE POLISH — FINAL REPORT

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| PR | #2402 → merge `37257cd19` |
| Production | `37257cd1` **MATCH** |
| Prior UX report | `docs/mushaf/MUSHAF_POST_CLOSURE_UX_POLISH_REPORT.md` |
| WAVE6 SM | **unchanged** |
| Quran integrity | no text/tashkeel/604/15-line/mapping/QPC changes |

## EXECUTIVE VERDICT

**PATCH_PARTIAL** for the polish program as a whole:

- Ayah number, divider delete, arrow/scrubber micro-latency, micro UX → **PATCH_COMPLETE** (on main + MATCH).
- Residual page-turn feel on physical devices → **DEVICE_REQUIRED**.

No further code change required in this seal PR; contracts verified on tip `37257cd19`.

## AYAH NUMBER

| Item | Result |
|---|---|
| Box `--mushaf-ayah-mark-size` | `1.15em` unchanged |
| Glyph `--mushaf-ayah-mark-number-size` | `1.10em` (~+10%) |
| Clarity | `geometricPrecision` + grayscale smoothing |
| Geometry / measure | mushaf gates PASS on tip |
| GOLD / Light / Dark contracts | gates PASS |

## DIVIDER DELETE

| Item | Result |
|---|---|
| Verse menu | «حذف الفاصل» when bookmarks exist |
| Confirm | in-app `alertdialog` — no `window.confirm` |
| Storage | `removeMyBookmark` + `bookmarkEpoch` |
| Manager | same confirm pattern |
| Double-delete | safe (idempotent remove) |
| Offline | local delete + status copy |
| Unit/gate | `mushaf-bookmark-ops-unit` · `mushaf-advanced-bookmarks-gate` PASS |

## PAGE TURN MICRO-LATENCY

| Path | Result |
|---|---|
| Arrows / scrubber | Removed `!neighborsReady` gate — `go()` waits target font only |
| WAVE6 SM / swipe locks | unchanged |
| Proven repo cause | FIXED |
| Residual compositor/FPS | **DEVICE_REQUIRED** — not guessed |

## MICRO UX

| Item | Result |
|---|---|
| Verse menu touch ≥44px | restored |
| Delete a11y names | present |
| Manager delete targets | ≥44px |

## INTEGRITY GATES (tip `37257cd19`)

- `mushaf-ayah-marker-refine-gate` PASS
- `mushaf-advanced-bookmarks-gate` PASS
- `mushaf-pager-recycle-gate` PASS
- `mushaf-bookmark-ops-unit` PASS
- Production smoke `/mushaf` HTTP 200

## REGRESSIONS

None observed in gates or production MATCH. Absolute bans held.

## FOLLOW-UPS

| Item | Class |
|---|---|
| Device FPS / 25×–100× turn matrix | DEVICE_REQUIRED |
| Touch→translate / unlock timings on device | DEVICE_REQUIRED |
| Further raw-button migration in MushafControlsLayer | Phase 3 (MUSHAF_SPECIAL) |

## FINAL STATUS

**MUSHAF_POST_CLOSURE_POLISH = COMPLETE_DEVICE_HOLD**

Code + deploy closed. Device residual open and classified.
