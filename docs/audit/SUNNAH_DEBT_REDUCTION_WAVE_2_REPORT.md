# سُنّة — Debt Reduction Wave 2 Report

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Base | `cursor/debt-reduction-w1` (#2354 tip) + Wave 2 |
| Product state | **WEB_RELEASED_NATIVE_HOLD** |
| Visual/Interaction | **VISUAL_INTERACTION_PARTIAL** |

Forbidden claims for this wave: STORE GO · VISUAL_INTERACTION_COMPLETE_WEB · SUNNAH_FULL_REMEDIATION_COMPLETE.

## Inventory — before (#2354 tip) vs after Wave 2

Measured via `rg` + `visual-system-inventory.mjs` / `interaction-system-inventory.mjs` (no estimates).

| Metric | Before (#2354 tip) | After Wave 2 | Class |
|---|---:|---:|---|
| Soft-card product TSX consumers | 52 | **0** | COMPLETED |
| Native `<select>` files (tsx) | 67 | **57** | IMPROVED |
| Raw `<button>` files | 230 | **229** | IMPROVED |
| Raw `<button>` elements | 992 | **983** | IMPROVED |
| mj-outside allowlist (`mjDeclOutsideAllowlist`) | 40 | **40** | UNCHANGED |
| soft-cards.css import | present | present (AppCard bridge) | UNCHANGED |
| Visual debt ceilings raised? | — | **No** | COMPLETED |
| New token/card/button systems? | — | **No** | COMPLETED |

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1 Soft cards | **COMPLETED** (consumers=0) | Import KEEP; see Soft Card Consumer Map |
| 2 Native select | **IMPROVED** | Public: Institutions, Landmarks, Universities, Nations, Submit, DiscoverIslam Contact, Upload, KnowledgeGraph, AcademicResearch, ResearcherProfile → Radix Select + FieldLabel |
| 3 Raw buttons | **IMPROVED** | Careful only; see BUTTON_DEBT_PROGRESS |
| 4 Token absorb | **UNCHANGED** | mj-outside stays 40 |
| 5 Legacy CSS | **IMPROVED** | card-system / lessons / calendar-render no longer require `.soft-card` compound; no file deleted (consumer≠0 for legacy CSS trees) |
| 6 Critical CSS | **IMPROVED** | Comment trim in theme-aliases/calm → gzip 61340 ≤ 61440; no FOUC |
| 7 Route matrix | **IMPROVED** | Critical hubs + worship companions + key mushaf/quran/search closed (COMPLETE) |
| 8 Mushaf UI tokens | **UNCHANGED** | No Quran text/mapping/checksum touch |
| 9 Inventory | **COMPLETED** | This table |
| 10 Verification | **COMPLETED** | verify:preflight + verify:ci + release:verify PASS |
| 11 Report | **COMPLETED** | This file |

## Security / quality

- Fixed W1 CI root cause: chip tokens asserts → `theme-aliases.css` (`mobile-back-lesson-chips-gate`).
- Soft-card soft-gates updated to authority (no force of retired classNames).
- No hex / `!important` / budget raises.
- Safe soft-card strip: token removal only (no global `""` cleanup).

## FINAL TRUTH (one label)

**WEB_RELEASED_NATIVE_HOLD**

with visual/interaction still:

**VISUAL_INTERACTION_PARTIAL**
