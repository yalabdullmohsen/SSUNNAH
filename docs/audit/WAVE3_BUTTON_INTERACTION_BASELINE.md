# WAVE3 — Button / Semantic Interaction Baseline (حي)

| Field | Value |
|---|---|
| Captured | 2026-09-30T07:29Z |
| Base | `origin/main` `4c8acff6a` |
| Production | `4c8acff6` **MATCH** |
| WAVE2 gate | **WAVE2_MERGED_AND_DEPLOYED** · page `*-legacy.css` = 0 |
| Branch | `cursor/final-repo-closure-wave3` |
| Worktree | `/tmp/majlis-final-closure-wave3` |
| Method | `interaction-system-inventory.mjs` + TSX `<button` scan |

## Gate check (start)

| Check | Result |
|---|---|
| WAVE2 on main | ✅ `cfca1a68f` + docs seal `4c8acff6a` |
| Prod MATCH | ✅ |
| Page legacy imports | ✅ none |
| Critical Home/Lessons/Prayer/Mushaf regression | none known at start |
| Debt ceilings raised | ❌ no |

## Live interaction metrics

| Metric | Live | Ceiling (budget) |
|---|---:|---:|
| tsxFiles | 825 | — |
| rawButtonFiles | **211** | ≤211 |
| rawButtonElements | **910** | ≤910 |
| officialButtonImportFiles | **153** | ≥153 |
| iconButtonConsumerFiles | 31 | — |
| actionButtonConsumerFiles | 7 | ≥7 |
| divSpanOnClick | **59** | ≤59 |
| formButtonsMissingType | **0** | ≤0 |
| floatingControlFileMentions | 10 | ≤10 |
| buttonRelatedImportantApprox | 1262 | ≤1262 |
| buttonRelatedHexApprox | **1728** | ≤1728 |

## Top public raw `<button>` targets (in WAVE3)

| n | File | Class |
|---:|---|---|
| 22 | `components/quiz-game/IslamicQuizGame.tsx` | PUBLIC |
| 18 | `views/VaultPage.tsx` | PUBLIC |
| 13 | `views/MyCitationsPage.tsx` | PUBLIC |
| 11 | `views/ProphetStoriesPage.tsx` | PUBLIC |
| 11 | `pages/library/ui/ScholarlyResearchView.tsx` | PUBLIC |
| 10 | `pages/library/ui/ReadingPlansView.tsx` | PUBLIC |
| 8 | `views/FamilyModePage.tsx` | PUBLIC |
| 7 | `views/MindMapPage.tsx` | PUBLIC |
| 6 | `views/CalendarPage.tsx` | PUBLIC |
| 5 | `views/CardsPage.tsx` | PUBLIC |
| 5 | `views/UniversitiesPage.tsx` | PUBLIC |
| ≤4 | AdabTalabIlm · CitationPublic · DiscoverIslamQuestions · NationDetail · … | PUBLIC |

## Excluded from WAVE3

| Class | Examples |
|---|---|
| ADMIN_ONLY | `views/admin/**` · SubmissionsReviewPanel |
| MUSHAF_SPECIAL | `features/mushaf-reader/**` · `features/mushaf-madinah/**` · MushafBookmarksView |
| CLASSIFY_FIRST | `QuranViewer` · memorization/mini-player (quran chrome — not general public pages) |

## Scope Manifest

**In:** priority public pages above + their local div/span onClick + duplicated page button CSS with consumer=0 after port.

**Out:** Admin · Mushaf internals · Prayer calc · Critical CSS · Feedback matrix · WAVE4+.

**Acceptance:** clear drop in rawButtonFiles/Elements · official Button floors held · formButtonsMissingType=0 · no Button↔Link misuse · verify:ci + visual-snapshot + contrast PASS · prod MATCH.

## IMPLEMENTATION_FROZEN

Files open for patch (no further scope expansion except A-class regression from this wave):

- `IslamicQuizGame.tsx`
- `VaultPage.tsx`
- `MyCitationsPage.tsx`
- `ProphetStoriesPage.tsx`
- `ScholarlyResearchView.tsx`
- `ReadingPlansView.tsx`
- `FamilyModePage.tsx`
- `MindMapPage.tsx`
- `CalendarPage.tsx`
- `CardsPage.tsx`
- `UniversitiesPage.tsx`
- `ArkanIslamPage.tsx`
- `CitationPublicPage.tsx`
- `DiscoverIslamQuestionsPage.tsx`
- `PropheticMedicinePage.tsx`
- `NationDetailPage.tsx`
- `AdabTalabIlmPage.tsx`
- `WasayaNabawiyyaPage.tsx`
- `RaqaiqPage.tsx`
- related gates/budgets/docs (`closure-wave3-button-semantic-gate`, debt budgets, WAVE3 reports)

**Post-migration live:** rawButtonFiles **192** · rawButtonElements **774** · officialButtonImportFiles **172**
