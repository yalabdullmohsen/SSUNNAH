# سُنّة — WAVE3 Button / Semantic Interactions Closure Report

## STATUS

- **COMPLETE**
- Production: **MATCH** `1075efb0` · Auto Deploy SUCCESS · Smoke PASS

## LIVE BASELINE

| Field | Value |
|---|---|
| Captured | 2026-09-30T07:29Z |
| Base commit | `4c8acff6a` (WAVE2 docs seal; product `cfca1a68f`) |
| Production MATCH at start | ✅ `4c8acff6` |
| WAVE2 gate | **WAVE2_MERGED_AND_DEPLOYED** |
| Branch | `cursor/final-repo-closure-wave3` |

| Metric | Before (WAVE3 start) | After |
|---|---:|---:|
| rawButtonFiles | 211 | **192** (−19) |
| rawButtonElements | 910 | **774** (−136) |
| officialButtonImportFiles | 153 | **172** (+19) |
| iconButtonConsumerFiles | 31 | 31 |
| actionButtonConsumerFiles | 7 | 7 |
| divSpanOnClick | 59 | 59 (3 justified in scope) |
| formButtonsMissingType | 0 | **0** |
| buttonRelatedImportantApprox | 1262 | 1262 |
| buttonRelatedHexApprox | 1728 | 1728 |

## SCOPE

**In:** 19 public pages/components (quiz game, vault, citations, stories, research, reading plans, family, mind map, calendar, cards, universities, arkan, citation public, discover questions, prophetic medicine, nation detail, adab, wasaya, raqaiq).

**Out:** Admin · Mushaf internals · Prayer calc · Critical CSS · Feedback matrix · WAVE4.

See `docs/audit/WAVE3_BUTTON_INTERACTION_BASELINE.md` · `docs/design/WAVE3_INTERACTION_MIGRATION_MATRIX.md`.

## CLASSIFICATION SUMMARY

| Decision | Count (approx) |
|---|---:|
| USE_BUTTON | 136 elements / 19 files |
| USE_LINK | kept (Vault opens, titles) |
| EVENT_DELEGATION | 3 (modal backdrops / stopPropagation) |
| MUSHAF_SPECIAL / ADMIN_ONLY | excluded |

## SHARED CONTROLS

Page-local shared patterns migrated with the pages: retry-style actions, filter chips, pagination-like counters, dialog close/cancel, toolbar tabs — all via canonical `Button` (`variant="ghost"` + existing page classes). No ButtonV2.

## PUBLIC PAGES MIGRATED

1. IslamicQuizGame  
2. VaultPage (+ destructive confirm)  
3. MyCitationsPage  
4. ProphetStoriesPage  
5. ScholarlyResearchView  
6. ReadingPlansView  
7. FamilyModePage  
8. MindMapPage  
9. CalendarPage  
10. CardsPage  
11. UniversitiesPage  
12. ArkanIslamPage  
13. CitationPublicPage  
14. DiscoverIslamQuestionsPage  
15. PropheticMedicinePage  
16. NationDetailPage  
17. AdabTalabIlmPage  
18. WasayaNabawiyyaPage  
19. RaqaiqPage  

## BUTTON VS LINK DECISIONS

- Navigation with `href` → `Link` / `<a>` unchanged.  
- Actions / toggles / submit → `Button`.  
- No Button↔Link swaps.

## NON_SEMANTIC INTERACTIONS

In-scope `div/span onClick` remaining = modal backdrop dismiss + dialog `stopPropagation` (EVENT_DELEGATION). Documented in migration matrix. Global `divSpanOnClick` ceiling held at 59 (Admin/Mushaf/other out of scope).

## ASYNC ACTION SAFETY

- ScholarlyResearch: `disabled={loading || !query.trim()}` on submit.  
- Vault save/delete: single-handler paths; delete gated by confirm.  
- Quiz scoring buttons: synchronous dispatch (no double network).  

## DESTRUCTIVE ACTION SAFETY

