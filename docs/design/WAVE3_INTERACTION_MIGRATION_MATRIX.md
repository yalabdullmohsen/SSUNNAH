# WAVE3 — Interaction Migration Matrix

Base: `origin/main` `4c8acff6a` · Branch: `cursor/final-repo-closure-wave3`  
Policy: classify before migrate · Button ≠ Link · no Mushaf/Admin internals

## Classification legend

| Code | Meaning |
|---|---|
| USE_BUTTON | Canonical `@/components/ui/button` |
| USE_LINK | Wouter `Link` / `<a href>` navigation |
| EVENT_DELEGATION | Container click for dismiss/stopPropagation |
| NATIVE_BUTTON_JUSTIFIED | Kept raw (outside WAVE3 or special) |
| MUSHAF_SPECIAL / ADMIN_ONLY | Excluded |

## Migrated files (all USE_BUTTON unless noted)

| File | Raw before | Decision | Notes |
|---|---:|---|---|
| `components/quiz-game/IslamicQuizGame.tsx` | 22 | USE_BUTTON | Setup chips, board, choices, lifelines, winner — `variant="ghost"` + page `qzg-*` |
| `views/VaultPage.tsx` | 18 | USE_BUTTON | Tabs, notes CRUD, guest bookmarks; destructive confirm added |
| `views/MyCitationsPage.tsx` | 13 | USE_BUTTON | Filters / actions |
| `views/ProphetStoriesPage.tsx` | 11 | USE_BUTTON | Story controls |
| `pages/library/ui/ScholarlyResearchView.tsx` | 11 | USE_BUTTON | `type="submit"` preserved; loading disables |
| `pages/library/ui/ReadingPlansView.tsx` | 10 | USE_BUTTON | Plan actions |
| `views/FamilyModePage.tsx` | 8 | USE_BUTTON | Mode / copy actions |
| `views/MindMapPage.tsx` | 7 | USE_BUTTON | Map controls |
| `views/CalendarPage.tsx` | 6 | USE_BUTTON | Calendar controls |
| `views/CardsPage.tsx` | 5 | USE_BUTTON | Export / template |
| `views/UniversitiesPage.tsx` | 5 | USE_BUTTON | Search `type="submit"` preserved |
| `views/ArkanIslamPage.tsx` | 2 | USE_BUTTON | |
| `views/CitationPublicPage.tsx` | 3 | USE_BUTTON | |
| `views/DiscoverIslamQuestionsPage.tsx` | 3 | USE_BUTTON | |
| `views/PropheticMedicinePage.tsx` | 1 | USE_BUTTON | |
| `views/NationDetailPage.tsx` | 3 | USE_BUTTON | |
| `views/AdabTalabIlmPage.tsx` | 4 | USE_BUTTON | |
| `views/WasayaNabawiyyaPage.tsx` | 2 | USE_BUTTON | |
| `views/RaqaiqPage.tsx` | 2 | USE_BUTTON | |

**Total:** 136 raw `<button>` → canonical `Button` · +19 official Button import files

## Button vs Link

| Case | Decision |
|---|---|
| Vault highlight «فتح» with `href` | USE_LINK (unchanged `Link`) |
| Vault bookmark title | USE_LINK |
| Error escape / browse CTAs (`href`) | USE_LINK |
| Quiz start / board / scoring | USE_BUTTON |
| Form search submit | USE_BUTTON `type="submit"` |

## Non-semantic (justified remaining in scope)

| File | Line (approx) | Class | Reason | A11y |
|---|---|---|---|---|
| `VaultPage.tsx` | backdrop | EVENT_DELEGATION | Modal dismiss on backdrop | `role="presentation"`; close Icon/Button inside |
| `VaultPage.tsx` | dialog | EVENT_DELEGATION | `stopPropagation` on dialog surface | dialog has `role="dialog"` + labelled close |
| `CalendarPage.tsx` | backdrop | EVENT_DELEGATION | Modal dismiss | same pattern |

## Exclusions

| Class | Paths |
|---|---|
| ADMIN_ONLY | `views/admin/**` |
| MUSHAF_SPECIAL | `features/mushaf-reader/**`, `features/mushaf-madinah/**`, Mushaf bookmarks chrome |
| CLASSIFY_FIRST | `QuranViewer`, mini-player internals |

## Required tests

- `closure-wave3-button-semantic-gate.test.ts`
- `test:interaction-system-debt-budget`
- `test:interaction-system-authority`
- `test:sunnah-ui-refinement`
- quiz-game integrity (no content change)
- verify:preflight · verify:ci · release:verify
