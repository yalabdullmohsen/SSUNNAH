# Visual Batch 2 — Tables · Lists · Tabs · Nav · Search · Filters

Date: 2026-10-03 · Branch: `cursor/visual-batch2-tables-lists-tabs-nav-search-filters` · Base: `e4bb720fa` (#2493)

## Migrations

### Search → SearchInput (29 files / 35 fields)
Public fiqh/hadith/knowledge views: Hajj, Janaza, Mawarith, SalahGuide, Zakat, Arbaeen, HadithBooks, HadithScience, DuasQuran, Tahara, Sawm, Sahabah, Raqaiq, PropheticMedicine, Occasions, Mutashabihat, MindMap, Malaika, JannaNaar, IslamStats, Institutions, IslamicLandmarks, FadailAamal, AlamatSaah, AdabTalabIlm, WasayaNabawiyya, MyCitations, FiqhGuide, KnowledgeCollectionSystem.

Left SPECIAL/complex: GlobalSearchModal, HomeUniversalSearch, HadithSearch, QuranSearch, FiqhView clear chrome, Hikam/Sunan custom clear, prayer pickers.

### Tabs
- LoginView account mode → `ContentTabs` (pill) authority

### Tables
- MawarithCalculator shares grid → `ss-data-table` class (TABLE authority recipe)

### Debt absorption
- Soft `box-shadow: none` removed (identity/chrome/enrichment/final-release)
- Page radii 28/11/99/100/999px → `--sf-radius-*` / pill

## Metrics (vs Batch1 tip on main)

| Signal | Before | After |
|---|---:|---:|
| boxShadowDecls | 1010 | **986** |
| borderRadiusPxDecls | 429 | **392** |
| sfTokenRefs | 1090 | **1127** |
| DIY public search residual (excl. SPECIAL) | 42 | **13** (SPECIAL held) |

Ceilings lowered to measured values.

## Exits
- SEARCH_AUTHORITY_PROGRESS
- TAB_AUTHORITY_PROGRESS
- TABLE_AUTHORITY_PROGRESS
- FILTER_AUTHORITY_HELD
- LIST_AUTHORITY_HELD
- NAV_AUTHORITY_HELD
- DESIGN_DEBT_REDUCED