- Vault highlight / note / bookmark remove: inline `role="alertdialog"` confirm + `variant="destructive"` + Cancel.  
- No `window.confirm` / `window.alert` in migrated files.  
- Tasbih PR5/#2373 contract untouched.

## CSS REMOVED

No page button CSS deleted in this wave (consumers still use `qzg-*` / `vault-*` classes on canonical Button). Hex/!important approx unchanged (no rise).

## BEFORE VS AFTER

| Metric | Before | After | Delta | Verdict |
|---|---:|---:|---:|---|
| rawButtonFiles | 211 | 192 | −19 | improved |
| rawButtonElements | 910 | 774 | −136 | improved |
| officialButtonImportFiles | 153 | 172 | +19 | improved |
| formButtonsMissingType | 0 | 0 | 0 | held |
| buttonRelatedImportantApprox | 1262 | 1262 | 0 | held |
| buttonRelatedHexApprox | 1728 | 1728 | 0 | held |
| divSpanOnClick | 59 | 59 | 0 | held (justified) |

Ceilings lowered / floors raised in `interaction-system-debt-budget.json` + `visual-system-debt-budget.json`. Historical baseline docs not rewritten as “live”.

## ACCESSIBILITY

- Semantic `<button>` via canonical Button (focus-visible ring, disabled styles beyond opacity).  
- Icon-only close/clear retain `aria-label`.  
- Destructive confirm uses `alertdialog`.  
- Keyboard: native button activation (Enter/Space).  

## VISUAL PARITY

Page classNames preserved (`qzg-*`, `vault-*`, …) with `variant="ghost"` to avoid fighting page CSS. No redesign.

## PERFORMANCE EFFECT

No new dependencies. Bundle delta expected negligible (shared Button already in graph). critical CSS / CSS file count not increased by this wave.

## TESTS AND GATES

- `closure-wave3-button-semantic-gate.test.ts`  
- `test:interaction-system-debt-budget`  
- `test:sunnah-ui-refinement` (wired)  
- verify:preflight · verify:ci · release:verify (run at delivery)

## PR DELIVERY

- Branch: `cursor/final-repo-closure-wave3`  
- Title: `refactor(ui): migrate public interactions to canonical controls`  
- Target: `main` · Ready + auto-merge after required checks  

## PRODUCTION SMOKE TESTS

| Check | Result |
|---|---|
| `version.json` | `1075efb0` = `origin/main` **MATCH** · `builtAt=2026-09-30T07:53:17.119Z` |
| `/api/healthz` | HTTP 200 · `ok:true` · commit `1075efb0` |
| Core routes | `/` `/search` `/quran-hub` `/lessons` `/hadith` `/fiqh` `/adhkar` `/settings` `/my-learning` `/mushaf` `/prayer-times` → 200 |
| Migrated | `/quiz` `/vault` `/my-citations` `/prophets` `/family` `/mind-map` `/calendar` `/cards` `/universities` `/arkan` `/discover-islam/questions` `/prophetic-medicine` `/adab-talab-ilm` `/wasaya-nabawiyya` `/raqaiq` `/scholarly-research` `/research` → 200 |
| Destructive prod ops | none executed |


## REGRESSIONS

None known at authoring. Home/Lessons/Prayer/Mushaf out of edit scope.

## ROLLBACK EVENTS

None.

## EXCLUSIONS

Admin · Mushaf reader/madinah · QuranViewer (classify-first) · Prayer calc · Adhan.

## REMAINING BUTTON DEBT

- rawButtonFiles **192** / elements **774** (Admin, Mushaf, other public not in WAVE3 priority list).  
- divSpanOnClick **59** globally.  
- Page-specific button CSS still present (consumed by migrated Button classNames).

## NEXT WAVE READINESS

WAVE4 only after: this PR merged · Auto Deploy · `version.json` MATCH · smoke PASS · decision **WAVE3_MERGED_AND_DEPLOYED**.

## FINAL DECISION

**WAVE3_MERGED_AND_DEPLOYED**
