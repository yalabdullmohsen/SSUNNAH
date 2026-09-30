# WAVE10 — Mushaf Control Semantic Closure Report

| Field | Value |
|---|---|
| Branch | `cursor/final-repo-closure-wave10` |
| Baseline tip | `7304cbeb` (= production MATCH post-WAVE9) |
| Status | **IMPLEMENTED** |

## IMPLEMENTATION_FROZEN (WAVE10)

| | |
|---|---|
| **Goal** | Align live Mushaf chrome/controls with semantic authority (type · accessible name · Button adoption where safe) without reopening WAVE6 geometry/state machine |
| **Files** | QuranMiniPlayerBar · Mushaf bookmark sheets/composer/markers · wave10 gate · this report |
| **Tests** | wave10-mushaf-controls · mushaf CSS boundary · WAVE6 fluidity gate · quran checksum/page mapping via verify:ci |
| **Out** | Quran text · page mapping · 604 · font mapping · WAVE6 page-turn machine · Madinah delete · new Button system |

## Classification

| Surface | Class | Notes |
|---|---|---|
| `features/mushaf-reader/MushafControlsLayer` | MUSHAF_SPECIAL_KEEP | Already `type` + `aria-label`/text; chrome CSS tightly coupled — keep native `<button>` |
| `NewMushafReader` | LIVE | Untouched (WAVE6 contracts) |
| `QuranMiniPlayerBar` | USE_BUTTON | Migrated to canonical `Button` |
| Mushaf bookmark sheet/composer/markers | USE_BUTTON | Migrated to canonical `Button` |
| `features/mushaf-madinah/*` (AyahActionSheet, SearchSheet, AudioDock, …) | LEGACY_NOT_LIVE | Archived reader; not production `/mushaf` entry |
| Page arrows / scrubber / display mode | MUSHAF_SPECIAL_KEEP | Semantic OK; geometry untouched |
| QuranViewer (if any flat legacy) | LEGACY_NOT_LIVE / NOT_APPLICABLE | Not the live reader entry |

## Changes

1. `QuranMiniPlayerBar` → `Button` (preserve `quran-mini-player__*` classes).
2. Bookmark sheet/composer/markers → `Button`.
3. Gate `closure-wave10-mushaf-controls-gate.test.ts` enforces type + accessible name on live control files; Button on mini-player/bookmarks; ControlsLayer remains typed/named special chrome.
4. Madinah tree classified LEGACY_NOT_LIVE — no product migration this wave.

## Explicit non-touches

- Quran text / tashkeel / numbering
- 604 pages · 15-line geometry · page mapping · ayah positions · QPC fonts
- WAVE6 page-turn state machine / audio mapping / reading position contract

## Remaining

| Item | Class |
|---|---|
| ControlsLayer chrome `<button>` | MUSHAF_SPECIAL_KEEP |
| Madinah sheets raw buttons | LEGACY_NOT_LIVE |
| Device 25/100 turns · VoiceOver | DEVICE_REQUIRED |

## Verdict

WAVE10 closes semantic debt on live mini-player + bookmark controls, documents Mushaf chrome as justified special, and leaves WAVE6 performance contracts untouched.
