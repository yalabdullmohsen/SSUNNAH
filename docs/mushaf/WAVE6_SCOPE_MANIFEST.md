# WAVE6 — Scope Manifest

**Branch:** `cursor/final-repo-closure-wave6`  
**Base:** `origin/main` @ `03630aa8` (WAVE5 MERGED_AND_DEPLOYED)  
**Goal:** Improve Mushaf page-turn fluidity and reduce render/measurement cost without touching Quran text, mapping, or QPC font assets.

## In scope

| Area | Files | Action |
|---|---|---|
| Font prefetch | `useQpcPageFont.ts`, `NewMushafReader.tsx` | Page-only font wait; ±1 eager; ±2 idle + cancel; bounded queue |
| Telemetry | `mushaf-turn-telemetry.ts`, contract | WAVE6 metrics snapshot; disabled by default; no PII/Quran text |
| Page-turn SM | `mushaf-page-turn-phase.ts`, `NewMushafReader.tsx` | Document phases; one queued intent after visual settle; keep safety timeout |
| Gesture | `NewMushafReader.tsx` ignoreSelector | Allow swipe over text (use existing onAyah slop); keep control ignores |
| Selection | `AyahSelectionOverlay.tsx` | Invalidate cache on layout/container only; count measures |
| Gates / docs | wave6 gate · `r24-gate.mjs` page-font contract · baseline · device matrix · closure report | Contract locks |
| REPO_INDEX | one-line pointer | WAVE6 docs |

## Out of scope

WAVE7 identity · Admin · Prayer calc/Adhan · SQL/RLS · secrets · new fonts/sources · image mushaf · removing 3 sheets · budget raises · snapshot auto-update · store claims · Flutter/Expo

## Acceptance

1. Font requests deduped; no 604 preload; ±2 idle-gated  
2. Visual lock ≠ product lock documented; timeout not happy path  
3. Swipe-over-text arms pager; controls still ignored  
4. Telemetry off by default; no external send / PII / Quran text  
5. Integrity: checksum · 604 · mapping · measurements PASS  
6. verify:preflight · verify:ci · release:verify PASS  
7. PR merged · Auto Deploy · production MATCH main  
8. Real-device metrics remain DEVICE_REQUIRED  

## IMPLEMENTATION_FROZEN

**IMPLEMENTATION_FROZEN** — scope locked to files above. No expansion except Class-A regression from this diff.
