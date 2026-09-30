# WAVE5 — Scope Manifest

**Branch:** `cursor/final-repo-closure-wave5`  
**Base:** `origin/main` @ `24b513cab` (WAVE4 MERGED_AND_DEPLOYED)  
**Goal:** Widen Critical CSS margin; close FOUC/theme-flash/CLS/startup regressions fixable in-repo; prevent reintroduction.

## In scope

| Area | Action |
|---|---|
| Critical CSS | Remove DEAD_PROVEN rules from sync `index.css`; measure gzip L9; no budget raise |
| CSS import graph | Document sync/deferred/duplicates; allowlist cascade reimports |
| Theme boot | Keep `mj-theme-boot` ↔ Provider contract; no competing prefetch surface |
| Shell / Home / Prayer | Preserve existing geometry gates; no Prayer calc / Adhan changes |
| Chunk / SW | Keep quiet recovery · no technical toast · no reload loop |
| Gates | Duplicate-import allowlist · dead-class prevention · debt ceilings ↓ |
| Docs | Baseline · graph · closure report |

## Out of scope

WAVE6 Mushaf smoothness · Quran text/page mapping · Prayer calculation/Adhan · Admin migration · broad Button/Legacy CSS · SQL/RLS · secrets · new features · redesign · snapshot auto-update · budget raises

## Acceptance

1. Critical gzip ≤ 61440 with margin **>** pre-WAVE5 1315 B  
2. Debt ceilings not raised (preferably lowered)  
3. verify:preflight · verify:ci · release:verify PASS  
4. visual-snapshot · contrast · LHCI · Mushaf/Quran gates PASS  
5. PR merged · Auto Deploy · production `version.json` MATCH main  
6. Production smoke PASS  

## IMPLEMENTATION_FROZEN

**IMPLEMENTATION_FROZEN** — 2026-09-30. Product patches + gates + docs landed. No scope expansion; verification/delivery only.
