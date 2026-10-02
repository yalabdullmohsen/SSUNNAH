# T-043 — U6 Card Authority Report

| Field | Value |
|-------|-------|
| Phase | `T-043 U6_CARD_AUTHORITY` |
| Date (UTC) | `2026-10-02` |
| Base | `origin/main` @ T-041 + merged T-042 U5 tip |
| Evidence | `docs/audit/evidence/t043-u6-card-authority/` |
| Exit | **`CARD_AUTHORITY_ONLY`** → **PASS** |

Allowed surfaces only: `AppCard` · `InteractiveCard` · `StatusCard` · `SectionEntryCard` · `ElevatedSurface` · `InsetSurface` (+ documented façades ContentCard/CardSystem/FeatureCard over AppCard).  
No new Card System · No soft-card-v3 · No new shadow/radius tokens · Mushaf reader / prayer engine untouched · Admin not used to close product debt.

Prerequisite: `docs/audit/U5_BUTTON_AUTHORITY_REPORT.md` = `BUTTON_AUTHORITY_ONLY`.

---

## 1. Card Inventory

### soft-card / SoftCard

| Metric | Before (wave baseline) | After |
|--------|------------------------:|------:|
| soft-card ref files | ~104–107 | **104** (CSS + tests) |
| soft-card refs (all) | 340 | **340** (compat selectors) |
| SoftCard component | 0 | **0** |
| **TSX `soft-card` className consumers** | **0** | **0** |

Classification of remaining soft-card mentions: **KEEP_JUSTIFIED** (CSS compat remaps / token aliases) or **DEAD_PROVEN** (gates asserting absence). Itemized: `evidence/t043-u6-card-authority/inventory-after.json`.

### Other legacy families (pre → post)

| Family | Decision | Outcome |
|--------|----------|---------|
| `RelatedContentCard` | MIGRATE → InteractiveCard | Migrated |
| `SectionCard` | MIGRATE → InteractiveCard | Migrated |
| `FeaturedSectionCard` / `HeroActionCard` | MIGRATE → InteractiveCard | Migrated |
| `ReadingSectionCard` (static) | MIGRATE → AppCard | Migrated (accordion KEEP structure) |
| `UnifiedLessonCard` | MIGRATE → AppCard | Migrated |
| `FeatureCard` | KEEP_JUSTIFIED | Already AppCard façade |
| `HadithCard` | KEEP_JUSTIFIED | Already AppCard |
| `SectionEntryCard` / HubCard | KEEP_JUSTIFIED | Authority navigation entry |
| `cs-card` on AppCard | KEEP_JUSTIFIED | Authority surface class |
| CSS `.section-card` / `.feature-card` / `.soft-card` | KEEP_JUSTIFIED | Stylesheets / remaps; no rogue TSX family |
| Admin card UI | ADMIN_ONLY | Boundary held |
| Mushaf cards | MUSHAF_SPECIAL | Reader not rewritten |

---

## 2. Migration Summary

| Component | From | To |
|-----------|------|-----|
| RelatedContentCard | bare `Link` + `cs-card` | `InteractiveCard` |
| SectionCard | `Button` + `.card.cs-card` | `InteractiveCard` (+ prefetch / soon) |
| HeroActionCard | `Button` + `.card--featured` | `InteractiveCard` |
| ReadingSectionCard | raw `<section>` | `AppCard` |
| UnifiedLessonCard | raw `<article cs-card>` | `AppCard` |

Card CSS radii in hub/reading/knowledge/hadith/source/information/university cards: raw `px` → `--sf-radius-*` / `--cs-radius-*` / `--sf-radius-pill`.

---

## 3. Exceptions

| Exception | Justification |
|-----------|---------------|
| CSS `.soft-card` selectors (~284 KEEP refs) | COMPAT remap only; **0** product TSX emitters (SOFT_CARD_RETIREMENT_WAVE3 held) |
| Accordion `ReadingSectionCard` (`<details>`) | Structural disclosure; not a parallel card family surface |
| `FeatureCard` / ContentCard / CardSystem | Documented hierarchy façades over AppCard |
| Admin | ADMIN_ONLY — not used to close global debt |
| QuranOpenMushafCard `data-section-card` | MUSHAF_SPECIAL — open-mushaf entry; no reader rewrite |

---

## 4. Mushaf Review

- No reader rendering / Quran layout / page structure edits.
- Mushaf-adjacent open card left as MUSHAF_SPECIAL.

---

## 5. Prayer Review

- No prayer calculations, scheduling, or engine edits.

---

## 6. Visual Debt Impact

| Metric | Before | After | Δ |
|--------|------:|------:|--:|
| boxShadowDecls | 1113 | **1113** | 0 |
| borderRadiusPxDecls | 1258 | **1243** | **−15** |
| zIndexRawDecls | 258 | **258** | 0 |

Ceilings lowered for `borderRadiusPxDecls` (decreasing-ceilings). No budget raise.  
Documented floor exception: `officialButtonImportFiles` 255→253 because SectionCard/HeroActionCard moved from `Button` to `InteractiveCard` (Link navigation = correct Card Authority).

---

## 7. Final Metrics

| Check | Result |
|-------|--------|
| TSX soft-card consumers | **0** |
| Migrated product card façades | **5** |
| Unjustified external card families | **0** |
| Interaction: nav cards | Link via InteractiveCard; focus/keyboard native |
| Hover / touch | `mj-pressable` / AppCard focus-visible retained |

---

## 8. Exit Decision

| Condition | Status |
|-----------|--------|
| CARD_AUTHORITY_ONLY | **PASS** |
| No Card Families outside authority except KEEP_JUSTIFIED | **PASS** |
| No new card/soft-card-v3/surface framework | **PASS** |
| Visual debt not raised | **PASS** (radius ↓) |
| Mushaf / Prayer / Admin boundaries | **HELD** |

### Final Decision

**PASS** — `CARD_AUTHORITY_ONLY`

Do not start U7 Back Authority / U8 Deferred Identity / U9 Route Matrix / Store Readiness / TestFlight until this exit is on `main` and the next phase is explicitly opened.

```
CARD_AUTHORITY=CARD_AUTHORITY_ONLY
U7_U9=NOT_STARTED
```
