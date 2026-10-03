# USER_JOURNEY_OPTIMIZATION_PLAN — سُنّة

| Field | Value |
|---|---|
| Status | **PLAN** |
| Date | 2026-10-03 |
| Exit | `USER_JOURNEY_SIMPLIFICATION` (plan-complete this phase) |
| Branch | `cursor/visual-unification-wave` |

**Goal:** Reduce friction on the four highest-value journeys without inventing a new IA framework.

## Journeys

### J1 — Open app → read Quran

| Step | Current path (product) | Friction / risk | Optimization |
|---|---|---|---|
| 1 | Home / bottom nav «القرآن» | Competing CTAs on home | Keep Quran Hub as primary hub card |
| 2 | Quran Hub | Extra hops to Mushaf | One clear «افتح المصحف» CTA |
| 3 | Mushaf | Immersive SPECIAL_CASE | Preserve chrome; avoid stacking FABs |
| Measure | clicks to first ayah visible | Target ≤ 3 from cold home | Instrument later (DEVICE_REQUIRED) |

### J2 — Open app → prayer times

| Step | Current path | Friction | Optimization |
|---|---|---|---|
| 1 | Home / bottom nav «الصلاة» | Location permission dead-end | Offline + last-known + clear recovery copy |
| 2 | Prayer times | Dense chrome | Keep SPECIAL_CASE; empty/error via Feedback V2 |
| Measure | clicks to next prayer visible | Target ≤ 2 | — |

### J3 — Open app → search lesson

| Step | Current path | Friction | Optimization |
|---|---|---|---|
| 1 | Search entry (nav / home) | Duplicate search UIs | `SearchInput` authority only |
| 2 | Query → results | Empty without nextStep | `EmptyStateV2` + CTA «تصفح الدروس» |
| 3 | Lesson detail | Back inconsistency | `AppBackButton` |
| Measure | clicks to open a lesson | Target ≤ 4 | — |

### J4 — Open app → continue learning

| Step | Current path | Friction | Optimization |
|---|---|---|---|
| 1 | Home continue card / lessons | Missing resume target | Single «تابع» surface |
| 2 | Lesson / path | Dead ends after complete | Explicit next lesson CTA |
| Measure | clicks to resume content | Target ≤ 3 | — |

## Cross-cutting friction to eliminate

- Duplicate actions (FAB + in-page CTA for same goal)
- Dead ends without `EmptyStateV2` recovery
- Parallel search/filter chrome
- Floating-back fighting in-page back

## Non-claims / DEVICE_REQUIRED

Click counts above are **targets** for future measurement — this phase ships the plan + authority alignment only. No UNIFIED_100.
